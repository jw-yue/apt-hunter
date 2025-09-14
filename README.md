# Apartment Hunter

An automated tool that monitors apartment listings for specific criteria and sends SMS notifications when matching units become available.

## Features

- Monitors AMLI and Cortland apartment websites for new listings
- Filters for 2-bedroom, 2-bathroom units under $3,100 above the first floor
- Sends SMS notifications when matching units become available
- Runs on a schedule to check for new listings periodically

## Requirements

- Node.js 14+
- Required NPM packages (install with `npm install`):
  - axios
  - cheerio
  - twilio
  - dotenv
  - node-cron

## Setup

1. Clone this repository
2. Install required packages: `npm install`
3. Create a `.env` file with your Twilio credentials and phone numbers:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   TARGET_PHONE_NUMBER=5124121653
   ```
4. Run the application: `npm start`

## How It Works

The application scrapes the specified apartment websites at regular intervals. When it finds a unit that matches your criteria (2bed/2bath, under $3,100, above first floor), it sends an SMS notification to your phone with the details of the available unit.
