
exports.up = function(knex, Promise) {
  return knex.schema.createTable('songs', function(table) {
    table.string('title');
    table.string('path');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('songs');
};
