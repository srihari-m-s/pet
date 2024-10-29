import { createMessageObjectSchema } from 'stoker/openapi/schemas';
import { HttpStatusPhrases } from './http-status-phrases';

export const notFoundSchema = createMessageObjectSchema(
  HttpStatusPhrases.NOT_FOUND,
);
