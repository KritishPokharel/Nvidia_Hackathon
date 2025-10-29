"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Phone,
  Clock,
  User,
  ChefHat,
  CheckCircle2,
  DollarSign,
  MoreVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

interface Call {
  id: string
  caller: string
  phone: string
  duration?: string
  status: "active" | "preparing" | "awaiting-payment" | "completed"
  transcript?: string
  orderTotal?: string
  timestamp: Date
  orderItems?: number
}

const statusConfig = {
  active: {
    label: "Active Order",
    icon: Phone,
    className: "bg-[var(--status-active)]/20 text-[var(--status-active)] border-[var(--status-active)]/50",
    glowClass: "pulse-glow",
  },
  preparing: {
    label: "Preparing",
    icon: ChefHat,
    className: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    glowClass: "",
  },
  "awaiting-payment": {
    label: "Awaiting Payment",
    icon: DollarSign,
    className: "bg-[var(--status-warning)]/20 text-[var(--status-warning)] border-[var(--status-warning)]/50",
    glowClass: "",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-muted/50 text-muted-foreground border-muted",
    glowClass: "",
  },
}

type FilterType = "all" | "active" | "preparing" | "awaiting-payment" | "completed"

interface LiveCallsGridProps {
  onSelectCall: (callId: string) => void
}

export function LiveCallsGrid({ onSelectCall }: LiveCallsGridProps) {
  const [calls, setCalls] = useState<Call[]>([])
  const [filter, setFilter] = useState<FilterType>("all")

  // Fetch from your Ngrok backend
  const fetchOrders = async () => {
    try {
      const response = await fetch("https://1440ad55bcf3.ngrok-free.app/orders?fbclid=IwZXh0bgNhZW0CMTEAAR4zVpNlETeLP4eCStzhIIJrW8Ljwl1FOd96nn1U7AMAYuEam0572aXCqZzdpw_aem_wZMjuNX76weGZwFvJAX5Tg", {
        headers: { "ngrok-skip-browser-warning": "true" },
      })
      const data = await response.json()

      const mapped = data.orders.map((order: any, index: number): Call => ({
        id: order.conversation_id || `order-${index}`,
        caller: order.customer_name || "Unknown Customer",
        phone: order.contact_number || "N/A",
        duration: "—",
        status: order.order_confirmed
          ? order.payment_status === "paid"
            ? "completed"
            : "awaiting-payment"
          : "active",
        transcript: order.special_instructions || "—",
        orderTotal: `$${(order.items_ordered.length * 15).toFixed(2)}`, // mock total
        timestamp: new Date(),
        orderItems: order.items_ordered.length,
      }))

      setCalls(mapped)
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000) // refresh every 10s
    return () => clearInterval(interval)
  }, [])

  const handleStatusChange = (id: string, newStatus: Call["status"]) => {
    setCalls((prev) =>
      prev.map((call) => (call.id === id ? { ...call, status: newStatus } : call))
    )
  }

  const filteredCalls = calls.filter((call) => (filter === "all" ? true : call.status === filter))
  const sortedCalls = [...filteredCalls].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  const counts = {
    all: calls.length,
    active: calls.filter((c) => c.status === "active").length,
    preparing: calls.filter((c) => c.status === "preparing").length,
    "awaiting-payment": calls.filter((c) => c.status === "awaiting-payment").length,
    completed: calls.filter((c) => c.status === "completed").length,
  }

  const formatTimestamp = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Order Management</h2>
            <p className="text-sm text-muted-foreground">
              Track and manage all pickup orders in real-time
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-primary pulse-glow" />
            <span className="font-medium text-primary">{counts.active} Active</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {(["all", "active", "preparing", "awaiting-payment", "completed"] as FilterType[]).map(
            (type) => {
              const Icon =
                type === "active"
                  ? Phone
                  : type === "preparing"
                  ? ChefHat
                  : type === "awaiting-payment"
                  ? DollarSign
                  : type === "completed"
                  ? CheckCircle2
                  : null
              const label =
                type === "all"
                  ? "All Orders"
                  : type === "active"
                  ? "Active Orders"
                  : type === "preparing"
                  ? "Preparing"
                  : type === "awaiting-payment"
                  ? "Awaiting Payment"
                  : "Completed"

              return (
                <Button
                  key={type}
                  variant={filter === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(type)}
                  className={cn(
                    "transition-all",
                    filter === type &&
                      (type === "all"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : type === "active"
                        ? "bg-[var(--status-active)] text-white shadow-lg shadow-[var(--status-active)]/30"
                        : type === "preparing"
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                        : type === "awaiting-payment"
                        ? "bg-[var(--status-warning)] text-white shadow-lg shadow-[var(--status-warning)]/30"
                        : "bg-muted text-foreground"),
                  )}
                >
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  {label}
                  <Badge variant="secondary" className="ml-2 bg-background/20">
                    {counts[type]}
                  </Badge>
                </Button>
              )
            },
          )}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedCalls.map((call) => {
          const StatusIcon = statusConfig[call.status].icon
          return (
            <Card
              key={call.id}
              className="glass-card group relative cursor-pointer border-border/50 p-5 transition-all hover:scale-[1.02] hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20"
              onClick={() => onSelectCall(call.id)}
            >
              {/* Header with dropdown */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary/30">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{call.caller}</h3>
                    <p className="text-xs text-muted-foreground">{call.phone}</p>
                  </div>
                </div>

                {(call.status === "active" || call.status === "preparing") && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {call.status === "active" && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusChange(call.id, "preparing")
                          }}
                        >
                          Mark as Preparing
                        </DropdownMenuItem>
                      )}
                      {call.status === "preparing" && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusChange(call.id, "completed")
                          }}
                        >
                          Mark as Completed
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Status Badge */}
              <Badge
                variant="outline"
                className={cn("mb-3 w-full justify-center border py-1.5", statusConfig[call.status].className)}
              >
                <StatusIcon className={cn("mr-2 h-4 w-4", statusConfig[call.status].glowClass)} />
                {statusConfig[call.status].label}
              </Badge>

              {/* Order Info */}
              <div className="mb-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{call.duration}</span>
                </div>
                <span className="text-xs text-muted-foreground">{formatTimestamp(call.timestamp)}</span>
              </div>

              {/* Order Total */}
              {call.orderTotal && (
                <div className="mb-3 rounded-lg bg-primary/10 px-3 py-2 text-center">
                  <div className="text-xs text-muted-foreground">Order Total</div>
                  <div className="text-xl font-bold text-primary">{call.orderTotal}</div>
                  <div className="text-xs text-muted-foreground">{call.orderItems} items</div>
                </div>
              )}

              {/* Transcript Preview */}
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="line-clamp-2 text-xs leading-relaxed text-foreground/70">{call.transcript}</p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {sortedCalls.length === 0 && (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border/50">
          <div className="text-center">
            <p className="text-lg font-medium text-muted-foreground">No orders found</p>
            <p className="text-sm text-muted-foreground">Orders with this status will appear here</p>
          </div>
        </div>
      )}
    </div>
  )
}

