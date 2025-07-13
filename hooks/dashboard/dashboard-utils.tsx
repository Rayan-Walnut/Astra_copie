import { Badge } from "@/components/ui/badge"

export const getPlanPrice = (plan: string): number => {
  switch (plan) {
    case "Basic":
  return (
    <Badge
      className={`${colors[plan as keyof typeof colors] || "bg-zinc-100/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 border-zinc-200/50 dark:border-zinc-800/50"} hover:bg-opacity-80 transition-colors`}
    >
      {plan}
    </Badge>
  )
}

export const mockPaymentMethod = {
  type: "Visa",
  last4: "4242",
  expiryMonth: "12",
  expiryYear: "2027",
  name: "John Doe",
}