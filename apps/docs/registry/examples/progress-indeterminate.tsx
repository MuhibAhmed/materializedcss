import { Progress } from "@/components/ui/progress";

export function ProgressIndeterminate() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <Progress label="Loading results" />
      <Progress label="Syncing contacts" color="primary" />
    </div>
  );
}
