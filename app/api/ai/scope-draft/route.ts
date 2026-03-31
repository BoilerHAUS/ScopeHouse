import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      workflow: "scope-draft",
      status: "not-implemented",
      message:
        "Wire this route to prompts/scope-draft and server/ai when the first AI vertical slice is built.",
    },
    { status: 501 },
  );
}
