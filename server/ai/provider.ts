import { createOpenAI } from "@ai-sdk/openai";
import { serverEnv } from "@/lib/env/server";

export function getOpenAiLanguageModel(modelId = serverEnv.openAiModel) {
  const provider = createOpenAI({
    apiKey: serverEnv.openAiApiKey,
  });

  return provider(modelId);
}
