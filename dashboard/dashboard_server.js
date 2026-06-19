const express = require('express');
const path = require('path');
const MandellOS = require('../run.js');
const TerminalArchitect = require('../engine/terminal_architect.js');

const app = express();
const port = parseInt(process.env.DASHBOARD_PORT || '3000', 10);
const workers = process.env.DASHBOARD_WORKERS ? Math.max(1, parseInt(process.env.DASHBOARD_WORKERS, 10)) : 0;

const os = new MandellOS({ stream: false, workers, distributed: false, discover: false, selfmod: false });
const architect = new TerminalArchitect();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    aiReady: architect.aiReady,
    provider: architect.provider,
    model: architect.model,
    dashboardPort: port,
  });
});

app.post('/api/execute', async (req, res) => {
  const seed = req.body.seed || '';
  if (!seed.trim()) {
    return res.status(400).json({ error: 'Missing Mandell seed.' });
  }

  const result = await os.execute(seed);
  res.json({ source: 'runtime', result });
});

app.post('/api/ai', async (req, res) => {
  const seed = req.body.seed || '';
  if (!seed.trim()) {
    return res.status(400).json({ error: 'Missing seed for AI.' });
  }

  const aiResult = await architect.processInput(seed);
  res.json({ source: 'ai', result: aiResult });
});

app.post('/api/execute-ai', async (req, res) => {
  const seed = req.body.seed || '';
  if (!seed.trim()) {
    return res.status(400).json({ error: 'Missing seed for AI execution.' });
  }

  const aiResult = await architect.processInput(seed);
  const mandellCode = aiResult.mandellCode || aiResult.response;
  if (!mandellCode) {
    return res.status(500).json({ error: 'AI did not return a Mandell seed.', aiResult });
  }

  const executionResult = await os.execute(mandellCode);
  res.json({ source: 'ai-execution', aiResult, executionResult });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function startServer() {
  return new Promise(resolve => {
    app.listen(port, () => {
      console.log(`🌐 Mandell Dashboard running at http://localhost:${port}`);
      resolve();
    });
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
