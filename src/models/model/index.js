//@flow
import isEmpty from 'lodash.isempty';
import flow from 'lodash.flow';

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

  const list = flow(buildParams, (p) => table.where(p).then());
  const instance = (id) => table.where({ id }).limit(1).then(rows => rows[0]);
  const update = (id, changes) => table.where({ id }).update(changes);
  const create = (data) => table.insert(data);
  const del = (id) => table.where({ id }).del().then();

  const handlers = {
    async list(ctx) {
      const rows = await list(ctx.query);

      ctx.body = {
        data: rows,
      };
    },
    async instance(ctx) {
      const row = await instance(ctx.id);

      if (isEmpty(row)) {
        ctx.status = 404;
        ctx.body = {
          error: 'Not found',
        };
      } else {
        ctx.body = {
          data: row,
        };
      }
    },
    async update(ctx) {
      await update(ctx.id, ctx.request.body);

      await handlers.instance(ctx);
    },
    async create(ctx) {
      const params = ctx.request.body;

      if (Array.isArray(params)) {
        ctx.status = 400;
        ctx.body = {
          error: `This endpoint only creates one ${name} at a time`,
        };
        return;
      }

      const insertedIDs = await create(params);
      ctx.id = insertedIDs[0];
      ctx.status = 201;

      await handlers.instance(ctx);
    },
    async delete(ctx) {
      const numDeleted = await del(ctx.id);

      ctx.body = {
        deleted: numDeleted,
      };
    },
  };

  const typeMatcher = handlerTypeMatcher({ pluralName });

  async function Handler(ctx, next) {
    // this also adds ctx.id for instance endpoints
    const type = typeMatcher(ctx);

    if (type != null) {
      await handlers[type](ctx);
    }

    return await next();
  }

  return {
    create,
    del,
    instance,
    list,
    update,
    Handler,
  };
}
