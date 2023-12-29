import { app } from './app'
import { env } from './env'

/* Escutar uma porta */ /* listen() retorna uma Promise, então quando ela terminar a execução, podemos usar then() */
app.listen({ port: env.PORT }).then(() => {
    console.log(`HTTP Server Running on PORT ${env.PORT}`)
})
