/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionID } from '../middleware/check-session-id-exists'
import { AppError } from '../utils/AppError'
import { Knex } from 'knex'

export async function mealRoutes(app: FastifyInstance) {
    app.addHook('preHandler', checkSessionID)
    app.post('/', async (request, response) => {
        /* {title, description, date, hour, diet} */
        const createMealsBodySchema = z.object({
            title: z.string(),
            description: z.string(),
            date: z.string(),
            hour: z.string(),
            diet: z.enum(['sim', 'não']),
        })
        const { title, description, date, hour, diet } = createMealsBodySchema.parse(request.body)
        const userID = request.user.id
        if (!userID || userID === null) {
            throw new AppError('Não autorizado', 401)
        }
        await knex('meals').insert({
            id: randomUUID(),
            title,
            description,
            date,
            hour,
            diet,
            user_id: userID,
        })
        return response.status(201).send()
    })
    app.get('/', async (request, response) => {
        const userID = request.user.id
        const meals = await knex('meals').where('user_id', userID).select('*')
        return response.status(201).send({ meals })
    })
    app.get('/:id', async (request, response) => {
        const userID = request.user.id
        const getMealParamsSchema = z.object({
            id: z.string().uuid(),
        })
        const { id } = getMealParamsSchema.parse(request.params)
        const meal = await knex('meals').where({ user_id: userID, id }).first()
        return response.status(201).send({ meal })
    })
    app.delete('/:id', async (request, response) => {
        const userID = request.user.id
        if (!userID) {
            throw new AppError('Não autorizado', 401)
        }
        const deleteMealParamsSchema = z.object({
            id: z.string().uuid(),
        })
        const { id } = deleteMealParamsSchema.parse(request.params)
        await knex('meals').where({ id }).delete()
        return response.status(200).send()
    })
    app.get('/summary', async (request, response) => {
        const userID = request.user.id
        if (!userID) {
            throw new AppError('Não autorizado', 401)
        }
        const summary = await knex('meals')
            .select()
            .count('meals.id', { as: 'total_meals' })
            .with('meals_on_diet', (query: Knex.QueryBuilder) => {
                query.select('id').from('meals').where({ user_id: userID, diet: 'sim' })
            })
            .leftJoin('meals_on_diet', 'meals_on_diet.id', 'meals.id')
            .count('meals_on_diet.id', { as: 'on_diet' })
            .with('meals_not_on_diet', (query: Knex.QueryBuilder) => {
                query.select('id').from('meals').where({ user_id: userID, diet: 'não' })
            })
            .leftJoin('meals_not_on_diet', 'meals_not_on_diet.id', 'meals.id')
            .count('meals_not_on_diet.id', { as: 'not_on_diet' })
        const meals = await knex('meals').select('diet').where({ user_id: userID })
        const tab = meals.map((item) => {
            if (item.diet === 'sim') {
                return 1
            } else {
                return 0
            }
        })
        // eslint-disable-next-line no-sequences
        const streaks = tab.reduce((s, n) => (n ? s[s.length - 1]++ : s.push(0), s), [0])
        const best_sequence = Math.max(...streaks)
        Object.assign(summary[0], { best_sequence_on_diet: best_sequence })
        return response.status(201).send({ summary })
    })
}
