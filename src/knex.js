import init from 'knex';
import config from './config';

export default init(config.knex);
