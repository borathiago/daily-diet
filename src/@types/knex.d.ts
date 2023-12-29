// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
    export interface Tables {
        users: {
            id: string
            session_id: string
            name: string
            email: string
            password: string
            avatar?: string
            created_at: string
        }
        summary: {
            id: string
            total: string
            on_diet: string
            not_on_diet: string
            user_id: string
            created_at: string
        }
        meals: {
            id: string
            title: string
            description: string
            date: string
            hour: string
            diet: string
            user_id: string
            created_at: string
        }
    }
}
