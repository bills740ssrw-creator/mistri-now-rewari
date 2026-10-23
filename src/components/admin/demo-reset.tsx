"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { resetDemoDataAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function DemoReset() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function reset() {
    setPending(true);
    try {
      const result = await resetDemoDataAction();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Demo data restored to the seeded state.");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={reset} disabled={pending}>
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
      Reset demo data
    </Button>
  );
}
