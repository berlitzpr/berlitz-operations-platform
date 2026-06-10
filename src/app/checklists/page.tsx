import { ClipboardCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChecklistsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary">Documents & Operations</Badge>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Checklists</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Document tracking, payment authorization, private annex, TBO readiness,
          LCMS, materials, and operational completion tasks.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <CardTitle>Enrollment checklists</CardTitle>
          <CardDescription>Generated automatically from enrollment rules.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
            Document and operational checklist tables will be added here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
