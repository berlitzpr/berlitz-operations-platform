import { MessagesSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary">Approvals</Badge>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Requests</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Schedule, TBO, payment plan, card changes, refunds, TBD movement, and critical edits
          that require manager approval.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <MessagesSquare className="h-5 w-5" />
          </div>
          <CardTitle>Pending approvals</CardTitle>
          <CardDescription>Requests will be reviewed and applied through audit-safe workflows.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
            Request list and approval actions will be added here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
