'use client';

import { ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  title?: string;
  className?: string;
}

export default function Drawer({ open, onOpenChange, children, title, className }: DrawerProps) {
  return (
    <div className={`fixed inset-y-0 right-0 z-50 flex ${className || ''}`}>
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => onOpenChange(false)}
      />
      <div
        className={`relative ml-auto flex h-full w-full max-w-md transform flex-col border bg-white shadow-2xl transition-transform duration-200 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {title && (
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
