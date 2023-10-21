const request = require('supertest');
const { server, closeServer, app } = require('../server'); 

describe('Express Server', () => {
  beforeAll(() => {
    server();
  });

  afterAll((done) => {
    closeServer();
    done();
  });

  describe('POST /getLogs', () => {
    it('responds with a success message', async () => {
      const response = await request(app)
        .post('/getLogs')
        .send({ log: ['log1', 'log2'], path: '/user/path/example' });
      expect(response.status).toBe(200);
      expect(response.text).toBe('Received');
    });

    it('handles errors', async () => {
      const response = await request(app)
        .post('/getLogs')
        .send({ log: 'invalid log' }); 
      expect(response.status).toBe(500); 
    });
  });

  describe('Unknown Routes Handler', () => {
    it('responds with a 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route');
      expect(response.status).toBe(404);
      expect(response.text).toBe('This is not the page you\'re looking for...');
    });
  });
});
