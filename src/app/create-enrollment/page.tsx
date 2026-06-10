import { FilePlus2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateEnrollmentPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary">Primary Workflow</Badge>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Create Enrollment</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          This wizard will create the student, enrollment, Customer ID, payment plan,
          TBO assignment or private case, required documents, checklist, and sales report entry.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <FilePlus2 className="h-5 w-5" />
          </div>
          <CardTitle>Enrollment Wizard</CardTitle>
          <CardDescription>
            The full guided form will be built in the next phase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
            Step 1: Student Info → Step 2: Program → Step 3: Schedule → Step 4:
            Pricing & Payment Plan → Step 5: Assignment/Case → Step 6: Documents.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
