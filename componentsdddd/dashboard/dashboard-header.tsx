"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User, CreditCard, Moon, Sun } from 'lucide-react'
import { useAuth } from "@/hooks/use-auth"
import { useTheme } from "next-themes"
import type { DashboardUser } from "@/types/dashboard"

interface DashboardHeaderProps {
  user: DashboardUser
  tabs: Array<{ id: string; label: string }>
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function DashboardHeader({ user, tabs, activeTab, onTabChange }: DashboardHeaderProps) {
  const { logout } = useAuth()
  const { theme, setTheme } = useTheme()

  if (!user) {
    return null; // or a loading skeleton
  }

  return (
    <header className="border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-400" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
              <span className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Dashboard</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8 relative nav-container">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  data-tab={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`text-sm font-medium transition-colors px-1 py-2 relative ${
                    activeTab === tab.id
                      ? "text-zinc-900 dark:text-zinc-100 border-b-2 border-emerald-400"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full transition-colors"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email || ''}</p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">{user?.role || ''}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}