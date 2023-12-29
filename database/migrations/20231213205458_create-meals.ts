import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', (table) => {
        table.uuid('id').primary()
        table.text('title').notNullable()
        table.text('description')
        table.text('date').notNullable()
        table.text('hour').notNullable()
        table.text('diet').notNullable()
        table.integer('user_id').references('id').inTable('users')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable()
    })
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('meals')
}
