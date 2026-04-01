import { generateText, Output } from "ai";
import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import { serverEnv } from "@/lib/env/server";
import { db } from "@/server/db/client";
import { getOpenAiLanguageModel } from "@/server/ai/provider";
import { readWorkflowPromptBundle } from "@/server/ai/prompts";
import type { LoggedAiWorkflow } from "@/types/ai";

function toJsonValue(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

type RunStructuredWorkflowInput<TSchema extends z.ZodTypeAny> = {
  workflow: LoggedAiWorkflow;
  schema: TSchema;
  input: Record<string, unknown>;
  projectId?: string | null;
  modelId?: string;
};

export async function runStructuredAiWorkflow<TSchema extends z.ZodTypeAny>({
  workflow,
  schema,
  input,
  projectId,
  modelId,
}: RunStructuredWorkflowInput<TSchema>) {
  const promptBundle = await readWorkflowPromptBundle(workflow);
  const selectedModel = modelId ?? serverEnv.openAiModel;

  const generation = await db.aiGeneration.create({
    data: {
      projectId: projectId ?? null,
      workflow,
      status: "running",
      model: selectedModel,
      promptVersion: promptBundle.promptVersion,
      requestPayload: toJsonValue({
        workflow,
        promptDirectory: promptBundle.promptDirectory,
        promptVersion: promptBundle.promptVersion,
        input,
      }),
    },
  });

  try {
    const result = await generateText({
      model: getOpenAiLanguageModel(selectedModel),
      system: `${promptBundle.systemPrompt}\n\n${promptBundle.developerPrompt}`,
      prompt: JSON.stringify(input, null, 2),
      output: Output.object({
        schema,
      }),
    });

    await db.aiGeneration.update({
      where: {
        id: generation.id,
      },
      data: {
        status: "completed",
        completedAt: new Date(),
        outputObject: toJsonValue(result.output),
        responsePayload: toJsonValue({
          finishReason: result.finishReason,
          usage: result.usage,
          warnings: result.warnings ?? [],
          providerMetadata: result.providerMetadata ?? {},
        }),
      },
    });

    return {
      generationId: generation.id,
      model: selectedModel,
      promptVersion: promptBundle.promptVersion,
      output: result.output as z.infer<TSchema>,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown AI generation error.";

    await db.aiGeneration.update({
      where: {
        id: generation.id,
      },
      data: {
        status: "failed",
        errorMessage: message,
        completedAt: new Date(),
      },
    });

    throw error;
  }
}
