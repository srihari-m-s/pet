import {
  loginSchema,
  patchUserSchema,
  selectUsersSchema,
  signUpUsersSchema,
} from '@/db/schema/users';
import { notFoundSchema } from '@/lib/constants';
import { createPrivateRoute } from '@/lib/create-private-route';
import { HttpStatusCodes } from '@/lib/http-status-codes';
import { HttpStatusPhrases } from '@/lib/http-status-phrases';
import { authMiddleware } from '@/middlewares/auth';
import { createRoute, z } from '@hono/zod-openapi';
import {
  jsonContent,
  jsonContentOneOf,
  jsonContentRequired,
} from 'stoker/openapi/helpers';
import {
  createErrorSchema,
  createMessageObjectSchema,
  IdParamsSchema,
} from 'stoker/openapi/schemas';

const tags = ['users'];

export const signUp = createRoute({
  tags: tags,
  method: 'post',
  path: '/users/sign_up',
  request: {
    body: jsonContentRequired(signUpUsersSchema, 'users signUp payload'),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUsersSchema, 'created users'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(signUpUsersSchema),
      'users signUp error',
    ),
  },
});

export const login = createRoute({
  tags: tags,
  method: 'post',
  path: '/users/login',
  request: {
    body: jsonContentRequired(loginSchema, 'login payload'),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createMessageObjectSchema('Credentials Verified'),
      'creds verified',
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createMessageObjectSchema('Invalid Credentials'),
      'Invalid credentials',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      createMessageObjectSchema(HttpStatusPhrases.INTERNAL_SERVER_ERROR),
      HttpStatusPhrases.INTERNAL_SERVER_ERROR,
    ),
  },
});

export const list = createPrivateRoute({
  tags,
  method: 'get',
  path: '/users',
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      z.array(selectUsersSchema),
      'users list',
    ),
  },
});

export const getOne = createPrivateRoute({
  tags,
  method: 'get',
  path: '/users/{id}',
  request: {
    params: IdParamsSchema,
  },
  middleware: authMiddleware,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUsersSchema, 'user by id'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(IdParamsSchema),
      'Invalid Id error',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'User not found'),
  },
});

export const patch = createPrivateRoute({
  tags: tags,
  method: 'patch',
  path: '/users/{id}',
  request: {
    params: IdParamsSchema,
    body: jsonContentRequired(patchUserSchema, 'user patch'),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUsersSchema, 'patched user'),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContentOneOf(
      [createErrorSchema(patchUserSchema), createErrorSchema(IdParamsSchema)],
      'user patch error',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, 'User not found'),
  },
});

export const remove = createPrivateRoute({
  tags: tags,
  method: 'delete',
  path: '/users/{id}',
  request: {
    params: IdParamsSchema,
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: { description: 'User deleted' },
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
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
export type LoginRoute = typeof login;
