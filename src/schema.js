import flatten from 'lodash.flatten';
import models from './models';

const rootSchema = [`
type Query {
  songs(
    offset: Int,
    limit: Int
  ): [Song]

  song(id: Int): Song
}

schema {
  query: Query
}
`];

const rootResolvers = {
  Query: {
    async songs(root, { offset, limit }, context) {
      const songs = await context.models.Song.list({
        _limit: limit,
        _offset: offset,
      });

      for (const song of songs) {
        context.loaders.Song.prime(song.id, song);
      }

      return songs;
    },
  },
};

export const schema = flatten([
  ...rootSchema,
  ...Object.values(models).map(m => m.schema),
]);
export const resolvers = {
  ...rootResolvers,
};
