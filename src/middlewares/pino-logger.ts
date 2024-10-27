import env from '@/env';
import { pinoLogger } from 'hono-pino';

export function usePinoLogger() {
  return pinoLogger({ pino: { level: env.LOG_LEVEL || 'info' } });
}
