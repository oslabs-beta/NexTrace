const { server, closeServer } = require('../server');
const app = require('express')();
const { expect } = require('jest');

describe('Server', () => {
  let serverInstance;
  const port = 3695;

  beforeAll(() => {
    serverInstance = server();
  });

  afterAll(() => {
    closeServer(serverInstance);
  });

  it('should start the server', async () => {
    const response = await app.inject({ method: 'GET', url: '/' });
    expect(response.statusCode).toBe(200);
  });
});