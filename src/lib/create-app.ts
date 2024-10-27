import { OpenAPIHono } from '@hono/zod-openapi';
import { notFound, onError, serveEmojiFavicon } from 'stoker/middlewares';

import { usePinoLogger } from '@/middlewares/pino-logger';
import { defaultHook } from 'stoker/openapi';
import { AppBindings } from './types';

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook: defaultHook,
  });
}

export default function createApp() {
  const app = createRouter();
  app.use(serveEmojiFavicon('💲'));
  app.use(usePinoLogger());

  app.notFound(notFound);
  app.onError(onError);
  return app;
}
