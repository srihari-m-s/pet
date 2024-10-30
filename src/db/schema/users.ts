import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  email: text('email').notNull(),
  mobile: text('mobile').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const selectUsersSchema = createSelectSchema(usersTable);

export const insertUsersSchema = createInsertSchema(usersTable, {
  firstName: (s) => s.firstName.min(3).max(256),
  mobile: (s) => s.mobile.min(10),
  email: (s) => s.email.email(),
});

export const signUpUsersSchema = insertUsersSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const patchUserSchema = signUpUsersSchema.partial();
