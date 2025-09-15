// Local development server
import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

// Import API handlers
import statusHandler from "./api/status.js";
import testRunHandler from "./api/test-run.js";
import checkApartmentsHandler from "./api/check-apartments.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// API endpoints with logging
app.get("/api/status", (req, res) => {
  console.log("API request received: /api/status");
  try {
    statusHandler(req, res);
    console.log("API request completed: /api/status");
  } catch (error) {
    console.error("Error in status handler:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/test-run", (req, res) => {
  console.log("API request received: /api/test-run");
  try {
    testRunHandler(req, res);
    console.log("API request completed: /api/test-run");
  } catch (error) {
    console.error("Error in test-run handler:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/check-apartments", (req, res) => {
  console.log("API request received: /api/check-apartments");
  try {
    checkApartmentsHandler(req, res);
    console.log("API request completed: /api/check-apartments");
  } catch (error) {
    console.error("Error in check-apartments handler:", error);
    res.status(500).json({ error: error.message });
  }
});

// Default route for root path
app.get("/", (req, res) => {
  console.log("Request received for root path");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Add a test endpoint that returns simple JSON
app.get("/test", (req, res) => {
  console.log("Test endpoint called");
  res.json({ status: "ok", message: "Test endpoint is working" });
});

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Status API: http://localhost:${PORT}/api/status`);
  console.log(`Test Runner: http://localhost:${PORT}/test.html`);
});
