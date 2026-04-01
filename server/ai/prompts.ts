import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { LoggedAiWorkflow } from "@/types/ai";
import { AI_WORKFLOW_CONFIG } from "@/server/ai/workflows";

export const readWorkflowPromptBundle = cache(
  async (workflow: LoggedAiWorkflow) => {
    const config = AI_WORKFLOW_CONFIG[workflow];
    const promptDirectory = path.join(
      process.cwd(),
      "prompts",
      config.promptDirectory,
    );

    const [systemPrompt, developerPrompt, outputSchema] = await Promise.all([
      readFile(path.join(promptDirectory, "system.md"), "utf8"),
      readFile(path.join(promptDirectory, "developer.md"), "utf8"),
      readFile(path.join(promptDirectory, "output-schema.json"), "utf8"),
    ]);

    const promptVersion = createHash("sha256")
      .update(systemPrompt)
      .update(developerPrompt)
      .update(outputSchema)
      .digest("hex")
      .slice(0, 12);

    return {
      workflow,
      promptDirectory: config.promptDirectory,
      promptVersion,
      systemPrompt: systemPrompt.trim(),
      developerPrompt: developerPrompt.trim(),
      outputSchema: JSON.parse(outputSchema) as Record<string, unknown>,
    };
  },
);
