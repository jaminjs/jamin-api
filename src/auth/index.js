import jwt from 'jsonwebtoken';
import koaRouter from 'koa-router';

// Koa router for any auth-related endpoints
const router = new koaRouter({
  prefix: '/auth',
});

// Sign in (create token)
router.post('/token', (ctx) => {

});

export default () => [
  router.routes(),
  router.allowedMethods(),
];

// Middleware that attaches the current user object to the koa context
export function attachCurrentUser(ctx) {
  const authHeader = ctx.headers.Authorization;


}
