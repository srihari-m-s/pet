import { db } from '@/db';
import { usersTable } from '@/db/schema/users';
import { generatePassword } from '@/lib/generate-password';
import { HttpStatusCodes } from '@/lib/http-status-codes';
import { HttpStatusPhrases } from '@/lib/http-status-phrases';
import { sendEmail } from '@/lib/mailer';
import { hashPassword } from '@/lib/protect-password';
import { AppRouteHandler } from '@/lib/types';
import { eq } from 'drizzle-orm';
import {
  GetOneRoute,
  ListRoute,
  LoginRoute,
  PatchRoute,
  RemoveRoute,
  SignUpRoute,
} from './users.routes';

export async function getUserWithoutPassword(userId: number) {
  const [user] = await db
    .select({
      id: usersTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      email: usersTable.email,
      mobile: usersTable.mobile,
      emailVerifiedAt: usersTable.emailVerifiedAt,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  return user;
}

export async function getUserListWithoutPassword() {
  const users = await db
    .select({
      id: usersTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      email: usersTable.email,
      mobile: usersTable.mobile,
      emailVerifiedAt: usersTable.emailVerifiedAt,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
    })
    .from(usersTable);
  return users;
}

export const signUp: AppRouteHandler<SignUpRoute> = async (c) => {
  const user = c.req.valid('json');

  const randomPassword = generatePassword();

  // todo: handle email transfer failure
  await sendEmail(
    user.email,
    'Welcome to your PET',
    `Here is your temporary password - ${randomPassword}. Please reset your password once you login.`,
  );

  // todo: handle hash fail
  const hashedPassword = await hashPassword(randomPassword);

  const newUser = { ...user, password: hashedPassword };

  const [{ password, ...insertedUser }] = await db
    .insert(usersTable)
    .values(newUser)
    .returning();
  return c.json(insertedUser, HttpStatusCodes.OK);
};

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const usersList = await getUserListWithoutPassword();
  return c.json(usersList);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid('param');
  const user = await getUserWithoutPassword(id);

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
  const [{ password, ...user }] = await db
    .update(usersTable)
    .set(updatedUser)
    .where(eq(usersTable.id, id))
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
  const result = await db
    .delete(usersTable)
    .where(eq(usersTable.id, id))
    .returning();

  if (!result.length)
    return c.json(
      { message: HttpStatusPhrases.NOT_FOUND },
      HttpStatusCodes.NOT_FOUND,
    );

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};

export const login: AppRouteHandler<LoginRoute> = async (c) => {
  const payload = c.req.valid('json');

  return c.body(null, HttpStatusCodes.OK);
};
