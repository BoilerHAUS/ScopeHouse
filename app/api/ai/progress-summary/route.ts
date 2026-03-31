import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      workflow: "progress-summary",
      status: "not-implemented",
      message:
        "Wire this route to prompts/progress-summary after note ingestion and decision/change aggregation exist.",
    },
    { status: 501 },
  );
}
