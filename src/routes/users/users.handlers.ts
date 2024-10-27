import { AppRouteHandler } from '@/lib/types';
import { LoginRoute } from './users.routes';

export const login: AppRouteHandler<LoginRoute> = (c) => {
  return c.json({ access: 'example access token' });
};
