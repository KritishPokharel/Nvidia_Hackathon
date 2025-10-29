"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { LiveCallsGrid } from "@/components/live-calls-grid"
import { ConversationDrawer } from "@/components/conversation-drawer"
import { Phone, Activity } from "lucide-react"

export default function CallEatsConsole() {
  const [selectedCall, setSelectedCall] = useState<string | null>(null)

  return (
    <div className="dark"> {/* Always use dark mode classes */}
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <header className="glass-card sticky top-0 z-10 border-b border-border/50 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Phone className="h-8 w-8 text-primary" />
                    <Activity className="absolute -right-1 -top-1 h-4 w-4 text-primary pulse-glow" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight neon-text">Call-N-Carry</h1>
                    <p className="text-sm text-muted-foreground">AI Voice Assistant Command Center</p>
                  </div>
                </div>
              </div>
              {/* Removed ThemeSwitcher */}
            </div>
          </header>

          {/* Live Calls Grid */}
          <div className="p-8">
            <LiveCallsGrid onSelectCall={setSelectedCall} />
          </div>

          {/* Footer */}
          <footer className="border-t border-border/30 px-8 py-6">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Powered by</span>
              <span className="font-semibold text-primary">NVIDIA Nemotron</span>
              <span>•</span>
              <span className="font-semibold text-primary">Twilio</span>
              <span>•</span>
              <span className="font-semibold text-primary">ElevenLabs</span>
            </div>
          </footer>
        </main>

        {/* Right Conversation Drawer */}
        <ConversationDrawer
          isOpen={!!selectedCall}
          onClose={() => setSelectedCall(null)}
          callId={selectedCall}
        />
      </div>
    </div>
  )
}



