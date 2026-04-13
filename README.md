# Wortlabor

Digitales Spiel für erfundene Wörter und kreative Zuordnungen.

## Modernization status

This project was modernized from an older Create React App stack. The current baseline runs on Node 24 with React 19, MobX 6, React-DnD 16, Firebase 12, and Firebase CLI 15.

## Current baseline

- Node.js: `24.14.1`
- Package manager: `yarn` classic (`1.22.22`)
- App type: React + TypeScript + MobX + Firebase Hosting / Firestore

## Local start prerequisites

1. Use Node `24.14.1`.
2. Install Yarn Classic `1.22.22`.
3. Install dependencies with `yarn install`.
4. Copy `.env.example` to `.env.local` and fill in the Firebase API key.
5. Start the dev server with `yarn start`.

## Firebase configuration

Firebase is now configured through Create React App environment variables.

The checked-in template is `.env.example`. For local development, create `.env.local` and provide at minimum:

`REACT_APP_FIREBASE_API_KEY=YOUR_FIREBASE_WEB_API_KEY`

The app no longer falls back to the original Firebase project. Configure all project-specific values in `.env.local`.

## Verified commands

The following commands were verified successfully on the pinned baseline:

- `yarn install`
- `CI=true yarn test --watchAll=false`
- `yarn build`
- `yarn start`

## Deployment

The deploy script builds the app and deploys Firebase Hosting:

`yarn deploy`

Deployment targets the Firebase project configured in `.firebaserc`. Production Firestore security rules still need to be finalized before public use.

## Modernization plan

The step-by-step plan is tracked in `docs/modernization-plan.md`.
