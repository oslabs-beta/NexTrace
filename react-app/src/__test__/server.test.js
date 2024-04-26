const request = require('supertest');
const { server, closeServer, app, getPort, stagedData } = require('../server');

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
        .send({ log: testLogs, path: "/user/path/example" })

      expect(response.status).toBe(200);
      expect(response.text).toBe('Received');

    });

    it('stages data that is incomplete', async () => {
      jest.mock('../server', () => {
        return {
          stagedData: { TestLog: { name: 'something other than an empty string' } }
        }
      })

      const logData = ['TestLog', 200, 'NTASYNC'].map(el => JSON.stringify(el));
      const response = await request(app)
        .post('/getLogs')
        .send({ log: logData, path: '/user/path/example' })
      expect(stagedData.TestLog.name).toBe('')
      expect(stagedData.TestLog.type).toBe('')
      expect(stagedData.TestLog.method).toBe('')
      expect(stagedData.TestLog.duration).toBe(0)
      expect(stagedData.TestLog.status).toBe(200)
      expect(stagedData.TestLog.rendering).toBe('')
      expect(stagedData.TestLog.start).toBe(0)
    })

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
