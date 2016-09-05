//@flow
import pathToRegExp from 'path-to-regexp';

type ModelConfig = {
  name: string,
  pluralName: ?string,
};

export default function({
  name,
  pluralName = `${name}s`,
} : ModelConfig) {
  function *ListHandler(ctx) {
    ctx.body = pluralName;
  }

  function *InstanceHandler(ctx) {
    ctx.body = name;
  }

  function *UpdateHandler(ctx) {
    ctx.body = `Update ${name}`;
  }

  function *CreateHandler(ctx) {
    ctx.body = `Create ${name}`;
  }

  function *DeleteHandler(ctx) {
    ctx.body = `Delete ${name}`;
  }

  const pluralPath = pathToRegExp(`/${pluralName}`);
  const singularPath = pathToRegExp(`/${pluralName}/:id`);

  return class Model {
    static *Handler(next) {
      const ctx = this;

      const pluralMatch = pluralPath.exec(ctx.path);

      if (pluralMatch) {
        if (ctx.method === 'GET' || ctx.method === 'HEAD') {
          yield* ListHandler(ctx);
        } else if (ctx.method === 'POST') {
          yield* CreateHandler(ctx);
        }
      }

      const singularMatch = singularPath.exec(ctx.path);

      if (singularMatch) {
        ctx.id = singularMatch[1];
        if (ctx.method === 'GET' || ctx.method === 'HEAD') {
          yield* InstanceHandler(ctx);
        } else if (ctx.method === 'PUT') {
          yield* UpdateHandler(ctx);
        } else if (ctx.method === 'DELETE') {
          yield* DeleteHandler(ctx);
        }
      }

      return yield* next;
    }
  };
}
