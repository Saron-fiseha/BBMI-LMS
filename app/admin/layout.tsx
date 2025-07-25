import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Toaster } from "@/components/ui/toaster"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-ivory">
      <AdminSidebar />
      <main className="flex-1 p-6">{children}<Toaster /></main>
    </div>
  )
}
