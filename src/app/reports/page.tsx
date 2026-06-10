import { BarChart3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary">Sales & EPED</Badge>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Reports</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Tuesday sales report, advisor targets, EPED Pace Report, EPED Absence Report,
          absence alerts, pace alerts, and merge support.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <BarChart3 className="h-5 w-5" />
          </div>
          <CardTitle>Operational reports</CardTitle>
          <CardDescription>Automated reports will be connected once the schema is in place.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
            Sales and EPED report sections will be added here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
