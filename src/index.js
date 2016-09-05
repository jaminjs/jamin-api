//@flow

import koa from 'koa';
import qs from 'koa-qs';
import json from 'koa-json';
import models from './models';

const PORT = (+process.env.PORT) || 4000;

const app = koa();
qs(app); // enable consistent, extended querystring parsing
app.use(json());

// Add REST endpoints for each of our models
for (const model of models) {
  app.use(model.Handler);
}

console.log(`Listening on port ${PORT}...`);
app.listen(PORT);
