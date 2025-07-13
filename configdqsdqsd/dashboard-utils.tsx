import { Badge } from "@/components/ui/badge"

export const getPlanPrice = (plan: string): number => {
  switch (plan) {
    case "Basic":
      return 9.99
    case "Premium":
      return 29.99
    case "Pro":
      return 49.99
    default:
      return 0
  }
}

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-900 border-0">
          Active
        </Badge>
      )
    case "inactive":
      return (
        <Badge className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 hover:bg-red-100 dark:hover:bg-red-900 border-0">
          Inactive
        </Badge>
      )
    case "pending":
      return (
        <Badge className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 hover:bg-yellow-100 dark:hover:bg-yellow-900 border-0">
          Pending
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export const getPlanBadge = (plan: string) => {
  const colors = {
    Basic: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 border-blue-200 dark:border-blue-800",
    Premium:
      "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 border-purple-200 dark:border-purple-800",
    Pro: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 border-orange-200 dark:border-orange-800",
  }
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