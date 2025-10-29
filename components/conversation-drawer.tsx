"use client"

import { useEffect, useState } from "react"
import { X, ShoppingBag, Lock, CreditCard, Info, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Order {
  conversation_id: string
  customer_name: string
  contact_number: string
  items_ordered: { item: string; quantity: number }[]
  order_confirmed: boolean
  payment_status: string
  special_instructions?: string
}

interface ConversationDrawerProps {
  isOpen: boolean
  onClose: () => void
  callId: string | null
}

export function ConversationDrawer({ isOpen, onClose, callId }: ConversationDrawerProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen || !callId) return

    const fetchOrder = async () => {
      setLoading(true)
      try {
        const response = await fetch("https://1440ad55bcf3.ngrok-free.app/orders?fbclid=IwZXh0bgNhZW0CMTEAAR4zVpNlETeLP4eCStzhIIJrW8Ljwl1FOd96nn1U7AMAYuEam0572aXCqZzdpw_aem_wZMjuNX76weGZwFvJAX5Tg", {
          headers: { "ngrok-skip-browser-warning": "true" },
        })
        const data = await response.json()

        // find order by conversation_id
        const matched = data.orders.find(
          (o: any) => o.conversation_id === callId
        )
        setOrder(matched || null)
      } catch (error) {
        console.error("Error fetching order details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [isOpen, callId])

  if (!isOpen || !callId) return null

  const subtotal =
    order?.items_ordered?.reduce((sum, i) => sum + i.quantity * 15, 0) || 0
  const tax = subtotal * 0.08
  const total = subtotal + tax

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="glass-card fixed right-0 top-0 z-50 h-screen w-full max-w-2xl border-l border-border/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 p-6">
          <div>
            <h2 className="text-xl font-bold">Order Details</h2>
            {order ? (
              <p className="text-sm text-muted-foreground">
                {order.customer_name} • {order.contact_number}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Fetching order...</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto h-[calc(100vh-88px)]">
          {loading ? (
            <p className="text-center text-muted-foreground mt-10">Loading...</p>
          ) : order ? (
            <Card className="glass-card border-border/50 p-5">
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Order Summary</h3>
                </div>
                <Badge
                  className={cn(
                    "text-xs",
                    order.payment_status === "paid"
                      ? "bg-green-500/20 text-green-500"
                      : "bg-yellow-500/20 text-yellow-500"
                  )}
                >
                  {order.payment_status === "paid"
                    ? "Paid"
                    : "Awaiting Payment"}
                </Badge>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {order.items_ordered.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm text-foreground"
                  >
                    <span>
                      {item.quantity}x {item.item}
                    </span>
                    <span className="font-medium">
                      ${(item.quantity * 15).toFixed(2)}
                    </span>
                  </div>
                ))}

                <div className="border-t border-border/30 pt-3 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between border-t border-border/30 pt-3 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>

                {/* Payment Section */}
                <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="h-4 w-4 text-primary" />
                    <span className="font-medium text-foreground">
                      Payment Method
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {order.payment_status === "paid"
                          ? "Card ending in ****4532"
                          : "Pending"}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-primary/50 bg-primary/10 text-primary"
                    >
                      {order.payment_status === "paid"
                        ? "Verified"
                        : "Unverified"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Payment information is encrypted and securely processed on
                    the backend.
                  </p>
                </div>

                {/* Special Instructions */}
                {order.special_instructions && (
                  <div className="mt-5 rounded-lg border border-dashed border-primary/30 bg-muted/20 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                      <Info className="h-4 w-4" />
                      <span>Special Instructions</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {order.special_instructions}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <p className="text-center text-muted-foreground mt-10">
              No order details found.
            </p>
          )}
        </div>
      </aside>
    </>
  )
}

