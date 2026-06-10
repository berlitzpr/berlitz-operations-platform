import { UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TboPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary">Group Operations</Badge>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">TBO Pipeline</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Automatic group assignment, capacity, quorum, readiness, checklists, and manager alerts.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <UsersRound className="h-5 w-5" />
          </div>
          <CardTitle>TBO groups</CardTitle>
          <CardDescription>F2F, online, kids, level 5, summer, and future group pipelines.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
            Group tables, capacity cards, and assignment details will be added here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
