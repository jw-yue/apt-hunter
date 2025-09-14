import twilio from "twilio";
import dotenv from "dotenv";

// Initialize environment variables
dotenv.config();

// Initialize Twilio client
let twilioClient;

try {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
} catch (error) {
  console.error("Error initializing Twilio client:", error);
}

// Function to send SMS notification
export async function sendNotification(message) {
  // If Twilio credentials are missing, just log the message
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN ||
    !twilioClient
  ) {
    console.log("NOTIFICATION (Twilio not configured):", message);
    return;
  }

  const from = process.env.TWILIO_PHONE_NUMBER;
  const to = process.env.TARGET_PHONE_NUMBER || "5124121653"; // Use the phone number from .env or default

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from,
      to,
    });

    console.log(`Message sent: ${result.sid}`);
    return result;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
}
