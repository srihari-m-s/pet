import {
  insertUsersSchema,
  selectUsersSchema,
  signUpUsersSchema,
} from '@/db/schema/users';
import { HttpStatusCodes } from '@/lib/http-status-codes';
import { createRoute, z } from '@hono/zod-openapi';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';

const tags = ['users'];

export const signUp = createRoute({
  tags: tags,
  method: 'post',
  path: '/users/sign_up',
  request: {
    body: jsonContentRequired(signUpUsersSchema, 'users_create'),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(insertUsersSchema, 'users_sign_up'),
  },
});

export type SignUpRoute = typeof signUp;

export const list = createRoute({
  tags,
  method: 'get',
  path: '/users',
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      z.array(selectUsersSchema),
      'users_list',
    ),
  },
});

export type ListRoute = typeof list;
