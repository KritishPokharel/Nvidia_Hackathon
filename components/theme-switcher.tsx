"use client"

import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ThemeSwitcherProps {
  theme: "dark" | "light"
  setTheme: (theme: "dark" | "light") => void
}

export function ThemeSwitcher({ theme, setTheme }: ThemeSwitcherProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="glass-card border-border/50 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 bg-transparent"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Sun className="h-5 w-5 text-primary" /> : <Moon className="h-5 w-5 text-primary" />}
    </Button>
  )
}
