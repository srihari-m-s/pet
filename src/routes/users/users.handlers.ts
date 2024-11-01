import { db } from '@/db';
import { usersTable } from '@/db/schema/users';
import { unauthorizedResponse } from '@/lib/constants';
import { generatePassword } from '@/lib/generate-password';
import { HttpStatusCodes } from '@/lib/http-status-codes';
import { HttpStatusPhrases } from '@/lib/http-status-phrases';
import { sendEmail } from '@/lib/mailer';
import { comparePassword, hashPassword } from '@/lib/protect-password';
import { AppRouteHandler } from '@/lib/types';
import { z } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';
import {
  getUserByIdentifier,
  getUserList,
  getUserWithId,
  updateUserEmailVerification,
} from './users.helpers';
import {
  GetOneRoute,
  ListRoute,
  LoginRoute,
  PatchRoute,
  RemoveRoute,
  SignUpRoute,
} from './users.routes';

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
  const usersList = await getUserList();
  return c.json(usersList);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const { id } = c.req.valid('param');
  const user = await getUserWithId(id);

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

  const isEmail = z.string().email().safeParse(payload.identifier).success;
  const isMobile = z
    .string()
    .regex(/^[0-9]{10}$/)
    .safeParse(payload.identifier).success;

  if (!isEmail && !isMobile) {
    return unauthorizedResponse(c);
  }

  if (!isEmail && !isMobile) {
    return unauthorizedResponse(c);
  }

  // Retrieve user by email or mobile
  const user = await getUserByIdentifier(payload.identifier, isEmail);
  if (!user) {
    return unauthorizedResponse(c);
  }

  // Verify password
  const verified = await comparePassword(payload.password, user.password);
  if (!verified) {
    return unauthorizedResponse(c);
  }

  // Update email verification date if it hasn't been verified
  if (user.createdAt === user.emailVerifiedAt) {
    const updated = await updateUserEmailVerification(user.id);
    if (!updated) {
      return c.json(
        { message: 'Internal Server Error' },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  return c.json({ message: HttpStatusPhrases.OK }, HttpStatusCodes.OK);
};
