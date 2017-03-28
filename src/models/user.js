import Model from './model';

export default Model({
  name: 'user',
  schema: [`
    type User {
      username: String!
      id: Int!
    }
  `],
});
