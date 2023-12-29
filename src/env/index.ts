import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
    DATABASE_URL: z.string(),
    PORT: z.number().default(3333),
    AUTH_SECRET: z.string(),
    AUTH_PASSPHRASE: z.string(),
})

const _env = envSchema.safeParse(process.env)
if (_env.success === false) {
    console.error('🥷🏻 Invalid environment variables!', _env.error.format())
    throw new Error('|')
}

export const env = _env.data
