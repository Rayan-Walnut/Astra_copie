"use client"

import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import type { Client, NewClient } from "@/types/dashboard"

export function useClientManagement(
  clients: Client[],
  setClients: (clients: Client[]) => void,
  loadStats: () => Promise<void>,
) {
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const [newClient, setNewClient] = useState<NewClient>({
    firstName: "",
    lastName: "",
    email: "",
    plan: "",
    phone: "",
    age: "",
    goals: ["Fitness"],
  })

  const handleDeleteClient = async (clientId: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        setClients(clients.filter((client) => client._id !== clientId))
        toast({
          title: "Succès",
          description: "Client supprimé avec succès",
        })
        await loadStats()
      } else {
        const data = await response.json()
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de la suppression",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Delete client error:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive",
      })
    }
  }

  const handleAddClient = async () => {
    if (!newClient.firstName || !newClient.lastName || !newClient.email || !newClient.plan) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newClient),
      })

      const data = await response.json()

      if (response.ok) {
        setClients([data.client, ...clients])
        setNewClient({
          firstName: "",
          lastName: "",
          email: "",
          plan: "",
          phone: "",
          age: "",
          goals: ["Fitness"],
        })
        setIsAddClientOpen(false)
        toast({
          title: "Succès",
          description: "Client ajouté avec succès",
        })
        await loadStats()
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de l'ajout",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Add client error:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive",
      })
    }
  }

  return {
    isAddClientOpen,
    setIsAddClientOpen,
    newClient,
    setNewClient,
    handleDeleteClient,
    handleAddClient,
  }
}