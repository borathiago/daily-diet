import { FastifyRequest } from 'fastify'
import { AppError } from '../utils/AppError'
import { verify } from 'jsonwebtoken'
import { authConfig } from '../configs/auth'

export async function checkSessionID(request: FastifyRequest) {
    const sessionID = request.cookies.token
    if (!sessionID) {
        throw new AppError('Não autorizado', 401)
    }
    try {
        const { sub: userId } = verify(sessionID, authConfig.jwt.secret)
        request.user = {
            id: userId,
        }
    } catch {
        throw new AppError('Não autorizado', 401)
    }
}
