//@flow

import Koa from 'koa';
import qs from 'koa-qs';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
import models from './models';
import graphql from './graphql';
import auth, { attachCurrentUser } from './auth';

const PORT = (+process.env.PORT) || 4000;

const app = new Koa();
qs(app); // enable consistent, extended querystring parsing
app.use(json());
app.use(bodyParser());
app.use(attachCurrentUser);

// Add REST endpoints for each of our models
for (const model of Object.values(models)) {
  app.use(model.Handler);
}

app.use(...graphql());

app.use(...auth());

console.log(`Listening on port ${PORT}...`);
app.listen(PORT);
