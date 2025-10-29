# 🍕 AI Restaurant Order Agent (Full Demo)

This project demonstrates a **real-time AI-powered restaurant phone ordering system** built with voice AI, LLM parsing, and a Flask backend.  
Users can call a number, talk to an AI agent naturally, and see their orders converted into structured JSON instantly.

---

## 📞 Live Demo

### To Try It Out:
1. **Call this number:**  
   📱 **775-522-7210**  
   *(Free demo — press `1` when prompted)*

2. **Talk to the AI Agent:**  
   Try saying something like:  
   > “Hey, I’d like two cheese pizzas without onions and one Coke.”

3. **See Your Order JSON:**  
   Once processed, your live structured output will appear here:  
   👉 [https://1440ad55bcf3.ngrok-free.app/orders](https://1440ad55bcf3.ngrok-free.app/orders)

---

## 💡 Example JSON Output

```json
{
  "orders": [
    {
      "contact_number": "202-873-6662",
      "conversation_id": "conv_9501k8pmesvdfq7t70ksc0tss9zk",
      "customer_name": "Critis",
      "items_ordered": [
        {
          "item": "cheese pizza",
          "quantity": 2
        }
      ],
      "order_confirmed": true,
      "payment_status": "not_paid",
      "special_instructions": "without onions"
    },
    {
      "contact_number": "405-371-1161",
      "conversation_id": "conv_6901k8pn9phzec29dnrbskh6rbf3",
      "customer_name": "Sandy",
      "items_ordered": [
        {
          "item": "chicken sandwich",
          "quantity": 2
        },
        {
          "item": "water",
          "quantity": 1
        }
      ],
      "order_confirmed": true,
      "payment_status": "not_paid",
      "special_instructions": "make spicy, extra cheese"
    }
  ],
  "total_orders": 2
}
