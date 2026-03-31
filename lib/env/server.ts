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
};
