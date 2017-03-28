
exports.up = function(knex, Promise) {
  return knex.schema.createTable('songs', function(table) {
    table.integer('id').unsigned().primary();
    table.string('title');
    table.string('path');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('songs');
};
