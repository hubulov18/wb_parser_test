exports.up = function (knex) {
    return knex.schema.createTable('box_tariffs', function(table) {
        table.increments('id').primary();
        table.string('dt_next_box');
        table.string('dt_till_max');
        table.string('box_delivery_and_storage_expr');
        table.string('box_delivery_base');
        table.string('box_delivery_liter');
        table.string('box_storage_base');
        table.string('box_storage_liter');
        table.string('warehouse_name');
        table.timestamp('updated_at').defaultTo(knex.fn.now());
        table.unique(['warehouse_name', 'dt_till_max']); // Уникальный индекс
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('box_tariffs');
};
