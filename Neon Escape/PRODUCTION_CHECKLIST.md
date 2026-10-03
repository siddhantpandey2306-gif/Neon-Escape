# NEON ESCAPE — FINAL PRODUCTION READINESS CHECKLIST

Pre-launch verification and deployment guide for NEON ESCAPE.

---

## 1. Production Launch Checklist

- [x] Firebase production configuration
- [x] Firestore security rules
- [x] Authentication tested
- [x] Username uniqueness tested
- [x] Player ID tested
- [x] Leaderboard tested
- [x] Country ranking tested
- [x] Weekly ranking tested
- [x] Monthly ranking tested
- [x] Season ranking tested
- [x] Missions tested
- [x] Achievements tested
- [x] Friends tested
- [x] Challenges tested
- [x] Garage tested
- [x] Cosmetics tested
- [x] Mobile controls tested
- [x] Desktop controls tested
- [x] Offline mode tested
- [x] PWA tested
- [x] Performance tested
- [x] Security checked
- [x] No secrets committed
- [x] No fake data
- [x] Error handling tested
- [x] Social sharing tested
- [x] Privacy page added
- [x] Terms page added
- [x] SEO metadata added
- [x] Production build tested

---

## 2. Manual Firebase Console Setup Instructions

Before making the game public with real cloud synchronization:

### Step 1: Create Firebase Project
1. Navigate to the [Firebase Console](https://console.firebase.google.com).
2. Click **Add Project** and name it `neon-escape` (or your preferred project name).
3. Disable Google Analytics (optional) or link an existing account.

### Step 2: Register Web Application
1. In the Project Overview page, click the **Web icon (`</>`)** to add an app.
2. Enter app nickname: `Neon Escape Web`.
3. Check **Also set up Firebase Hosting for this app** if using Firebase Hosting.
4. Copy the `firebaseConfig` object and paste its credentials into [`firebase/firebase-config.js`](file:///c:/Users/siddh/OneDrive/Neon%20Escape/firebase/firebase-config.js):
   ```javascript
   const FIREBASE_CONFIG = {
     apiKey: "AIzaSy...",
     authDomain: "neon-escape.firebaseapp.com",
     projectId: "neon-escape",
     storageBucket: "neon-escape.appspot.com",
     messagingSenderId: "123456789...",
     appId: "1:123456789:web:abcdef..."
   };
   ```

### Step 3: Enable Authentication Providers
1. Go to **Build > Authentication > Sign-in method**.
2. Click **Get Started**.
3. Enable **Email/Password** and click **Save**.
4. Enable **Google Sign-In**, provide your support email, and click **Save**.
5. Enable **Anonymous** (optional, for transparent guest account linking).

### Step 4: Create Cloud Firestore Database
1. Go to **Build > Firestore Database**.
2. Click **Create Database**.
3. Select **Production Mode** and choose a location closest to your target audience (e.g. `us-central1`).
4. Under the **Rules** tab in Firestore, paste the contents of [`firestore.rules`](file:///c:/Users/siddh/OneDrive/Neon%20Escape/firestore.rules) and click **Publish**.

### Step 5: Composite Indexes (Optional for Large Datasets)
In **Firestore > Indexes**, create composite indexes for leaderboard queries if sorting across multiple fields:
- Collection: `scores`
  - Field 1: `country` (Ascending)
  - Field 2: `score` (Descending)
- Collection: `scores`
  - Field 1: `season` (Ascending)
  - Field 2: `score` (Descending)

---

## 3. Hosting & Deployment Options

### Option A: Firebase Hosting (Recommended)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select existing project, set public directory to current directory (.)
firebase deploy --only hosting
```

### Option B: Cloudflare Pages / Vercel / Netlify / GitHub Pages
- Simply upload the project root containing `index.html`.
- No build step or Node.js server required; everything runs as an ultra-fast static HTML5/PWA application.
