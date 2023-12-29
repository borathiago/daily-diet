import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { AppError } from '../utils/AppError'
import { hash } from 'bcrypt'

export async function userRoutes(app: FastifyInstance) {
    app.post('/', async (request, response) => {
        /* {id, session_id, name, email, password, avatar} */
        const createUsersBodySchema = z.object({
            name: z.string(),
            email: z.string(),
            password: z.string(),
        })
        const { name, email, password } = createUsersBodySchema.parse(request.body)
        const hashedPassword = await hash(password, 8)
        const emailExists = await knex('users').where({ email }).first()
        if (emailExists) {
            throw new AppError('E-mail já cadastrado', 401)
        }
        await knex('users')
            .returning('id')
            .insert([
                {
                    id: randomUUID(),
                    name,
                    email,
                    password: hashedPassword,
                    // eslint-disable-next-line camelcase
                    session_id: '',
                },
            ])
        return response.status(201).send()
    })
    app.get('/', async () => {
        const users = await knex('users').select('*')
        return {
            users,
        }
    })
}
