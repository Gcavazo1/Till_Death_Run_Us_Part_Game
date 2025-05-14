# Leaderboard Setup Instructions

This document provides instructions on how to set up the leaderboard system for "Til Death Run Us Part" using Firebase.

## Prerequisites

1. Firebase project has been created
2. Firebase CLI is installed (`npm install -g firebase-tools`)
3. Firebase JavaScript SDK is installed (`npm install firebase`)

## Firebase Configuration

The Firebase configuration has already been set up in `src/core/firebase/FirebaseConfig.ts`.

## Security Rules Deployment

The Firestore security rules have been defined in `firestore.rules`. To deploy them:

1. Login to Firebase:
   ```
   firebase login
   ```

2. Initialize Firebase in your project (if not already done):
   ```
   firebase init
   ```
   - Select "Firestore" and any other services you need
   - When asked about rules file, specify `firestore.rules`

3. Deploy the security rules:
   ```
   firebase deploy --only firestore:rules
   ```

## Database Structure

The leaderboard uses a Firestore collection with the following structure:

- Collection: `leaderboard`
- Document fields:
  - `name`: string (player name)
  - `score`: number (player score)
  - `platform`: string ('mobile' or 'desktop')
  - `timestamp`: timestamp (when the score was achieved)
  - `level`: number (difficulty level reached)

## Components Implemented

The following components have been implemented:

1. `FirebaseConfig.ts` - Firebase configuration
2. `LeaderboardService.ts` - Service for interacting with Firestore
3. `NameEntryModal.ts` - Modal for entering player name when achieving a high score
4. `LeaderboardModal.ts` - Modal for displaying the leaderboard

## Integration with Game

The leaderboard system has been integrated with the game:

1. In `BaseGameScene.ts`:
   - Leaderboard services and modals are initialized
   - Game over screen includes a leaderboard button
   - High scores are checked and the name entry modal is displayed if appropriate

2. In `DesktopGameScene.ts`:
   - Leaderboard button added to the start screen

## Verification

Once deployed, verify the leaderboard functionality by:

1. Playing the game and achieving a score
2. Checking if the score appears in the leaderboard
3. Verifying that platform filtering works
4. Testing the share functionality

## Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Verify that Firebase authentication is working
3. Ensure Firestore rules are properly deployed
4. Check that your Firebase project has Firestore enabled in the Firebase Console

## Future Enhancements

Potential future enhancements include:

1. Weekly/Monthly leaderboards
2. Friend challenges
3. Achievements
4. More detailed leaderboard statistics 