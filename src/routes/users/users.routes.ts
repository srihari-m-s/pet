import { HttpStatusCodes } from '@/lib/http-status-codes';
import { createRoute, z } from '@hono/zod-openapi';
import { jsonContent } from 'stoker/openapi/helpers';

const tags = ['users'];

export const login = createRoute({
  tags: tags,
  method: 'post',
  path: '/users/login',
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({ access: z.string() }),
      'users login',
    ),
  },
});

export type LoginRoute = typeof login;
