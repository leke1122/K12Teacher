"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Toaster } from "@/components/ui/toast";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainLayout>{children}</MainLayout>
      <Toaster />
    </>
  );
}
