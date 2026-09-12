/**
 * TrustLens Local Dashboard Server
 *
 * Serves the interactive 4-view investigator UI and handles JSON investigation requests.
 */

import * as http from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEMO_SCENARIOS } from './scenarios.js';
import { TrustLensInvestigator } from './investigator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UI_PATH = path.join(__dirname, 'ui', 'index.html');

export function startTrustLensServer(port: number = 3000): Promise<{ server: http.Server; url: string }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

      // CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      // 1. API: List Scenarios
      if (url.pathname === '/api/scenarios' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(DEMO_SCENARIOS));
        return;
      }

      // 2. API: Run Investigation
      if (url.pathname === '/api/investigate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body || '{}');
            const targetUrl = parsed.url;
            const category = parsed.category;

            if (!targetUrl || typeof targetUrl !== 'string') {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Missing required "url" field in request body.' }));
              return;
            }

            const investigator = new TrustLensInvestigator({ category });
            const report = await investigator.investigate(targetUrl);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(report));
          } catch (err: any) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err?.message || 'Investigation error' }));
          }
        });
        return;
      }

      // 3. UI static page
      if (url.pathname === '/' || url.pathname === '/index.html') {
        try {
          const html = fs.readFileSync(UI_PATH, 'utf-8');
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(html);
        } catch (err: any) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Failed to load TrustLens UI template: ' + err.message);
        }
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    });

    server.once('error', reject);
    server.listen(port, () => {
      resolve({ server, url: `http://localhost:${port}` });
    });
  });
}
