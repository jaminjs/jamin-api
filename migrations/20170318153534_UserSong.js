
exports.up = function(knex, Promise) {
  return knex.schema.createTable('user_song', function(table) {
    table.integer('id').unsigned().primary();
    table.integer('user_id').unsigned().index();
    table.integer('song_id').unsigned();

    table.foreign('user_id').references('users.id');
    table.foreign('song_id').references('songs.id');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('user_song');
};
