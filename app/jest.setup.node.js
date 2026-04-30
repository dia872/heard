// Setup file for the 'node' jest project — runs after the framework so
// beforeAll/afterEach/afterAll are available, then wires MSW for HTTP
// mocking and a fetch shim for older Node versions.

require('cross-fetch/polyfill');
const { server } = require('./src/test/server');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
