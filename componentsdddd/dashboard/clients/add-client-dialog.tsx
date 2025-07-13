"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import type { NewClient } from "@/types/dashboard"

interface AddClientDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  newClient: NewClient
  onClientChange: (client: NewClient) => void
  onAddClient: () => void
}

export function AddClientDialog({
  isOpen,
  onOpenChange,
  newClient,
  onClientChange,
  onAddClient,
}: AddClientDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-500 hover:bg-emerald-500/90 text-zinc-50 dark:text-zinc-900">
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>Add a new member to your gym. Fill in their details below.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={newClient.firstName}
                onChange={(e) => onClientChange({ ...newClient, firstName: e.target.value })}
                placeholder="John"
                className="focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={newClient.lastName}
                onChange={(e) => onClientChange({ ...newClient, lastName: e.target.value })}
                placeholder="Doe"
                className="focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={newClient.email}
              onChange={(e) => onClientChange({ ...newClient, email: e.target.value })}
              placeholder="john.doe@email.com"
              className="focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newClient.phone}
                onChange={(e) => onClientChange({ ...newClient, phone: e.target.value })}
                placeholder="+33 6 12 34 56 78"
                className="focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={newClient.age}
                onChange={(e) => onClientChange({ ...newClient, age: e.target.value })}
                placeholder="25"
                min="16"
                max="100"
                className="focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan">Plan *</Label>
            <Select value={newClient.plan} onValueChange={(value) => onClientChange({ ...newClient, plan: value })}>
              <SelectTrigger className="focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Basic">Basic - $9.99/month</SelectItem>
                <SelectItem value="Premium">Premium - $29.99/month</SelectItem>
                <SelectItem value="Pro">Pro - $49.99/month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onAddClient}
            className="bg-emerald-500 hover:bg-emerald-500/90 text-zinc-50 dark:text-zinc-900"
          >
            Add Client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
