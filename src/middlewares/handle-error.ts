import { unauthorizedResponse } from '@/lib/constants';
import { HttpStatusCodes } from '@/lib/http-status-codes';
import { ErrorHandler } from 'hono';
import { onError } from 'stoker/middlewares';

export const handleError: ErrorHandler = (err, c) => {
  const currentStatus = 'status' in err ? err.status : undefined;

  if (currentStatus === HttpStatusCodes.UNAUTHORIZED) {
    return unauthorizedResponse(c);
  } else {
    return onError(err, c);
  }
};
