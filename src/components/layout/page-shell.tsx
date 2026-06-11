import type { ReactNode } from "react";

export function PageShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="w-full space-y-5">
      {children}
    </div>
  );
}
