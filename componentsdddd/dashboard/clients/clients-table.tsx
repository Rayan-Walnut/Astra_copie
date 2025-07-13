"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Eye, Edit, Trash2, Mail, Phone, Loader2, Users } from "lucide-react"
import { getStatusBadge, getPlanBadge } from "@/lib/dashboard-utils"
import type { Client } from "@/types/dashboard"

interface ClientsTableProps {
  clients: Client[]
  filteredClients: Client[]
  loadingClients: boolean
  onDeleteClient: (clientId: string) => void
}

export function ClientsTable({ clients, filteredClients, loadingClients, onDeleteClient }: ClientsTableProps) {
  if (loadingClients) {
    return (
      <Card className="border-zinc-200/50 dark:border-zinc-800/50">
        <div className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-zinc-600 dark:text-zinc-400" />
          <p className="text-zinc-600 dark:text-zinc-400">Loading clients...</p>
        </div>
      </Card>
    )
  }

  if (filteredClients.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">No clients found</h3>
        <p className="text-zinc-600 dark:text-zinc-400">
          {clients.length === 0 ? "Start by adding your first client!" : "No clients match your search criteria."}
        </p>
      </div>
    )
  }

  return (
    <Card className="border-zinc-200/50 dark:border-zinc-800/50">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-zinc-200/50 dark:border-zinc-800/50">
            <TableHead className="font-medium text-zinc-900 dark:text-zinc-100">Client</TableHead>
            <TableHead className="font-medium text-zinc-900 dark:text-zinc-100">Contact</TableHead>
            <TableHead className="font-medium text-zinc-900 dark:text-zinc-100">Plan</TableHead>
            <TableHead className="font-medium text-zinc-900 dark:text-zinc-100">Status</TableHead>
            <TableHead className="font-medium text-zinc-900 dark:text-zinc-100">Progress</TableHead>
            <TableHead className="font-medium text-zinc-900 dark:text-zinc-100">Revenue</TableHead>
            <TableHead className="font-medium text-zinc-900 dark:text-zinc-100 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.map((client) => (
            <TableRow
              key={client._id}
              className="border-b border-zinc-100/50 dark:border-zinc-900/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
            >
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium">
                      {client.firstName.charAt(0)}
                      {client.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {client.firstName} {client.lastName}
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-500">
                      #{client._id.slice(-6)} {client.age && `• Age ${client.age}`}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {client.goals?.slice(0, 2).map((goal, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-zinc-100/50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm text-zinc-900 dark:text-zinc-100">
                    <Mail className="h-3 w-3" />
                    {client.email}
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {getPlanBadge(client.plan)}
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">{client.sessions || 0} sessions</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {getStatusBadge(client.status)}
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    Last: {new Date(client.lastActive).toLocaleDateString()}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Progress value={client.progress || 0} className="h-2 flex-1" />
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {client.progress || 0}%
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">Goal completion</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">${client.revenue}</span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">This month</p>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 transition-colors" title="View Details">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 transition-colors" title="Edit Client">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete Client"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete client</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {client.firstName} {client.lastName}? This action cannot be
                          undone and will remove all their data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteClient(client._id)}
                          className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}