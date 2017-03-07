import Model from './model';

export default Model({
  name: 'song',
  schema: [`
    type Song {
      title: String!
      path: String!
    }
  `],
});
