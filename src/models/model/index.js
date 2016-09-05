//@flow
import isEmpty from 'lodash.isempty';

import knex from '../../knex';
import handlerTypeMatcher from './handler-type-matcher';
import buildParams from './build-params';

type ModelConfig = {
  name: string,
  pluralName: ?string,
  tableName: ?string,
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
      const rows = yield table.where(params).then();

      ctx.body = {
        data: rows,
      };
    },
    *instance(ctx) {
      const rows = yield table.where({ id: ctx.id }).limit(1).then();

      if (isEmpty(rows)) {
        ctx.status = 404;
        ctx.body = {
          error: 'Not found',
        };
      } else {
        ctx.body = {
          data: rows[0],
        };
      }
    },
    *update(ctx) {
      yield table.where({ id: ctx.id }).update(ctx.request.body);

      yield* handlers.instance(ctx);
    },
    *create(ctx) {
      const params = ctx.request.body;

      if (Array.isArray(params)) {
        ctx.status = 400;
        ctx.body = {
          error: `This endpoint only creates one ${name} at a time`,
        };
        return;
      }

      const insertedIDs = yield table.insert(params);
      ctx.id = insertedIDs[0];
      ctx.status = 201;

      yield* handlers.instance(ctx);
    },
    *delete(ctx) {
      const numDeleted = yield table.where({ id: ctx.id }).del().then();

      ctx.body = {
        deleted: numDeleted,
      };
    },
  };

  const typeMatcher = handlerTypeMatcher({ pluralName });

  function *Handler(next) {
    const ctx = this;

    // this also adds ctx.id for instance endpoints
    const type = typeMatcher(ctx);

    if (type != null) {
      yield* handlers[type](ctx);
    }

    return yield* next;
  }

  return {
    Handler,
  };
}
