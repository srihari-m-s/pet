import { db } from '@/db';
import { users } from '@/db/schema/users';
import { AppRouteHandler } from '@/lib/types';
import { ListRoute, SignUpRoute } from './users.routes';

export const signUp: AppRouteHandler<SignUpRoute> = async (c) => {
  const user = c.req.valid('json');
  const [instertedUser] = await db.insert(users).values(user).returning();
  return c.json(instertedUser);
};

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const usersList = await db.select().from(users);
  return c.json(usersList);
};
