import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      workflow: "quote-compare",
      status: "not-implemented",
      message:
        "Wire this route to prompts/quote-compare and feature-level quote parsing when quote comparison starts.",
    },
    { status: 501 },
  );
}
