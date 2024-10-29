import {
  insertUsersSchema,
  selectUsersSchema,
  signUpUsersSchema,
} from '@/db/schema/users';
import { notFoundSchema } from '@/lib/constants';
import { HttpStatusCodes } from '@/lib/http-status-codes';
import { createRoute, z } from '@hono/zod-openapi';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema, IdParamsSchema } from 'stoker/openapi/schemas';

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
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(signUpUsersSchema),
      'users_sign_up_error',
    ),
  },
});

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

export const getOne = createRoute({
  tags,
  method: 'get',
  path: '/users/{id}',
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUsersSchema, 'user_by_id'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      'Invalid Id error',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'User not found'),
  },
});

export type SignUpRoute = typeof signUp;
export type ListRoute = typeof list;
export type GetOneRoute = typeof getOne;
