import koaRouter from 'koa-router';
import { graphqlKoa, graphiqlKoa } from 'graphql-server-koa';
import mapValues from 'lodash.mapvalues';
import { makeExecutableSchema } from 'graphql-tools';

import { schema, resolvers } from './schema';
import models from './models';

const router = new koaRouter();

router.post('/graphql', graphqlKoa((ctx) => ({
  schema: makeExecutableSchema({
    typeDefs: schema,
    resolvers,
  }),
  context: {
    models,
    loaders: mapValues(models, m => m.loader()),
    currentUser: ctx.currentUser,
  },
})));
router.get('/graphql', graphiqlKoa({ endpointURL: '/graphql' }));

export default () => [
  router.routes(),
  router.allowedMethods(),
];
