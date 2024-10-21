/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("timers", (table) => {
    table.increments("id");
    table.integer("timers_id").notNullable();
    table.datetime("start").notNullable();
    table.string("description", 255).notNullable();
    table.boolean("isActive").defaultTo(true);
    table.integer("user_id", 255).notNullable();
    table.foreign("user_id").references("users.id");
    table.integer("progress").notNullable().defaultTo(0);
    table.datetime("end").defaultTo(null);
    table.integer("duration").defaultTo(null);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("timers");
};
