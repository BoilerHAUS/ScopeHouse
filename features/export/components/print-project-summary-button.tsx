"use client";

import { Button } from "@/components/ui/button";

export function PrintProjectSummaryButton() {
  return (
    <Button
      type="button"
      variant="outline"
      className="rounded-full px-5"
      onClick={() => window.print()}
    >
      Print summary
    </Button>
  );
}
