//@flow
import isEmpty from 'lodash.isempty';
import keyBy from 'lodash.keyby';
import omit from 'lodash.omit';
import pick from 'lodash.pick';
import DataLoader from 'dataloader';

import knex from '../../knex';
import handlerTypeMatcher from './handler-type-matcher';
import buildParams from './build-params';

type ModelConfig = {
  name: string,
  pluralName: ?string,
  tableName: ?string,
};

const specialParamHandlers = {
  _limit: (chain, limit) => (limit ? chain.limit(limit) : chain),
  _offset: (chain, offset) => (offset ? chain.offset(offset) : chain),
};
const specialParamKeys = Object.keys(specialParamHandlers);

function handleSpecialParams(table, params) {
  const specialParams = pick(params, specialParamKeys);

  if (isEmpty(specialParams)) {
    return table;
  }

  return Object.entries(specialParams).reduce(
    (chain, [key, val]) => specialParamHandlers[key](chain, val),
    table
  );
}

function handleRegularParams(table, params) {
  const regularParams = omit(params, specialParamKeys);

  if (isEmpty(regularParams)) {
    return table;
  }

  return table.where(buildParams(params));
}

function handleParams(table, params) {
  return handleSpecialParams(handleRegularParams(table, params), params);
}

export default function({
  name,
  schema,
  pluralName = `${name}s`,
  tableName = pluralName,
} : ModelConfig) {
  const table = knex(tableName);

  const list = (params) => handleParams(table, params).then();
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
    schema,
    loader: () => new DataLoader(ids => list({ id: { in: ids } }).then(rows => {
      const byId = keyBy(rows, 'id');
      return ids.map(id => byId[id]);
    })),
  };
}
