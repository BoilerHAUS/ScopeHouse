function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const serverEnv = {
  get databaseUrl() {
    return getRequiredEnv("DATABASE_URL");
  },
  get openAiApiKey() {
    return getRequiredEnv("OPENAI_API_KEY");
  },
  get openAiModel() {
    return process.env.OPENAI_MODEL || "gpt-5-mini";
  },
};
