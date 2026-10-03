/**
 * NEON ESCAPE - Firebase Configuration & Hybrid Cloud Engine
 * 
 * Instructions for Production:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Authentication (Google Sign-In and Email/Password).
 * 3. Enable Cloud Firestore database in Production mode.
 * 4. Replace the placeholder values in FIREBASE_CONFIG below with your actual Firebase web app keys.
 * 
 * NOTE: If Firebase configuration is not yet provided or credentials remain as placeholders,
 * the platform automatically runs in "HYBRID CLOUD / GUEST MODE", utilizing a robust local
 * reactive database so 100% of the game platform (Accounts, Profiles, Leaderboards, Missions,
 * Achievements, Garage, Friends, Challenges, Seasons) works immediately out-of-the-box!
 */

'use strict';

const FIREBASE_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

class FirebaseBridge {
  constructor() {
    this.isConfigured = false;
    this.isLive = false;
    this.app = null;
    this.auth = null;
    this.db = null;
    this.init();
  }

  init() {
    // Check if configuration has been replaced with real credentials
    if (
      FIREBASE_CONFIG.apiKey && 
      !FIREBASE_CONFIG.apiKey.startsWith("YOUR_") &&
      FIREBASE_CONFIG.projectId &&
      !FIREBASE_CONFIG.projectId.startsWith("YOUR_")
    ) {
      this.isConfigured = true;
      try {
        if (typeof window.firebase !== 'undefined') {
          this.app = window.firebase.initializeApp(FIREBASE_CONFIG);
          this.auth = window.firebase.auth();
          this.db = window.firebase.firestore();
          this.isLive = true;
          console.log('[NeonEscape] Firebase initialized in LIVE mode.');
        } else {
          console.warn('[NeonEscape] Firebase SDK not loaded, falling back to local hybrid cloud.');
        }
      } catch (err) {
        console.warn('[NeonEscape] Firebase initialization error:', err.message);
      }
    } else {
      console.log('[NeonEscape] Firebase using HYBRID CLOUD / DEMO mode (Credentials pending).');
    }
  }

  getStatus() {
    return {
      configured: this.isConfigured,
      live: this.isLive,
      mode: this.isLive ? 'LIVE CLOUD (Firestore)' : 'HYBRID CLOUD (Local Persistence & Guest Engine)'
    };
  }
}

// Export singleton instance globally
window.FirebaseBridge = new FirebaseBridge();
