import fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import { env } from './env'
import { sessionRoutes } from './routes/sessions'
import { userRoutes } from './routes/users'
import { mealRoutes } from './routes/meals'

export const app = fastify() /* Criar a base da aplicação com a variável app */

/* À partir daqui, podemos montar as rotas usando os métodos HTTP */
app.decorateRequest('user', '')
app.register(cors, {
    origin: ['http:localhost:3333', 'http://127.0.0.1:3333/'],
    credentials: true,
})
app.register(cookie)
app.register(sessionRoutes, {
    prefix: 'sessions',
})
app.register(userRoutes, {
    prefix: 'users',
})
/* app.addHook('preHandler', async (request, response) => {
    console.log(`[${request.method}] ${request.url}`)
}) */
app.register(mealRoutes, {
    prefix: 'meals',
})
