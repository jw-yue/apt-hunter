// Local development server
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

// Import API handlers
import statusHandler from './api/status.js';
import testRunHandler from './api/test-run.js';
import checkApartmentsHandler from './api/check-apartments.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Mock API endpoints
app.get('/api/status', (req, res) => {
  statusHandler(req, res);
});

app.get('/api/test-run', (req, res) => {
  testRunHandler(req, res);
});

app.get('/api/check-apartments', (req, res) => {
  checkApartmentsHandler(req, res);
});

// Default route for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Status API: http://localhost:${PORT}/api/status`);
  console.log(`Test Runner: http://localhost:${PORT}/test.html`);
});
