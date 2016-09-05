import pickBy from 'lodash.pickby';
import isEmpty from 'lodash.isempty';

const operators = {
  in(ctx, field, val) {
    ctx.whereIn(field, val);
  },
};

export default function buildParams(query) {
  const complexValues = pickBy(
    query,
    (val) => !!val && typeof val === 'object'
  );
  const simpleValues = pickBy(
    query,
    (val) => !val || typeof val !== 'object'
  );

  if (isEmpty(complexValues)) {
    // We only have simple equality check values, so just let it be an object
    // to be passed to knex.
    return simpleValues;
  }

  // With more interesting filters, we need to chain a bunch of .where calls.
  // Since we can't explicitly chain calls (this.where().where().where()...),
  // we instead store the value of each previous .where call, which ends up
  // being basically the same as regular chaining.
  //
  // I don't know knex well enough to know if this is actually necessary, or if
  // maybe there's a better way...
  return function() {
    let chain = this;
    if (!isEmpty(simpleValues)) {
      chain = chain.where(simpleValues);
    }

    for (const field in complexValues) {
      const fieldParams = complexValues[field];
      for (const operator in fieldParams) {
        const fn = operators[operator];
        const val = fieldParams[operator];
        chain = chain.where(function() { fn(this, field, val); });
      }
    }
  };
}
