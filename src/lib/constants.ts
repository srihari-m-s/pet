import { Context } from 'hono';
import { createMessageObjectSchema } from 'stoker/openapi/schemas';
import { HttpStatusCodes } from './http-status-codes';
import { HttpStatusPhrases } from './http-status-phrases';

export const notFoundSchema = createMessageObjectSchema(
  HttpStatusPhrases.NOT_FOUND,
);

export const unauthorizedResponse = (c: Context) => {
  return c.json(
    { message: HttpStatusPhrases.UNAUTHORIZED },
    HttpStatusCodes.UNAUTHORIZED,
  );
};
