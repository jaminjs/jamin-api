//@flow

import Koa from 'koa';
import qs from 'koa-qs';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
import models from './models';
import graphql from './graphql';

const PORT = (+process.env.PORT) || 4000;

const app = new Koa();
qs(app); // enable consistent, extended querystring parsing
app.use(json());
app.use(bodyParser());

// Add REST endpoints for each of our models
for (const model of Object.values(models)) {
  app.use(model.Handler);
}

app.use(...graphql());

console.log(`Listening on port ${PORT}...`);
app.listen(PORT);
