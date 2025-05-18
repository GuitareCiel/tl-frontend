// components/app-sidebar.tsx
"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Settings, FileText } from 'lucide-react'
import { useState } from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { SettlementModal } from '@/components/settlement-modal'

export function AppSidebar() {
  const pathname = usePathname()
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false)
  
  const routes = [
    {
      title: 'Dashboard',
      url: '/',
      icon: LayoutDashboard,
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
    }
  ]

  return (
    <>
      <Sidebar collapsible="none" className="h-screen">
        <SidebarHeader>
          <h2 className="text-lg font-semibold px-4">Tradelink BO</h2>
        </SidebarHeader>
        <SidebarContent className="flex-grow">
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {routes.map((route) => (
                  <SidebarMenuItem key={route.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === route.url}
                    >
                      <Link href={route.url}>
                        <route.icon />
                        <span>{route.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => setIsSettlementModalOpen(true)}
                  >
                    <FileText />
                    <span>Create Settlement</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <p className="text-xs text-muted-foreground px-4">
            © 2023 Pledge Management
          </p>
        </SidebarFooter>
      </Sidebar>

      <SettlementModal 
        isOpen={isSettlementModalOpen} 
        onClose={() => setIsSettlementModalOpen(false)} 
      />
    </>
  )
}