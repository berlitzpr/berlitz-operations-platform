import { FolderKanban } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivateCasesPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary">Customer Service Workflow</Badge>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Private Cases</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Operational case workflow for private students, including advisor tasks, CSR tasks,
          schedules, materials, Zoom/Cosmos/LCMS/EPED actions, and completion tracking.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <FolderKanban className="h-5 w-5" />
          </div>
          <CardTitle>Open private cases</CardTitle>
          <CardDescription>Cases created automatically from private enrollments.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
            Private case task board and details will be added here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
