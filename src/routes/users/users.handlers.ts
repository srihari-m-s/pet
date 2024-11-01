import { db } from '@/db';
import { usersTable } from '@/db/schema/users';
import env from '@/env';
import { notFoundResponse, unauthorizedResponse } from '@/lib/constants';
import { generatePassword } from '@/lib/generate-password';
import { HttpStatusCodes } from '@/lib/http-status-codes';
import { HttpStatusPhrases } from '@/lib/http-status-phrases';
import { sendEmail } from '@/lib/mailer';
import { comparePassword, hashPassword } from '@/lib/protect-password';
import { AppRouteHandler } from '@/lib/types';
import { z } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';
import { setCookie } from 'hono/cookie';
import { sign, verify } from 'hono/jwt';
import { JWTPayload } from 'hono/utils/jwt/types';
import {
  getUserByIdentifier,
  getUserList,
  getUserWithId,
  updateUserEmailVerification,
} from './users.helpers';
import {
  ForgotPasswordRoute,
  GetOneRoute,
  ListRoute,
  LoginRoute,
  PatchRoute,
  RemoveRoute,
  ResetPasswordRoute,
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
        { message: HttpStatusPhrases.INTERNAL_SERVER_ERROR },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  const jwtPayload = {
    userId: user.id,
    exp:
      Math.floor(Date.now() / 1000) + 60 * 60 * Number(env.AUTH_TOKEN_EXPIRY),
  };
  const token = await sign(jwtPayload, env.AUTH_SECRET);

  setCookie(c, env.AUTH_COOKIE, token, { httpOnly: true });

  return c.json({ message: HttpStatusPhrases.OK }, HttpStatusCodes.OK);
};

export const forgotPassword: AppRouteHandler<ForgotPasswordRoute> = async (
  c,
) => {
  const { email } = c.req.valid('json');

  const user = await getUserByIdentifier(email, true);
  if (!user) {
    return notFoundResponse(c);
  }

  const slugTokenPayload: JWTPayload = {
    userId: user.id,
    exp: Math.floor(Date.now() / 1000) + 60 * 15,
  };

  const slug = await sign(slugTokenPayload, env.AUTH_SECRET);

  sendEmail(
    email,
    'Reset Password',
    `Here is the link to reset your password. Please do not share this link -\n http://localhost:3000/users/reset_password/${slug} \n The link will expire in 15 minutes`,
  );

  return c.json(
    { message: `Reset link has been sent to ${email}` },
    HttpStatusCodes.OK,
  );
};

export const resetPassword: AppRouteHandler<ResetPasswordRoute> = async (c) => {
  const { password } = c.req.valid('json');
  const { slug } = c.req.valid('param');

  let userId: number = 0;

  try {
    const decoded = await verify(slug, env.AUTH_SECRET);
    userId = Number(decoded.userId);
  } catch {
    return c.json({ message: 'Link Expired!' }, HttpStatusCodes.FORBIDDEN);
  }

  const hashedPassword = await hashPassword(password);

  await db
    .update(usersTable)
    .set({ password: hashedPassword })
    .where(eq(usersTable.id, userId));

  return c.json(
    { message: 'Password was reset succesfully' },
    HttpStatusCodes.OK,
  );
};
