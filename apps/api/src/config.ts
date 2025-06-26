import { z } from 'zod';

const configSchema = z.object({
  PORT: z.string().default('3001').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  CLAUDE_API_KEY: z.string().optional(),
  GITHUB_TOKEN: z.string().optional(),
  VERCEL_TOKEN: z.string().optional(),
  MAX_SEATS: z.string().default('1').transform(Number),
  RUNNER_TIMEOUT_MS: z.string().default('1200000').transform(Number), // 20 minutes
  CLAUDE_MAX_TOKENS: z.string().default('2500').transform(Number),
});

export const config = configSchema.parse(process.env);

export type Config = z.infer<typeof configSchema>;