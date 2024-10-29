import { db } from '@/db';
import { users } from '@/db/schema/users';
import { HttpStatusCodes } from '@/lib/http-status-codes';
import { HttpStatusPhrases } from '@/lib/http-status-phrases';
import { AppRouteHandler } from '@/lib/types';
import { eq } from 'drizzle-orm';
import {
  GetOneRoute,
  ListRoute,
  PatchRoute,
  RemoveRoute,
  SignUpRoute,
} from './users.routes';

export const signUp: AppRouteHandler<SignUpRoute> = async (c) => {
  const user = c.req.valid('json');
  const [instertedUser] = await db.insert(users).values(user).returning();
  return c.json(instertedUser, HttpStatusCodes.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const usersList = await db.select().from(users);
  return c.json(usersList);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid('param');
  const [user] = await db.select().from(users).where(eq(users.id, id));

  if (!user)
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    );

  return c.json(user, HttpStatusCodes.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const updatedUser = c.req.valid('json');
  const { id } = c.req.valid('param');
  const [user] = await db
    .update(users)
    .set(updatedUser)
    .where(eq(users.id, id))
    .returning();

  if (!user)
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    );

  return c.json(user, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const { id } = c.req.valid('param');
  const result = await db.delete(users).where(eq(users.id, id)).returning();

  if (!result.length)
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    );

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
