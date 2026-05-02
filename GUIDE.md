# ListMyRide — Build Guide

A walkthrough of every decision made and how the pieces connect.

---

## Phase 1 — Project scaffold

Created with `npx create-expo-app listmyride --template blank-typescript`. Expo managed workflow was chosen over bare workflow because it handles the native build layer entirely via EAS Build, which suits a mixed-experience developer. No Podfile or Gradle knowledge needed.

**Path aliases** were added to `tsconfig.json` (`@/*` → `src/*`) and `babel.config.js` (`babel-plugin-module-resolver`) so imports read `import X from '@/components/...'` instead of relative paths.

**`app.config.ts`** reads Firebase client config from `EXPO_PUBLIC_` environment variables. These are safe to embed in the app bundle — they identify the Firebase project, but Firestore/Storage rules enforce who can actually read or write data.

---

## Phase 2 — Firebase setup

Firebase is initialised in `src/services/firebase/config.ts`. Key decisions:

- **Auth persistence:** `initializeAuth` with `getReactNativePersistence(AsyncStorage)` keeps the user signed in between app restarts.
- **Region:** Cloud Functions are deployed to `europe-west2` (London) to minimise latency for UK users.
- **Modular SDK:** Using `firebase/app`, `firebase/auth`, etc. (tree-shakeable) rather than the compat layer.

### Firestore collections

| Collection | Purpose |
|---|---|
| `users/{uid}` | User profile (display name, email, listing count) |
| `listings/{id}` | Each generated listing |
| `analysisJobs/{id}` | Ephemeral job progress (created and deleted per analysis run) |

### Storage paths

```
listings/{userId}/{listingId}/photos/{0-9}.jpg
```

Photos for a listing are co-located under the listing ID for easy cleanup.

---

## Phase 3 — Auth flow

`useAuth` hook subscribes to `onAuthStateChanged` and writes to Zustand `authStore`. `RootNavigator` reads from this store to decide which stack to render (Auth vs Main). This means no manual navigation calls on sign-in — React Navigation re-renders automatically when the store changes.

---

## Phase 4 — DVLA integration

The DVLA Vehicle Enquiry Service (VES) API is called via a Firebase Cloud Function (`dvlaLookup`), **not from the client**. This keeps the `DVLA_API_KEY` secret out of the app bundle.

The DVLA VES API returns: make, colour, fuel type, engine capacity, year, tax status, MOT status, MOT expiry date. It does **not** return the model name. GPT-4o infers the model from make + year + engine + fuel in the listing generation step.

UK plate normalisation strips spaces and uppercases before sending to the API.

---

## Phase 5 — AI pipeline

The `analyseVehicle` Cloud Function orchestrates the full pipeline in sequence:

```
Client uploads photos to Storage (temp path)
    → Cloud Function called with plate + photo URLs
        → DVLA lookup (plate → vehicle data)
        → GPT-4o Vision: condition analysis (photos + prompt)
        → GPT-4o: listing generation (text only — no photos = cheaper)
        → Write completed listing to Firestore
    → Client navigates to ReviewScreen
```

**Two separate GPT-4o calls** are used deliberately:
1. **Call 1 (vision):** Photos + condition prompt → structured condition JSON. No text generation here — images are expensive, so we don't waste tokens on text output in the same call.
2. **Call 2 (text only):** DVLA data + condition output + optional mileage → title, description, price estimate, specs, tags. No images attached = lower cost, faster response.

Progress is tracked via a Firestore `analysisJobs` document. The `AnalysisScreen` subscribes to this document with a real-time listener and shows each step completing as the Cloud Function writes updates. This gives the user real visual feedback without polling.

**Cost estimate per listing:** ~£0.03–0.07 (GPT-4o pricing at time of build).

---

## Phase 6 — Review & Edit screen

`ReviewScreen` subscribes to the Firestore `listings/{id}` document with a real-time listener. On first load, local form state is seeded from the Firestore data. Subsequent edits are debounced (500ms) and written back to Firestore. This means:
- Changes survive app restarts (Firestore is the source of truth)
- No explicit "Save" button needed

The price field accepts the user's own price. The AI's suggested price is shown separately as a reference.

---

## Phase 7 — Export formatters

Each platform has a formatter in `src/services/export/` that transforms the Firestore listing into platform-appropriate text. Key differences:

| Platform | Special handling |
|---|---|
| eBay | Includes a structured "Item Specifics" block; truncates to 4000 chars |
| Facebook | Adds emoji price header, placeholder for location, "DM" closing |
| Autotrader | Includes registration plate and mileage (required by platform) |
| Generic | Full listing dump — for sharing via WhatsApp, email, etc. |

Export uses `expo-clipboard` for copy and React Native `Share` for the native OS share sheet. No direct API posting to platforms — this avoids needing developer program accounts on each platform.

---

## Phase 8 — Navigation structure

```
RootNavigator
├── AuthNavigator (when not signed in)
│   ├── SignInScreen
│   └── SignUpScreen
└── MainTabNavigator (when signed in)
    ├── HomeScreen (tab)
    ├── [ListingStackNavigator pushed from HomeScreen]
    │   ├── PlateEntryScreen
    │   ├── PhotoCaptureScreen
    │   ├── AnalysisScreen
    │   ├── ReviewScreen
    │   └── ExportScreen
    └── AccountScreen (tab)
```

`AnalysisScreen` has `gestureEnabled: false` and no back button — the user must not navigate away mid-analysis as it would leave an orphaned job.

---

## Key files reference

| File | What it does |
|---|---|
| `functions/src/index.ts` | Cloud Function entry point — `dvlaLookup` and `analyseVehicle` |
| `functions/src/openai.ts` | Both GPT-4o prompt templates and API calls |
| `functions/src/dvla.ts` | DVLA VES API call |
| `src/screens/listing/AnalysisScreen.tsx` | Real-time Firestore listener driving progress UI |
| `src/screens/listing/ReviewScreen.tsx` | Editable listing form with debounced Firestore saves |
| `src/services/firebase/config.ts` | Firebase app initialisation |
| `src/store/listingDraftStore.ts` | Transient state across the 4-step listing creation flow |
| `src/constants/platforms.ts` | Platform config (char limits, colors) |

---

## Next steps (post-launch)

- **Monetization:** Add RevenueCat for credit packs (e.g. 3 listings for £2.99). Add `userCredits` to the `users` collection, decrement on `analyseVehicle` call.
- **Model name:** Integrate a third-party VIN/model lookup API (e.g. `dvsa-api.com`) for accurate model names, instead of relying on GPT-4o inference.
- **Real-time pricing:** Scrape or partner with AutoTrader/Glass's Guide for live market prices instead of GPT-4o estimates.
- **Listing history:** Add a dedicated "History" tab showing all past listings with search and filter.
- **Push notifications:** Notify users when analysis completes (useful if they background the app).
