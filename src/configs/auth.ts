import { env } from '../env'

export const authConfig = {
    jwt: {
        secret: env.AUTH_SECRET || 'default',
        expiresIn: '1d',
        algorithm: 'RS256',
    },
}
