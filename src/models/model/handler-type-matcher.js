import pathToRegExp from 'path-to-regexp';
import mapValues from 'lodash.mapvalues';

export default function matcher({
  customInstanceHandlers,
  customListHandlers,
  pluralName,
}){
  const pluralPath = pathToRegExp(`/${pluralName}`);
  const singularPath = pathToRegExp(`/${pluralName}/:id`);
  const customInstancePaths = mapValues(customInstanceHandlers, (_h, name) =>
    pathToRegExp(`/${pluralName}/:id/${name}`)
  );
  const customListPaths = mapValues(customListHandlers, (_h, name) =>
    pathToRegExp(`/${pluralName}/${name}`)
  );

  return function(ctx) {
    const pluralMatch = pluralPath.exec(ctx.path);

    if (pluralMatch) {
      if (ctx.method === 'GET' || ctx.method === 'HEAD') {
        return 'list';
      } else if (ctx.method === 'POST') {
        return 'create';
      }
    }

    const singularMatch = singularPath.exec(ctx.path);

    if (singularMatch) {
      ctx.id = singularMatch[1];
      if (ctx.method === 'GET' || ctx.method === 'HEAD') {
        return 'instance';
      } else if (ctx.method === 'PUT') {
        return 'update';
      } else if (ctx.method === 'DELETE') {
        return 'delete';
      }
    }

    for (const [name, matcher] of Object.entries(customInstancePaths)) {
      const match = matcher.exec(ctx.path);
      if (match) {
        ctx.id = match[1];
        return customInstanceHandlers[name];
      }
    }

    for (const [name, matcher] of Object.entries(customListPaths)) {
      if (matcher.exec(ctx.path)) {
        return customListHandlers[name];
      }
    }

    return null;
  };
}
