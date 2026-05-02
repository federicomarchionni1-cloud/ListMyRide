# ListMyRide

An AI-powered vehicle listing assistant for iOS and Android. Upload photos of your car or motorbike, enter the UK registration plate, and the app generates a complete, ready-to-post listing in about 30 seconds.

## What it does

1. Enter your UK registration plate — vehicle details are fetched automatically from the DVLA
2. Upload 1–10 photos of the vehicle
3. AI (GPT-4o Vision) analyses the condition from the photos
4. AI generates a listing: title, description, suggested price, key selling points
5. Review and edit anything you like
6. Copy or share the listing formatted for eBay Motors, Facebook Marketplace, Autotrader, Gumtree, or any platform

No accounts needed on the destination platforms — ListMyRide just prepares the content.

---

## Tech stack

| Layer | Technology |
|---|---|
| Mobile app | React Native + Expo (managed workflow) |
| Navigation | React Navigation v7 |
| Backend | Firebase Cloud Functions (Node 20, TypeScript) |
| Auth | Firebase Auth (email/password) |
| Database | Firestore |
| File storage | Firebase Storage |
| AI | OpenAI GPT-4o + GPT-4o Vision |
| Plate lookup | DVLA Vehicle Enquiry Service API |
| State | Zustand |
| Forms | react-hook-form + zod |

---

## Prerequisites

- Node.js 20+
- Expo CLI: `npm install -g expo-cli`
- Firebase CLI: `npm install -g firebase-tools`
- An [OpenAI API key](https://platform.openai.com/api-keys)
- A [DVLA VES API key](https://developer-portal.driver-vehicle-licensing.api.gov.uk/) (free, register on GOV.UK)
- A Firebase project with Auth, Firestore, and Storage enabled

---

## Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd listmyride
npm install
cd functions && npm install && cd ..
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your Firebase client config:

```bash
cp .env.example .env
```

The Firebase client keys are safe to include — security is enforced by Firestore/Storage rules.

### 3. Set Cloud Function secrets

These secrets are **never** stored in the app or `.env`. They go into Firebase Secret Manager:

```bash
firebase functions:secrets:set OPENAI_API_KEY
firebase functions:secrets:set DVLA_API_KEY
```

### 4. Deploy Firestore security rules and Cloud Functions

```bash
firebase deploy --only firestore:rules,storage,functions
```

### 5. Run the app

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `a` for Android emulator / `i` for iOS simulator.

---

## Project structure

```
listmyride/
├── App.tsx                     # Entry point
├── app.json                    # Expo config (bundle ID, permissions)
├── app.config.ts               # Dynamic config reading .env
├── functions/                  # Firebase Cloud Functions
│   └── src/
│       ├── index.ts            # dvlaLookup + analyseVehicle functions
│       ├── dvla.ts             # DVLA VES API proxy
│       ├── openai.ts           # GPT-4o Vision + listing generation
│       └── listings.ts         # Firestore write helpers
└── src/
    ├── screens/                # All screens
    ├── components/             # Reusable UI components
    ├── hooks/                  # Custom hooks
    ├── services/               # Firebase + export formatters
    ├── store/                  # Zustand stores
    ├── types/                  # TypeScript types
    ├── constants/              # Theme, platform configs
    └── utils/                  # Plate validation, image utils, formatting
```

---

## Building for production

Uses [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npx eas build:configure
npx eas build --platform ios --profile production
npx eas build --platform android --profile production
npx eas submit
```
