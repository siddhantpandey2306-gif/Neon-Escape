# NEON ESCAPE 🚀⚡
> *"Survive. Evolve. Dominate."*

**NEON ESCAPE** is a world-class cyberpunk arcade survival game and competitive gaming platform built with pure **HTML5, CSS3, Vanilla JavaScript, and the HTML5 Canvas API**. It features a modern gaming-platform dashboard, cloud-synchronized player profiles, global/country/seasonal leaderboards, an in-depth cosmetic garage, social challenges, daily missions with streaks, and client/server score validation.

---

## 📑 Table of Contents
1. [Key Features & Platform Architecture](#-key-features--platform-architecture)
2. [Technology Stack](#-technology-stack)
3. [Gameplay Mechanics](#-gameplay-mechanics)
   - [Controls](#controls)
   - [Obstacle Hierarchy](#obstacle-hierarchy)
   - [Collectibles & Power-Ups](#collectibles--power-ups)
   - [Dynamic Difficulty Director](#dynamic-difficulty-director)
   - [Combos & Near-Miss System](#combos--near-miss-system)
4. [Platform & Social Ecosystem](#-platform--social-ecosystem)
   - [Player Accounts & Permanent Player IDs](#player-accounts--permanent-player-ids)
   - [Global, Country & Friends Leaderboards](#global-country--friends-leaderboards)
   - [Daily Missions & Streaks](#daily-missions--streaks)
   - [Career Achievements](#career-achievements)
   - [Garage & Ship Customization](#garage--ship-customization)
   - [Friends & Asynchronous Challenges](#friends--asynchronous-challenges)
   - [Competitive Seasons](#competitive-seasons)
5. [Anti-Cheat & Score Security](#-anti-cheat--score-security)
6. [Firebase Setup & Deployment](#-firebase-setup--deployment)
   - [Authentication Configuration](#1-authentication-configuration)
   - [Firestore Database & Collections](#2-firestore-database--collections)
   - [Deploying Security Rules](#3-deploying-security-rules)
   - [Connecting Your Credentials](#4-connecting-your-credentials)
7. [Offline PWA Support](#-offline-pwa-support)
8. [Local Development](#-local-development)

---

## 🌟 Key Features & Platform Architecture

* **Zero External JS Frameworks**: No React, Vue, Angular, Three.js, or Phaser. Clean, modular vanilla architecture with native Canvas 2D hardware-accelerated rendering.
* **Hybrid Cloud / Guest Architecture**: Instant guest playability out of the box with automatic local persistence and seamless upgrade to cloud-synced Firebase Auth & Firestore when credentials are provided.
* **Cyberpunk Aesthetic Design System**: Custom glassmorphism, responsive CSS grid/flexbox layouts, CRT scanline toggles, high-contrast neon palettes, and micro-interactions.
* **Web Audio Procedural Synthesizer**: Pure Web Audio API procedural sound engine with laser impacts, crystal harmonies, power-up hums, pitch-scaled combo chimes, and ambient synth basslines (no external audio files required).
* **Progressive Web App (PWA)**: Complete offline support via `service-worker.js` and `manifest.json` with responsive UI tested across mobile (320px–425px), tablet (768px–1024px), and ultra-wide desktop (1440px–1920px).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Markup & Structure** | Semantic HTML5, Canvas API |
| **Styling & Theme** | Modern CSS3 (CSS Variables, Flexbox/Grid, Glassmorphic Backdrop Filters, Keyframe Animations) |
| **Game Engine** | Vanilla ES6+ JavaScript (`requestAnimationFrame`, Object Pooling, Vector Inertia) |
| **Sound Engine** | Web Audio API (OscillatorNodes, GainNodes, BiquadFilterNodes, StereoPanner) |
| **Authentication** | Firebase Auth (Google Sign-In, Email/Password, Anonymous Guest Mode) |
| **Cloud Database** | Cloud Firestore (Profiles, Scores, Leaderboards, Missions, Friends, Challenges) |
| **Offline / PWA** | Service Worker Cache-First Shell, Web App Manifest |

---

## 🎮 Gameplay Mechanics

### Controls
* **Desktop**:
  * `A` / `LEFT ARROW`: Steer ship left
  * `D` / `RIGHT ARROW`: Steer ship right
  * `ESC` / `P`: Pause / Resume game
  * `M`: Toggle audio mute
* **Mobile / Tablet**:
  * Dedicated on-screen touch buttons (`◀` and `▶`) with haptic touch feel.
  * Direct touch-and-drag gesture steering across the canvas.
  * Touch event listener scroll-locking to prevent accidental browser refresh or page bouncing.

### Obstacle Hierarchy
1. **Cosmic Meteor**: Rotational irregular asteroids with glowing molten fissures.
2. **Energy Barrier**: Wide pulsating plasma barriers flanked by dual emitter pods that test lateral reflexes.
3. **Hunter Drone**: Futuristic airborne seekers with autonomous sinusoidal evasion and pulsing scanning sensors.
4. **Plasma Ball**: Ultra-compact, high-velocity energy spheres that demand split-second dodging in later phases.

### Collectibles & Power-Ups
* **Energy Crystal (+10 pts)**: Glowing rotating cyan crystal core that charges your combo meter.
* **Rare Crystal (+50 pts)**: High-density golden octahedron with radiant star sparkle trail.
* **Shield**: Deploys an invulnerable orbital energy bubble that absorbs one collision.
* **Slow Motion (5s)**: Chrono-distortion slowing incoming hazards to 40% speed with an animated purple visual vignette.
* **Double Score (10s)**: Doubles all scoring events with active neon HUD telemetry.
* **Magnet (8s)**: Generates a tractor field pulling nearby crystals into your flight path.

### Dynamic Difficulty Director
Gameplay automatically transitions through 5 progressive difficulty phases:
* **PHASE 1 — TRAINING**: Baseline velocity (`1.0x`), gentle introduction of meteors and basic barriers.
* **PHASE 2 — ACCELERATION**: Speed increases to `1.35x`, hunter drones deploy, barrier frequency increases.
* **PHASE 3 — CHAOS**: Speed scales to `1.7x`, multi-hazard overlapping waves and tighter evasion corridors.
* **PHASE 4 — OVERDRIVE**: Speed ramps to `2.1x`, high-velocity plasma balls deploy continuously.
* **PHASE 5 — NIGHTMARE**: Maximum velocity (`2.5x`), ultra-fast spawn cadence, elite swarm patterns.

### Combos & Near-Miss System
* **Combo Multiplier**: Collecting energy crystals within 2.8 seconds chains combos from `1.0X` up to `2.0X+`. Breaking combo occurs upon taking hull damage.
* **Near-Miss Evasions (+25 pts)**: Grazing within 40px of hazards without touching rewards an immediate score bonus, spark particle bursts, and an evasive audio whoosh.

---

## 🌐 Platform & Social Ecosystem

### Player Accounts & Permanent Player IDs
* Every registered player receives an immutable, permanent Player ID formatted as `NE-XXXXXX` (e.g., `NE-7K4P92`).
* Supports unique usernames (3–16 alphanumeric characters), custom display names, avatar selection, and country flags.

### Global, Country & Friends Leaderboards
* **Multi-Category Views**: Filter rankings by **GLOBAL**, **COUNTRY**, **FRIENDS**, **WEEKLY**, **MONTHLY**, **ALL-TIME**, and **SEASON**.
* **Podium Treatment**: Special visual styling for Gold 🥇, Silver 🥈, and Bronze 🥉 ranks.
* **Persistent "YOUR RANK" Dock**: Real-time rank tracker pinned at the bottom of the leaderboard view.

### Daily Missions & Streaks
* Procedural daily missions refreshed every 24 hours (e.g., *Survive 120s*, *Collect 100 Crystals*, *Perform 10 Near Misses*).
* Rewards players with XP, **Neon Coins**, and cosmetic unlocks.
* Tracks your consecutive **🔥 Daily Streak** to multiply login rewards.

### Career Achievements
* 8 tiered milestone achievements tracking gameplay feats (*First Flight*, *Close Call*, *Combo Master*, *Aegis Guard*, *Millionaire*, etc.) with live in-game glassmorphic toast notifications.

### Garage & Ship Customization
* **5 Unique Ships**: Phantom, Nova, Spectre, Eclipse, and Hyperion with custom hull geometries and energy cores.
* **5 Thruster Trails**: Plasma Blue, Solar Fire, Glacial Ice, Cosmic Void, and Prismatic Rainbow.
* Real-time hangar preview and one-click equipment synchronization.

### Friends & Asynchronous Challenges
* Search players by **Username** or **Player ID**.
* Send, accept, or decline friend requests with real-time status.
* Create and issue score challenges to friends (*"Beat Nova's score of 82,450"*) with time limits and Neon Coin stakes.

### Competitive Seasons
* Built-in seasonal calendar (e.g., *SEASON 01 — COSMIC RUSH*) displaying season countdowns, seasonal XP ladders, and exclusive seasonal badges.

---

## 🛡️ Anti-Cheat & Score Security

To safeguard leaderboard integrity, the platform implements multi-layer client and cloud validation:
1. **Telemetry Handshake**: Each score submission transmits full session metrics (`score`, `survivalTime`, `crystalsCollected`, `obstaclesDodged`, `nearMisses`, `difficultyPhase`, `telemetryHash`).
2. **Rate Limiting**: Cooldown period between successive score writes prevents rapid spam.
3. **Kinematic Plausibility Bounds**: Score submissions exceeding physical point-per-second ceilings or having mismatched metrics are flagged and rejected.
4. **Firestore Security Rules**: Strict authorization prevents players from overwriting other profiles or forging rank positions directly.

---

## 🔥 Firebase Setup & Deployment

### 1. Authentication Configuration
1. Open the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Navigate to **Authentication** > **Sign-in method**.
3. Enable:
   * **Google**
   * **Email / Password**
   * **Anonymous** (for Guest Mode)

### 2. Firestore Database & Collections
1. Create a **Cloud Firestore** database in production mode.
2. The platform automatically utilizes the following collections:
   * `users/{userId}`: Account authorization mapping.
   * `profiles/{userId}`: Player profile, stats, equipped cosmetics, levels, and coins.
   * `scores/{scoreId}`: Validated game match records.
   * `leaderboards/{category}`: Pre-aggregated leaderboard entries.
   * `seasons/{seasonId}`: Active competitive seasons and archives.
   * `missions/{missionId}`: User daily mission tracking and streaks.
   * `friends/{userId}`: Friend connections.
   * `friendRequests/{requestId}`: Pending friend invitations.
   * `challenges/{challengeId}`: Head-to-head score challenges.

### 3. Deploying Security Rules
Deploy the included [`firestore.rules`](file:///c:/Users/siddh/OneDrive/Neon%20Escape/firestore.rules) using the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

### 4. Connecting Your Credentials
Open [`firebase/firebase-config.js`](file:///c:/Users/siddh/OneDrive/Neon%20Escape/firebase/firebase-config.js) and replace the configuration object:
```javascript
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```
*Note: If credentials are left unconfigured, **NEON ESCAPE automatically activates Demo / Guest Mode**, allowing full offline gameplay and local profile progression with zero errors.*

---

## 📱 Offline PWA Support

NEON ESCAPE is a certified Progressive Web App:
* **Installable**: Can be installed to the home screen on iOS, Android, macOS, and Windows.
* **Offline Shell**: Service Worker caches core HTML, CSS, JavaScript, and SVG assets for offline play.
* **Auto-Recovery**: Automatically detects online/offline transitions and synchronizes state when reconnected.

---

## 💻 Local Development

Run the game locally using any static web server:

```bash
# Python 3
python -m http.server 8080

# Node.js
npx serve .
```

Then navigate to `http://localhost:8080` in your web browser.

---

## 📜 License
Distributed under the MIT License. Built for arcade enthusiasts and competitive gamers worldwide.
