// Simple status API endpoint
export default function handler(req, res) {
  res.status(200).json({
    status: "active",
    message: "Apt Unit Finder API is running",
    lastCheck: new Date().toISOString(),
  });
}
