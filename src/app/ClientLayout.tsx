"use client";

import { Toaster } from "@/components/ui/toast";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
