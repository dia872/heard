import { setupServer } from 'msw/node';
import type { RequestHandler } from 'msw';

// Test-time MSW server. Add per-test handlers via server.use(...).
export const server = setupServer();

// Optional helper to keep test files terse.
export function withHandlers(...handlers: RequestHandler[]) {
  server.use(...handlers);
}
