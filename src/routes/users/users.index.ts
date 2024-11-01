import { createRouter } from '@/lib/create-app';
import * as handlers from './users.handlers';
import * as routes from './users.routes';

const router = createRouter()
  .openapi(routes.signUp, handlers.signUp)
  .openapi(routes.list, handlers.list)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove)
  .openapi(routes.login, handlers.login);

export default router;
