"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"

// Simulation d'une base de données d'utilisateurs
const MOCK_USERS = [
  { id: 1, email: "admin@test.com", password: "admin123", name: "Admin User" },
  { id: 2, email: "user@test.com", password: "user123", name: "Regular User" },
  { id: 3, email: "demo@test.com", password: "demo123", name: "Demo User" },
]

export type AuthResult = {
  success: boolean
  message: string
  user?: {
    id: number
    email: string
    name: string
  }
}

export async function loginAction(email: string, password: string): Promise<AuthResult> {
  // Simulation d'un délai réseau
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Validation des champs
  if (!email || !password) {
    return {
      success: false,
      message: "Email et mot de passe requis"
    }
  }

  // Recherche de l'utilisateur
  const user = MOCK_USERS.find(u => u.email === email && u.password === password)

  if (!user) {
    return {
      success: false,
      message: "Email ou mot de passe incorrect"
    }
  }

  // Simulation de création de session
  const cookieStore = await cookies()
  cookieStore.set("auth-token", `token-${user.id}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  })

  return {
    success: true,
    message: "Connexion réussie",
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
  redirect("/login")
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")
  
  if (!token) return null

  // Simulation de récupération d'utilisateur depuis le token
  const userId = token.value.split("-")[1]
  const user = MOCK_USERS.find(u => u.id === parseInt(userId))
  
  return user ? {
    id: user.id,
    email: user.email,
    name: user.name
  } : null
}