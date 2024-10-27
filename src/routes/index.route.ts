import { createRouter } from '@/lib/create-app';
import { HttpStatusCodes } from '@/lib/http-status-codes';
import { createRoute } from '@hono/zod-openapi';
import { jsonContent } from 'stoker/openapi/helpers';
import { createMessageObjectSchema } from 'stoker/openapi/schemas';

const router = createRouter().openapi(
  createRoute({
    tags: ['index'],
    method: 'get',
    path: '/',
    responses: {
      [HttpStatusCodes.OK]: jsonContent(
        createMessageObjectSchema('PET API'),
        'PET API index',
      ),
    },
  }),
  (c) => {
    return c.json({ message: 'GET: PET api index' }, HttpStatusCodes.OK);
  },
);

export default router;
