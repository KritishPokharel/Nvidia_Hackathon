from flask import Flask, jsonify
from elevenlabs import ElevenLabs
from openai import OpenAI
import threading, time, json, re

from dotenv import load_dotenv
import os

# Load variables from .env
load_dotenv()

ELEVEN_API_KEY = os.getenv("ELEVEN_API_KEY")
AGENT_ID = os.getenv("AGENT_ID")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1"

# Flask app
app = Flask(__name__)
from flask_cors import CORS

CORS(app)  # Shared state
orders_store = []  # list of processed orders
processed_ids = set()  # to avoid reprocessing

eleven = ElevenLabs(api_key=ELEVEN_API_KEY, base_url="https://api.elevenlabs.io")
nvidia = OpenAI(api_key=NVIDIA_API_KEY, base_url=NVIDIA_BASE_URL)


def extract_order_json(transcript_text: str):
    """Send transcript to NVIDIA LLM and extract structured JSON order"""
    prompt = f"""
Read the customer's restaurant order transcript below and return a structured JSON that follows this schema exactly. Return only JSON, dont include any description or think tag before or after.

### Rules
- Output **only JSON** — no text before or after.
- Use lowercase keys.
- If quantity not specified, assume 1.
- Each item must include: item name and quantity.
- Include any global special instructions (like "pack separately" or "make spicy").
- Set `order_confirmed` to true if an order was clearly placed.
- All fields below must appear, even if null.

### JSON SCHEMA
{{
  "customer_name": "string or Unknown",
  "contact_number": "string or null",
  "items_ordered": [
    {{
      "item": "string",
      "quantity": int
    }}
  ],
  "special_instructions": "string or null",
  "payment_status": "paid | not_paid",
  "order_confirmed": true
}}

### Transcript
{transcript_text}
"""

    messages = [
        {
            "role": "system",
            "content": (
                "You are a restaurant order extraction AI. "
                "You must output only a single valid JSON object. "
                "Do NOT include <think> tags, explanations, markdown, or any text outside JSON."
            ),
        },
        {"role": "user", "content": prompt},
    ]

    completion = nvidia.chat.completions.create(
        model="nvidia/llama-3.3-nemotron-super-49b-v1.5",
        messages=messages,
        temperature=0.0,
        max_tokens=2048,
    )

    raw_output = completion.choices[0].message.content.strip()

    # Clean traces
    clean = re.sub(r"<think>.*?</think>", "", raw_output, flags=re.S)
    clean = re.sub(r"```json|```", "", clean).strip()
    match = re.search(r"\{.*\}", clean, flags=re.S)

    if not match:
        return {"error": "No valid JSON found in model output"}

    try:
        data = json.loads(match.group(0))
        return data
    except json.JSONDecodeError:
        return {"error": "JSON parsing failed", "raw": clean}


def process_conversations():
    """Continuously poll ElevenLabs for new conversations and process once"""
    global orders_store, processed_ids

    while True:
        try:
            response = eleven.conversational_ai.conversations.list()

            for conv in response.conversations:
                conv_id = conv.conversation_id
                if conv_id in processed_ids:
                    continue  # skip already processed conversations

                conversation = eleven.conversational_ai.conversations.get(
                    conversation_id=conv_id
                )
                data = conversation.model_dump()

                # Build transcript string
                transcript_text = " ".join(
                    turn["message"].strip()
                    for turn in data.get("transcript", [])
                    if turn.get("message")
                )

                if transcript_text.strip():
                    print(f"\n🧠 New conversation found → {conv_id}")
                    result_json = extract_order_json(transcript_text)
                    result_json["conversation_id"] = conv_id
                    orders_store.append(result_json)
                    processed_ids.add(conv_id)
                    print(f"✅ Processed and stored order {conv_id}")

        except Exception as e:
            print("⚠️ Error fetching or processing conversations:", e)

        time.sleep(1)  # Poll interval


@app.route("/orders", methods=["GET"])
def get_all_orders():
    """Return all processed orders as JSON list"""
    return jsonify({"total_orders": len(orders_store), "orders": orders_store})


def start_background_thread():
    thread = threading.Thread(target=process_conversations, daemon=True)
    thread.start()


if __name__ == "__main__":
    start_background_thread()
    app.run(host="0.0.0.0", port=8000)
