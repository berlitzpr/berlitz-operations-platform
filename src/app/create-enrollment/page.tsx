import { EnrollmentWizardShell } from "@/features/create-enrollment/enrollment-wizard-shell";
import { Badge } from "@/components/ui/badge";

export default function CreateEnrollmentPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary">Primary Workflow</Badge>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">
          Create Enrollment
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Create the student, enrollment, Customer ID, payment plan, automatic TBO assignment
          or Private Case, required documents, checklist, and sales report entry from one flow.
        </p>
      </div>

      <EnrollmentWizardShell />
/    </div>
  );
}
