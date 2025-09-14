// Simple endpoint for health check
export default function handler(req, res) {
  res.status(200).json({
    status: "active",
    message: "Apartment Hunter is running",
    lastCheck: new Date().toISOString(),
  });
}
