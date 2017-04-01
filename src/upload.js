import formidable from 'formidable';
import Song from './models/song';

export default function uploadHandler(ctx) {
  if (ctx.path !== '/upload' || ctx.method !== 'POST') {
    return;
  }

  const form = formidable.IncomingForm();
  form.keepExtensions = true;

  // TODO: Validate extensions

  return new Promise((res, rej) => {
    form.parse(ctx.req, ())
  });
}
