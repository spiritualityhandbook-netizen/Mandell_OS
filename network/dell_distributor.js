const http = require('http');
const os = require('os');

class DellDistributor {
  constructor(port = 8080) {
    this.port = port;
    this.nodeId = `${os.hostname()}-${process.pid}`;
    this.tasks = [];
    this.server = null;
  }

  startServer() {
    this.server = http.createServer((req, res) => {
      if (req.method === 'POST' && req.url === '/dispatch') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const payload = JSON.parse(body);
            this.tasks.push(payload);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'RECEIVED', node: this.nodeId }));
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    this.server.listen(this.port);
    return this.server;
  }

  stopServer() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }

  async dispatchTask(host, port, task) {
    const payload = JSON.stringify(task);
    return new Promise((resolve, reject) => {
      const req = http.request(
        { hostname: host, port, path: '/dispatch', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } },
        res => {
          let data = '';
          res.on('data', chunk => { data += chunk; });
          res.on('end', () => resolve(JSON.parse(data)));
        }
      );
      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }
}

module.exports = DellDistributor;
