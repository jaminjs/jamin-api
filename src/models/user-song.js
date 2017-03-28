import Model from './model';

import User from './user';
import Song from './song';

export default Model({
  name: 'user_song',
  tableName: 'user_song',
  schema: [...User.schema, ...Song.schema, `
    type UserSong {
      user: User!
      song: Song!
      rating: Int
    }
  `],
  defaults: {
    rating: 0,
  },
});
