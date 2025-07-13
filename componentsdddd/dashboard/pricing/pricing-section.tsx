"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Crown, Shield } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import type { DashboardUser } from "@/types/dashboard"

interface PricingSectionProps {
  user: DashboardUser
  onPlanChange?: (plan: string) => void
}

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: 9.99,
    description: "Perfect for beginners starting their fitness journey",
    icon: Shield,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    borderColor: "border-blue-200 dark:border-blue-800",
    features: [
      "Access to gym equipment",
      "Basic workout plans",
      "Locker room access",
      "Mobile app access",
      "Community support",
    ],
    limitations: [
      "No personal training",
      "Limited class access",
      "Basic progress tracking",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 29.99,
    description: "Most popular choice for serious fitness enthusiasts",
    icon: Star,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    borderColor: "border-purple-200 dark:border-purple-800",
    popular: true,
    features: [
      "Everything in Basic",
      "Unlimited group classes",
      "Advanced workout plans",
      "Nutrition guidance",
      "Progress analytics",
      "Priority booking",
      "Guest passes (2/month)",
    ],
    limitations: [
      "Limited personal training sessions",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 49.99,
    description: "Ultimate package for maximum results and support",
    icon: Crown,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    borderColor: "border-orange-200 dark:border-orange-800",
    features: [
      "Everything in Premium",
      "Unlimited personal training",
      "Custom meal plans",
      "Body composition analysis",
      "Recovery sessions",
      "VIP locker room access",
      "Guest passes (5/month)",
      "24/7 gym access",
      "Supplement discounts",
    ],
    limitations: [],
  },
]

export function PricingSection({ user, onPlanChange }: PricingSectionProps) {
  const [selectedPlan, setSelectedPlan] = useState(user?.currentPlan?.toLowerCase() || "")
  const [loading, setLoading] = useState<string | null>(null)

  const handlePlanSelect = async (planId: string) => {
    if (planId === selectedPlan) return

    setLoading(planId)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSelectedPlan(planId)
      onPlanChange?.(plans.find(p => p.id === planId)?.name || planId)
      
      toast({
        title: "Plan Updated",
        description: `Successfully switched to ${plans.find(p => p.id === planId)?.name} plan`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          Choose Your Perfect Plan
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Unlock your fitness potential with our flexible membership options. 
          Upgrade or downgrade anytime to match your goals.
        </p>
      </div>

      {/* Current Plan Info */}
      {user?.currentPlan && (
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                  <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Current Plan: {user.currentPlan}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Next billing: February 15, 2024
                  </p>
                </div>
              </div>
              <Badge className="bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100 border-emerald-200 dark:border-emerald-800">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const IconComponent = plan.icon
          const isCurrentPlan = selectedPlan === plan.id
          const isLoading = loading === plan.id

          return (
            <Card
              key={plan.id}
              className={`relative transition-all duration-200 hover:shadow-lg ${
                plan.popular
                  ? "border-2 border-purple-200 dark:border-purple-800 shadow-lg scale-105"
                  : "border-zinc-200/50 dark:border-zinc-800/50"
              } ${
                isCurrentPlan
                  ? "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-950"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 hover:bg-purple-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${plan.bgColor} flex items-center justify-center`}>
                  <IconComponent className={`h-8 w-8 ${plan.color}`} />
                </div>
                <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {plan.name}
                </CardTitle>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  {plan.description}
                </p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                    ${plan.price}
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400">/month</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                    What's included:
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span className="text-zinc-700 dark:text-zinc-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                      Limitations:
                    </h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className="h-4 w-4 rounded-full bg-zinc-300 dark:bg-zinc-600 flex-shrink-0" />
                          <span className="text-zinc-600 dark:text-zinc-400">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={isCurrentPlan || isLoading}
                  className={`w-full transition-all ${
                    isCurrentPlan
                      ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                      : plan.popular
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </div>
                  ) : isCurrentPlan ? (
                    "Current Plan"
                  ) : (
                    `Choose ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <Card className="border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Flexible Billing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Upgrade/downgrade anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">Secure payment processing</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Money-Back Guarantee
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              Not satisfied with your membership? We offer a 30-day money-back guarantee 
              for all new members. No questions asked.
            </p>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                100% Satisfaction Guaranteed
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card className="border-zinc-200/50 dark:border-zinc-800/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Can I change my plan later?
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect 
                at your next billing cycle.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                What payment methods do you accept?
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                We accept all major credit cards, PayPal, and bank transfers. 
                All payments are processed securely.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Is there a contract?
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No long-term contracts required. All memberships are month-to-month 
                and can be cancelled anytime.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Do you offer student discounts?
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Yes! Students get 20% off any plan with valid student ID. 
                Contact support for more details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}