import merge from 'lodash.merge';
import path from 'path';

const REPO_ROOT = path.resolve(__dirname, '..');

let config = {
  knex: {
    client: 'sqlite3',
    connection: {
      filename: path.join(REPO_ROOT, 'db.sqlite'),
    },
    migrations: {
      tableName: 'migrations',
    },
    useNullAsDefault: true,
  },
};

export function updateConfig(passedConfig) {
  merge(config, passedConfig);
}

export default config;
