import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router';
import { ViewerPage, viewerSearchSchema } from './routes/viewer';
import { AppShell } from './routes/app/shell';
import { AppHome } from './routes/app/home';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const viewerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: viewerSearchSchema,
  component: ViewerPage,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: AppShell,
});

const appIndexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/',
  component: AppHome,
});

const routeTree = rootRoute.addChildren([
  viewerRoute,
  appRoute.addChildren([appIndexRoute]),
]);

export const router = createRouter({ routeTree });
