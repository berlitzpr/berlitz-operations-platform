import { LockKeyhole } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary">Admin Tools</Badge>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Admin</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Program catalog, pricing, templates, roles, TBO group setup, document rules,
          and platform configuration.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <CardTitle>Admin configuration</CardTitle>
          <CardDescription>Configuration panels will be protected by role permissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
            Program, pricing, users, roles, templates, and TBO setup tools will be added here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
