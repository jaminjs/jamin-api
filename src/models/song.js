import path from 'path';
import send from 'koa-send';

import Model from './model';

const root = path.resolve(__dirname, '../..');

export default Model({
  name: 'song',
  schema: [`
    type Song {
      title: String!
      path: String!
      id: Int!
    }
  `],
  customInstanceHandlers: {
    async file(ctx) {
      await send(ctx, ctx.instance.path, { root });
    },
  },
});
