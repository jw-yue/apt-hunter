# Important Information for Vercel Deployment

## Environment Variables

Make sure to configure the following environment variables in your Vercel project settings:

- `TWILIO_ACCOUNT_SID`: Your Twilio account SID
- `TWILIO_AUTH_TOKEN`: Your Twilio auth token
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number (with country code)
- `TARGET_PHONE_NUMBER`: The phone number to receive SMS notifications (5124121653)

## Troubleshooting

### 500 Errors

If you're seeing 500 errors when accessing the web interface:

1. Check that your environment variables are set correctly in Vercel
2. Verify the build output in Vercel for any errors
3. Make sure the API routes are defined correctly in `vercel.json`
4. Look at the Vercel Function logs for detailed error messages

### Build Settings

If you see warnings about builds in your project settings:

- This is normal because we're defining our own build configuration in `vercel.json`
- The warning can be ignored as long as the deployment is working

### Testing the Deployment

1. Visit the root URL to verify the app is running
2. Navigate to `/test.html` to run a manual test
3. Check the logs in Vercel to confirm the daily cron job is running

## Local Development

For local development, you'll need to create a `.env` file with the same variables as listed above. Run `npm start` to start the application locally.

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Twilio Documentation](https://www.twilio.com/docs)
