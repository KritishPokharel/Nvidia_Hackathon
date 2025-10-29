"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { History } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { icon: History, label: "Order History", active: true },
]

export function Sidebar() {
  const [activeItem, setActiveItem] = useState("Order History")

  return (
    <aside className="glass-card w-72 border-r border-border/50 p-6">
      {/* Navigation */}
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.label

          return (
            <Button
              key={item.label}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 text-base transition-all",
                isActive && "neon-glow bg-primary text-primary-foreground",
              )}
              onClick={() => setActiveItem(item.label)}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1 text-left">{item.label}</span>
            </Button>
          )
        })}
      </nav>

      {/* Live Status Indicator */}
      <div className="mt-8 rounded-xl border border-border/50 bg-card/50 p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-3 w-3">
            <div className="absolute inset-0 rounded-full bg-primary pulse-glow" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">System Active</p>
            <p className="text-xs text-muted-foreground">All services operational</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

