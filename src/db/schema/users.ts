import { z } from '@hono/zod-openapi';
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  email: text('email').notNull().unique(),
  mobile: text('mobile').notNull().unique(),
  password: text('password').notNull().unique(),
  emailVerifiedAt: timestamp('email_verified_at', { mode: 'string' }).default(
    '',
  ),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' })
    .defaultNow()
    .$onUpdateFn(() => new Date().toISOString())
    .notNull(),
});

const fullSelectUsersSchema = createSelectSchema(usersTable);

export const selectUsersSchema = fullSelectUsersSchema.omit({
  password: true,
});

export const insertUsersSchema = createInsertSchema(usersTable, {
  firstName: (s) => s.firstName.min(3).max(256),
  mobile: (s) => s.mobile.min(10),
  email: (s) => s.email.email(),
});

export const signUpUsersSchema = insertUsersSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  password: true,
  emailVerifiedAt: true,
});

export const patchUserSchema = signUpUsersSchema.partial();

export const loginSchema = insertUsersSchema
  .pick({
    password: true,
  })
  .extend({
    identifier: z.string().min(1),
  });
