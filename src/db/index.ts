import env from '@/env';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const queryClient = postgres(env.DATABASE_URL);
const db = drizzle(queryClient);

export { db };
