import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { AppError } from '../utils/AppError'
import { compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { authConfig } from '../configs/auth'

export async function sessionRoutes(app: FastifyInstance) {
    app.post('/', async (request, response) => {
        /* {email, password} */
        const createSessionsBodySchema = z.object({
            email: z.string(),
            password: z.string(),
        })
        const { email, password } = createSessionsBodySchema.parse(request.body)
        const user = await knex('users').where({ email }).first()
        if (!user) {
            throw new AppError('E-mail e/ou senha incorretos', 401)
        }
        const matchPassword = await compare(password, user.password)
        if (!matchPassword) {
            throw new AppError('E-mail e/ou senha incorretos', 401)
        }
        const { expiresIn, secret } = authConfig.jwt
        const token = sign({}, secret, {
            subject: String(user.id),
            expiresIn,
        })
        response.cookie('token', token, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7 /* 7 days */,
        })
        // @ts-expect-error // remover o password tornaria a tipagem inconsistente
        delete user.password
        // @ts-expect-error // remover o session_id tornaria a tipagem inconsistente
        delete user.session_id
        await knex('users').where({ id: user.id }).update({ session_id: token })
        response.status(201).send({ user })
    })
}
