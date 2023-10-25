const request = require('supertest');
const { server, closeServer, app, getPort } = require('../server'); 

describe('Express Server', () => {
  beforeAll((done) => {
    server();
    setTimeout(() => {
      done()
    }, 100)

  });

  afterAll((done) => {
    closeServer();
    done();
  });

  describe('POST /getLogs', () => {
    it('responds with a success message', async () => {
      const testLogs = ['log1', 'log2'].map(el => JSON.stringify(el));
      const response = await request(app)
        .post('/getLogs')
        .send({ log: testLogs, path: "/user/path/example"})

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

  describe('Server is listening on port', () => {
    it('serves on port 3695', async () => {
      const foundPort = getPort();
      expect(foundPort).toBe(3695);
    });
  });

});
