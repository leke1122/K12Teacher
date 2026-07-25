"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useLayoutStore } from "@/stores/layoutStore";
import { TooltipProvider } from "@/components/ui/tooltip";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarCollapsed } = useLayoutStore();

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto overflow-x-hidden pt-20">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
