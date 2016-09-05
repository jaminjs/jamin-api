import pathToRegExp from 'path-to-regexp';

export default function matcher({ pluralName }){
  const pluralPath = pathToRegExp(`/${pluralName}`);
  const singularPath = pathToRegExp(`/${pluralName}/:id`);

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

    return null;
  };
}
