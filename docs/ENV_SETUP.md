# Environment Variables Setup

This document explains how to set up environment variables for the "Til Death Run Us Part" game.

## Firebase Configuration

To keep your Firebase credentials secure, it's recommended to use environment variables instead of hardcoding them in your source code.

### Creating the .env File

1. Create a file named `.env` in the root of your project with the following content:

```
# Firebase Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

Replace these values with your own Firebase project credentials if needed.

### Using Environment Variables

The Firebase configuration in `src/core/firebase/FirebaseConfig.ts` has been updated to use these environment variables with fallbacks to hardcoded values.

### Important Notes

1. **Security**: Never commit your `.env` file to version control. It's already added to `.gitignore` to prevent accidental commits.
2. **For Production**: When deploying to production, set these environment variables in your hosting platform's environment configuration.
3. **Local Development**: The `.env` file will be loaded automatically by Vite during development.

## Troubleshooting

If you encounter issues with environment variables:

1. Ensure your `.env` file is in the root directory of the project
2. Verify that all variable names are prefixed with `VITE_` as required by Vite
3. Restart your development server after making changes to the `.env` file

## Additional Resources

- [Vite Env Variables Documentation](https://vitejs.dev/guide/env-and-mode.html)
- [Firebase Web Setup Guide](https://firebase.google.com/docs/web/setup)
