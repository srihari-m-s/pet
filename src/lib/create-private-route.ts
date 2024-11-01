import { authMiddleware } from '@/middlewares/auth';
import { createRoute, RouteConfig } from '@hono/zod-openapi';
import { unauthorizedResponseDef } from './constants';

type RoutingPath<P extends string> =
  P extends `${infer Head}/{${infer Param}}${infer Tail}`
    ? `${Head}/:${Param}${RoutingPath<Tail>}`
    : P;

export function createPrivateRoute<
  P extends string,
  R extends Omit<RouteConfig, 'path'> & {
    path: P;
  },
>(
  props: R,
): R & {
  getRoutingPath(): RoutingPath<R['path']>;
} {
  const middlewares = props.middleware
    ? Array.isArray(props.middleware)
      ? [authMiddleware, ...props.middleware]
      : [authMiddleware, props.middleware]
    : [authMiddleware];

  const routeConfigWithMiddleware: R = {
    ...props,
    middlewares: middlewares,
    responses: {
      ...props.responses,
      ...unauthorizedResponseDef,
    },
  };

  return createRoute(routeConfigWithMiddleware);
}
