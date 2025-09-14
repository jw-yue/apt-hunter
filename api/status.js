// Enhanced status endpoint with more information
export default function handler(req, res) {
  // Check for the environment we're running in
  const environment = process.env.NODE_ENV || "development";
  const isVercel = process.env.VERCEL === "1";

  res.status(200).json({
    status: "active",
    message: "Apartment Hunter is running",
    lastCheck: new Date().toISOString(),
    environment,
    runtime: {
      node: process.version,
      platform: process.platform,
      vercel: isVercel,
    },
    apis: {
      status: "/api/status",
      test: "/api/test-run",
      check: "/api/check-apartments",
    },
  });
}
