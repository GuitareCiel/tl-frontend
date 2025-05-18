// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pledge Management Dashboard',
  description: 'A modern dashboard for managing pledges and approvals',
};

// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "bg-background text-foreground")} suppressHydrationWarning>
        <SidebarProvider>
          <AppSidebar />
          <main className="ml-[var(--sidebar-width)] w-[calc(100%-var(--sidebar-width))] absolute right-0 min-h-screen">
            <div className="p-4">
              {/* Removed SidebarTrigger */}
            </div>
            <div className="px-4 w-full">
              {children}
            </div>
          </main>
          <Toaster position="top-right" />
        </SidebarProvider>
      </body>
    </html>
  );
}