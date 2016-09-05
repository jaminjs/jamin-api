//@flow
import knex from '../../knex';
import handlerTypeMatcher from './handler-type-matcher';
import buildParams from './build-params';

type ModelConfig = {
  name: string,
  pluralName: ?string,
};

export default function({
  name,
  pluralName = `${name}s`,
  tableName = pluralName,
} : ModelConfig) {
  const table = knex(tableName);

  const handlers = {
    *list(ctx) {
      const params = buildParams(ctx.query);
      const rows = yield table.select(params).then();

      ctx.body = {
        data: rows,
      };
    },
    *instance(ctx) {
      ctx.body = name;
    },
    *update(ctx) {
      ctx.body = 'update';
    },
    *create(ctx) {
      ctx.body = 'create';
    },
    *delete(ctx) {
      ctx.body = 'delete';
    },
  };

  const typeMatcher = handlerTypeMatcher({ pluralName });

  return class Model {
    static *Handler(next) {
      const ctx = this;

      const type = typeMatcher(ctx);

      if (type != null) {
        yield* handlers[type](ctx);
      }

      return yield* next;
    }
  };
}
