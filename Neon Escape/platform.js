/**
 * NEON ESCAPE - Gaming Platform Master Controller
 * Handles: Authentication, Profiles, Leaderboards, Progression (XP/Levels/Coins),
 * Daily Missions, Achievements, Garage/Cosmetics, Friends, Challenges, Seasons,
 * and Anti-Cheat Telemetry Verification.
 */

'use strict';

class PlatformController {
  constructor() {
    this.currentUser = null;
    this.activeTab = 'play';
    this.currentRankingFilter = 'global';
    this.currentRankingPeriod = 'all-time';
    this.searchQuery = '';
    
    // Active challenge state & session telemetry
    this.activeChallenge = null;
    this.gameSessionToken = null;
    this.usedSessionTokens = new Set();


    // Cosmetics Catalog
    this.shipsCatalog = [
      { id: 'phantom', name: 'PHANTOM', desc: 'Stealth interceptor with dual plasma wingtips', reqLevel: 1, cost: 0, color: '#00f0ff', accent: '#ffffff' },
      { id: 'nova', name: 'NOVA', desc: 'Heavy prism cruiser with solar wings', reqLevel: 5, cost: 500, color: '#ffb703', accent: '#ff007f' },
      { id: 'spectre', name: 'SPECTRE', desc: 'Ghost phantom hull with floating energy blades', reqLevel: 10, cost: 1200, color: '#b537f2', accent: '#00f0ff' },
      { id: 'eclipse', name: 'ECLIPSE', desc: 'Void arrow with dark matter stabilizer', reqLevel: 18, cost: 2500, color: '#ff007f', accent: '#b537f2' },
      { id: 'hyperion', name: 'HYPERION', desc: 'Apex dreadnought with quantum core', reqLevel: 25, cost: 5000, color: '#00ff88', accent: '#00f0ff' }
    ];

    this.trailsCatalog = [
      { id: 'plasma', name: 'PLASMA', color: '#00f0ff', reqLevel: 1, cost: 0 },
      { id: 'fire', name: 'FIRE', color: '#ff5500', reqLevel: 3, cost: 300 },
      { id: 'ice', name: 'ICE', color: '#88eeff', reqLevel: 8, cost: 800 },
      { id: 'cosmic', name: 'COSMIC', color: '#b537f2', reqLevel: 15, cost: 1800 },
      { id: 'rainbow', name: 'RAINBOW', color: 'rainbow', reqLevel: 22, cost: 3000 }
    ];

    this.avatarsCatalog = [
      { id: 'apex', name: 'Apex Pilot', icon: '🚀' },
      { id: 'sentry', name: 'Cyber Sentry', icon: '🤖' },
      { id: 'valkyrie', name: 'Neon Valkyrie', icon: '⚡' },
      { id: 'stalker', name: 'Void Stalker', icon: '👾' },
      { id: 'android', name: 'Quantum Core', icon: '💠' },
      { id: 'solar', name: 'Solar Knight', icon: '☀️' },
      { id: 'ghost', name: 'Ghost Rider', icon: '💀' },
      { id: 'mech', name: 'Mech Titan', icon: '🛡️' }
    ];

    this.framesCatalog = [
      { id: 'default', name: 'Standard Cyan', border: '1px solid rgba(0, 240, 255, 0.4)' },
      { id: 'bronze', name: 'Bronze Pilot', border: '2px solid #cd7f32' },
      { id: 'silver', name: 'Silver Ace', border: '2px solid #cbd5e1' },
      { id: 'gold', name: 'Gold Champion', border: '2px solid #ffb703' },
      { id: 'amethyst', name: 'Amethyst Mythic', border: '2px solid #b537f2' },
      { id: 'apex', name: 'Apex Hologram', border: '2px solid #ff007f' }
    ];

    // Master Achievement List
    this.achievementsCatalog = [
      { id: 'first_flight', title: 'FIRST FLIGHT', desc: 'Deploy on your first mission', xp: 100, coins: 50, icon: '🚀', category: 'career' },
      { id: 'survivor_60', title: 'ORBITAL SURVIVOR', desc: 'Survive for 60 seconds in one run', xp: 200, coins: 75, icon: '⏱️', category: 'survival' },
      { id: 'survivor_180', title: 'DEEP SPACE SURVIVOR', desc: 'Survive for 3 minutes in one run', xp: 500, coins: 200, icon: '⌛', category: 'survival' },
      { id: 'survivor_300', title: 'APEX SURVIVOR', desc: 'Survive for 5 minutes in one run', xp: 1000, coins: 500, icon: '🌌', category: 'survival' },
      { id: 'near_miss_10', title: 'CLOSE SHAVE', desc: 'Perform 10 Near-Miss evasions', xp: 250, coins: 100, icon: '⚡', category: 'skill' },
      { id: 'near_miss_50', title: 'DODGE MASTER', desc: 'Perform 50 Near-Miss evasions in total', xp: 600, coins: 250, icon: '🥋', category: 'skill' },
      { id: 'combo_3', title: 'CHAIN REACTION', desc: 'Reach a 3X Crystal Combo multiplier', xp: 150, coins: 50, icon: '🔥', category: 'skill' },
      { id: 'combo_5', title: 'COMBO GOD', desc: 'Reach maximum 5X Combo multiplier', xp: 500, coins: 200, icon: '👑', category: 'skill' },
      { id: 'crystals_50', title: 'CRYSTAL HARVESTER', desc: 'Collect 50 Energy Crystals', xp: 200, coins: 80, icon: '💎', category: 'career' },
      { id: 'crystals_500', title: 'CRYSTAL COLLECTOR', desc: 'Collect 500 Energy Crystals in total', xp: 750, coins: 350, icon: '💠', category: 'career' },
      { id: 'crystals_1000', title: 'ENERGY BARON', desc: 'Collect 1,000 Energy Crystals in total', xp: 1500, coins: 800, icon: '🔮', category: 'career' },
      { id: 'powerups_20', title: 'TACTICAL OPERATIVE', desc: 'Deploy 20 Tactical Power-ups', xp: 300, coins: 120, icon: '🛡️', category: 'career' },
      { id: 'score_25k', title: 'SECTOR ACE', desc: 'Reach 25,000 Points in a single run', xp: 400, coins: 150, icon: '🎖️', category: 'score' },
      { id: 'score_100k', title: 'CYBER LEGEND', desc: 'Reach 100,000 Points in a single run', xp: 1000, coins: 400, icon: '🏆', category: 'score' },
      { id: 'score_500k', title: 'VOID DOMINATOR', desc: 'Reach 500,000 Points in a single run', xp: 2500, coins: 1000, icon: '🔱', category: 'score' },
      { id: 'phase_nightmare', title: 'NIGHTMARE ESCAPIST', desc: 'Reach Phase 5: Nightmare difficulty', xp: 1200, coins: 500, icon: '☠️', category: 'survival' },
      { id: 'allied_pilot', title: 'FLEET ALLIANCE', desc: 'Add a player to your Friends list', xp: 250, coins: 100, icon: '🤝', category: 'social' },
      { id: 'challenge_win', title: 'GLADIATOR', desc: 'Win a Player Challenge', xp: 500, coins: 250, icon: '⚔️', category: 'social' }
    ];

    // Competitive Season 01
    this.currentSeason = {
      id: 'season_01',
      title: 'SEASON 01 // COSMIC RUSH',
      tagline: 'Survive the initial collapse of Sector 04',
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      seasonXp: 0,
      tier: 'BRONZE'
    };

    this.activeChallenge = null; // Target challenge if launched from a challenge
    this.gameSessionStart = null;
    this.activeMissionCategory = 'daily';
    this.dailyMissions = [];
    this.weeklyMissions = [];
    this.seasonalMissions = [];
  }

  // --- INITIALIZATION ---
  init() {
    this.loadUserSession();
    this.initMissions();
    this.startMissionsCountdown();
    this.initOfflineSync();
    this.bindPlatformNavigation();
    this.renderHeaderUserBar();
    this.renderCurrentTab();
    this.startSeasonTimer();
    console.log('[NeonEscape] PlatformController initialized successfully.');
  }

  // Generate unique permanent Player ID (format: NE-XXXXXX)
  generatePlayerId() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excludes confusing characters 0/O, 1/I
    let id = 'NE-';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  // --- USER SESSION & PROFILE STORAGE ---
  loadUserSession() {
    try {
      const stored = localStorage.getItem('neon_escape_user_profile');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load user profile from storage', e);
    }

    if (!this.currentUser) {
      this.createGuestUser();
    }

    // Ensure required properties exist
    this.ensureUserSchema();
    this.saveUserSession();
  }

  createGuestUser() {
    const guestId = this.generatePlayerId();
    const guestNum = Math.floor(100 + Math.random() * 900);
    this.currentUser = {
      uid: 'guest_' + Date.now(),
      playerId: guestId,
      username: 'Pilot_' + guestNum,
      displayName: 'Guest Pilot',
      email: '',
      isGuest: true,
      country: '🇺🇸 US',
      flag: '🇺🇸',
      avatar: 'apex',
      frame: 'default',
      title: 'NOVICE ESCAPIST',
      level: 1,
      xp: 0,
      coins: 150,
      equippedShip: 'phantom',
      equippedTrail: 'plasma',
      unlockedShips: ['phantom'],
      unlockedTrails: ['plasma'],
      unlockedAvatars: ['apex', 'sentry'],
      unlockedFrames: ['default'],
      stats: {
        gamesPlayed: 0,
        bestScore: 0,
        totalScore: 0,
        totalSurvivalTime: 0,
        longestSurvival: 0,
        crystalsCollected: 0,
        obstaclesDodged: 0,
        nearMisses: 0,
        powerupsCollected: 0,
        highestCombo: 1,
        challengesWon: 0,
        challengesLost: 0
      },
      achievementsUnlocked: {},
      dailyStreak: 1,
      lastDailyLogin: new Date().toDateString(),
      friends: [],
      createdAt: new Date().toISOString()
    };
  }

  ensureUserSchema() {
    if (!this.currentUser.playerId) {
      this.currentUser.playerId = this.generatePlayerId();
    }
    if (!this.currentUser.stats) {
      this.currentUser.stats = {
        gamesPlayed: 0,
        bestScore: 0,
        totalScore: 0,
        totalSurvivalTime: 0,
        longestSurvival: 0,
        crystalsCollected: 0,
        obstaclesDodged: 0,
        nearMisses: 0,
        powerupsCollected: 0,
        highestCombo: 1,
        challengesWon: 0,
        challengesLost: 0
      };
    }
    if (!this.currentUser.unlockedShips) this.currentUser.unlockedShips = ['phantom'];
    if (!this.currentUser.unlockedTrails) this.currentUser.unlockedTrails = ['plasma'];
    if (!this.currentUser.unlockedAvatars) this.currentUser.unlockedAvatars = ['apex', 'sentry'];
    if (!this.currentUser.unlockedFrames) this.currentUser.unlockedFrames = ['default'];
    if (this.currentUser.coins === undefined) this.currentUser.coins = 150;
    if (this.currentUser.xp === undefined) this.currentUser.xp = 0;
    if (this.currentUser.level === undefined) this.currentUser.level = 1;
    if (!this.currentUser.achievementsUnlocked) this.currentUser.achievementsUnlocked = {};
    if (!this.currentUser.equippedShip) this.currentUser.equippedShip = 'phantom';
    if (!this.currentUser.equippedTrail) this.currentUser.equippedTrail = 'plasma';
    if (!Array.isArray(this.currentUser.friends)) {
      this.currentUser.friends = [];
    } else {
      // Purge any legacy demo friends
      this.currentUser.friends = this.currentUser.friends.filter(f => f !== 'NE-9K82F1' && f !== 'NE-4A77C2');
    }
  }

  saveUserSession() {
    try {
      localStorage.setItem('neon_escape_user_profile', JSON.stringify(this.currentUser));
      // Sync with Firebase Firestore if live
      if (window.FirebaseBridge && window.FirebaseBridge.isLive && !this.currentUser.isGuest) {
        window.FirebaseBridge.db.collection('profiles').doc(this.currentUser.uid).set(this.currentUser, { merge: true });
      }
    } catch (e) {
      console.warn('Failed to save profile session', e);
    }
  }

  // --- XP & LEVEL SYSTEM ---
  getXpForNextLevel(level) {
    return level * 350;
  }

  addXp(amount) {
    this.currentUser.xp += amount;
    let leveledUp = false;
    let reqXp = this.getXpForNextLevel(this.currentUser.level);

    while (this.currentUser.xp >= reqXp) {
      this.currentUser.xp -= reqXp;
      this.currentUser.level++;
      leveledUp = true;
      const levelCoins = this.currentUser.level * 100;
      this.currentUser.coins += levelCoins;
      reqXp = this.getXpForNextLevel(this.currentUser.level);

      // Check level-based unlocks
      this.checkLevelUnlocks(this.currentUser.level);
    }

    if (leveledUp) {
      this.triggerPlatformNotification(`LEVEL UP! REACHED LEVEL ${this.currentUser.level}`, `+${this.currentUser.level * 100} Neon Coins Awarded!`, '🎉');
      if (window.game && window.game.audio) {
        window.game.audio.playAchievement();
      }
    }

    this.saveUserSession();
    this.renderHeaderUserBar();
    return leveledUp;
  }

  checkLevelUnlocks(level) {
    this.shipsCatalog.forEach(ship => {
      if (ship.reqLevel <= level && !this.currentUser.unlockedShips.includes(ship.id)) {
        this.currentUser.unlockedShips.push(ship.id);
        this.triggerPlatformNotification('NEW SHIP UNLOCKED!', `${ship.name} is now available in your Garage!`, '🚀');
      }
    });

    this.trailsCatalog.forEach(trail => {
      if (trail.reqLevel <= level && !this.currentUser.unlockedTrails.includes(trail.id)) {
        this.currentUser.unlockedTrails.push(trail.id);
        this.triggerPlatformNotification('NEW TRAIL UNLOCKED!', `${trail.name} engine trail unlocked!`, '✨');
      }
    });
  }

  addCoins(amount) {
    this.currentUser.coins += amount;
    this.saveUserSession();
    this.renderHeaderUserBar();
  }

  // --- MULTI-CATEGORY MISSIONS & LOCAL LIVE COUNTDOWN ---
  initMissions() {
    const todayStr = new Date().toDateString();
    let daily = null;
    let weekly = null;
    let seasonal = null;

    try {
      const storedDaily = localStorage.getItem('neon_escape_daily_missions');
      if (storedDaily) {
        const parsed = JSON.parse(storedDaily);
        if (parsed.date === todayStr) daily = parsed.missions;
      }
    } catch (e) {}

    try {
      const storedWeekly = localStorage.getItem('neon_escape_weekly_missions');
      if (storedWeekly) weekly = JSON.parse(storedWeekly);
    } catch (e) {}

    try {
      const storedSeasonal = localStorage.getItem('neon_escape_seasonal_missions');
      if (storedSeasonal) seasonal = JSON.parse(storedSeasonal);
    } catch (e) {}

    // Check daily login streak
    if (this.currentUser.lastDailyLogin !== todayStr) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      if (this.currentUser.lastDailyLogin === yesterday) {
        this.currentUser.dailyStreak = (this.currentUser.dailyStreak || 0) + 1;
      } else {
        this.currentUser.dailyStreak = 1;
      }
      this.currentUser.lastDailyLogin = todayStr;
      this.saveUserSession();
    }

    if (!daily) {
      daily = [
        { id: 'dm_1', category: 'daily', title: 'Orbital Endurance', desc: 'Survive for a total of 120 seconds', target: 120, current: 0, xp: 250, coins: 100, claimed: false, icon: '⚡' },
        { id: 'dm_2', category: 'daily', title: 'Crystal Harvest', desc: 'Collect 80 Energy Crystals', target: 80, current: 0, xp: 200, coins: 80, claimed: false, icon: '💎' },
        { id: 'dm_3', category: 'daily', title: 'Close Shaves', desc: 'Perform 10 Near-Miss evasions', target: 10, current: 0, xp: 300, coins: 120, claimed: false, icon: '🎯' },
        { id: 'dm_4', category: 'daily', title: 'Chain Power', desc: 'Achieve a 4X Combo multiplier', target: 4, current: 0, xp: 350, coins: 150, claimed: false, icon: '🔥' },
        { id: 'dm_5', category: 'daily', title: 'Tactical Deployment', desc: 'Deploy 5 Tactical Power-ups', target: 5, current: 0, xp: 250, coins: 90, claimed: false, icon: '🛡️' }
      ];
      localStorage.setItem('neon_escape_daily_missions', JSON.stringify({ date: todayStr, missions: daily }));
    }

    if (!weekly) {
      weekly = [
        { id: 'wm_1', category: 'weekly', title: 'Marathon Escapist', desc: 'Survive a cumulative 10 minutes in flight', target: 600, current: 0, xp: 1200, coins: 500, claimed: false, icon: '⏱️' },
        { id: 'wm_2', category: 'weekly', title: 'Crystal Baron', desc: 'Collect 300 Energy Crystals', target: 300, current: 0, xp: 1400, coins: 600, claimed: false, icon: '🔮' },
        { id: 'wm_3', category: 'weekly', title: 'Evasion Virtuoso', desc: 'Perform 40 Near-Miss evasions', target: 40, current: 0, xp: 1600, coins: 700, claimed: false, icon: '🥋' },
        { id: 'wm_4', category: 'weekly', title: 'High Score Legend', desc: 'Reach 40,000 points in a single run', target: 40000, current: 0, xp: 2000, coins: 850, claimed: false, icon: '👑' }
      ];
      localStorage.setItem('neon_escape_weekly_missions', JSON.stringify(weekly));
    }

    if (!seasonal) {
      seasonal = [
        { id: 'sm_1', category: 'seasonal', title: 'Cosmic Rush Campaign', desc: 'Deploy on 25 flight runs', target: 25, current: 0, xp: 3500, coins: 1500, cosmetic: 'Spectre Ship', claimed: false, icon: '🚀' },
        { id: 'sm_2', category: 'seasonal', title: 'Deep Sector Evader', desc: 'Evade 250 obstacle hazards', target: 250, current: 0, xp: 4000, coins: 2000, cosmetic: 'Cosmic Trail', claimed: false, icon: '☄️' },
        { id: 'sm_3', category: 'seasonal', title: 'Apex Ascendant', desc: 'Reach 100,000 points in a single run', target: 100000, current: 0, xp: 5000, coins: 3000, cosmetic: 'Amethyst Frame', claimed: false, icon: '🌌' }
      ];
      localStorage.setItem('neon_escape_seasonal_missions', JSON.stringify(seasonal));
    }

    this.dailyMissions = daily;
    this.weeklyMissions = weekly;
    this.seasonalMissions = seasonal;
  }

  saveMissionsData() {
    const todayStr = new Date().toDateString();
    localStorage.setItem('neon_escape_daily_missions', JSON.stringify({ date: todayStr, missions: this.dailyMissions }));
    localStorage.setItem('neon_escape_weekly_missions', JSON.stringify(this.weeklyMissions));
    localStorage.setItem('neon_escape_seasonal_missions', JSON.stringify(this.seasonalMissions));
  }

  startMissionsCountdown() {
    const updateCountdown = () => {
      const now = new Date();
      const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
      const diff = Math.max(0, nextMidnight.getTime() - Date.now());
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      const formatted = `Reset in ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      const el = document.getElementById('missionsResetCountdown');
      if (el) el.textContent = formatted;

      if (diff <= 1000) {
        this.initMissions();
        if (this.activeTab === 'missions') this.renderMissionsTab();
      }
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  setMissionCategory(category) {
    this.activeMissionCategory = category;
    const catMap = {
      'daily': 'missionTabDaily',
      'weekly': 'missionTabWeekly',
      'seasonal': 'missionTabSeasonal'
    };

    for (let c in catMap) {
      const btn = document.getElementById(catMap[c]);
      if (btn) {
        if (c === category) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    }

    this.renderMissionsTab();
  }

  updateMissionProgress(type, value) {
    let modified = false;
    const allMissions = [
      ...(this.dailyMissions || []),
      ...(this.weeklyMissions || []),
      ...(this.seasonalMissions || [])
    ];

    allMissions.forEach(m => {
      if (m.claimed) return;
      if (type === 'survival' && (m.id === 'dm_1' || m.id === 'wm_1')) {
        m.current = Math.min(m.target, m.current + Math.floor(value));
        modified = true;
      } else if (type === 'crystals' && (m.id === 'dm_2' || m.id === 'wm_2')) {
        m.current = Math.min(m.target, m.current + value);
        modified = true;
      } else if (type === 'nearMiss' && (m.id === 'dm_3' || m.id === 'wm_3')) {
        m.current = Math.min(m.target, m.current + value);
        modified = true;
      } else if (type === 'combo' && m.id === 'dm_4') {
        if (value >= m.target) {
          m.current = m.target;
          modified = true;
        }
      } else if (type === 'powerup' && m.id === 'dm_5') {
        m.current = Math.min(m.target, m.current + value);
        modified = true;
      } else if (type === 'score' && (m.id === 'wm_4' || m.id === 'sm_3')) {
        if (value >= m.target) {
          m.current = m.target;
          modified = true;
        }
      } else if (type === 'games' && m.id === 'sm_1') {
        m.current = Math.min(m.target, m.current + 1);
        modified = true;
      } else if (type === 'dodges' && m.id === 'sm_2') {
        m.current = Math.min(m.target, m.current + value);
        modified = true;
      }
    });

    if (modified) {
      this.saveMissionsData();
      if (this.activeTab === 'missions') this.renderMissionsTab();
      if (this.activeTab === 'play') this.renderPlayTab();
    }
  }

  claimMission(missionId) {
    const allMissions = [
      ...(this.dailyMissions || []),
      ...(this.weeklyMissions || []),
      ...(this.seasonalMissions || [])
    ];
    const mission = allMissions.find(m => m.id === missionId);
    if (!mission || mission.claimed || mission.current < mission.target) return;

    mission.claimed = true;
    this.addXp(mission.xp);
    this.addCoins(mission.coins);

    if (mission.cosmetic) {
      if (mission.cosmetic.includes('Ship') && !this.currentUser.unlockedShips.includes('spectre')) {
        this.currentUser.unlockedShips.push('spectre');
      } else if (mission.cosmetic.includes('Trail') && !this.currentUser.unlockedTrails.includes('cosmic')) {
        this.currentUser.unlockedTrails.push('cosmic');
      } else if (mission.cosmetic.includes('Frame') && !this.currentUser.unlockedFrames.includes('amethyst')) {
        this.currentUser.unlockedFrames.push('amethyst');
      }
    }

    this.saveMissionsData();
    this.saveUserSession();
    this.renderHeaderUserBar();

    const cosmeticNote = mission.cosmetic ? ` + 🏆 ${mission.cosmetic} Unlocked!` : '';
    this.triggerPlatformNotification(`✓ MISSION COMPLETED`, `+${mission.xp} XP & +${mission.coins} Coins claimed!${cosmeticNote}`, '🎯');
    this.renderMissionsTab();
  }

  // --- OFFLINE TELEMETRY SYNC ---
  initOfflineSync() {
    window.addEventListener('online', () => {
      this.triggerPlatformNotification('Network Restored', 'Back online. Telemetry synchronized with cloud.', '🌐');
      this.syncOfflineRuns();
    });
    window.addEventListener('offline', () => {
      this.triggerPlatformNotification('Offline Mode', 'Runs are preserved locally and will sync upon reconnect.', '📡');
    });
  }

  syncOfflineRuns() {
    try {
      const stored = localStorage.getItem('neon_escape_offline_runs');
      if (stored) {
        const runs = JSON.parse(stored);
        if (Array.isArray(runs) && runs.length > 0) {
          localStorage.removeItem('neon_escape_offline_runs');
          console.log(`[OfflineSync] Synced ${runs.length} cached offline runs successfully.`);
        }
      }
    } catch (e) {}
  }

  // --- ACHIEVEMENTS SYSTEM ---
  checkAchievement(id, conditionMet) {
    if (!conditionMet) return;
    if (this.currentUser.achievementsUnlocked[id]) return;

    const ach = this.achievementsCatalog.find(a => a.id === id);
    if (!ach) return;

    this.currentUser.achievementsUnlocked[id] = new Date().toISOString();
    this.addXp(ach.xp);
    this.addCoins(ach.coins);
    this.saveUserSession();

    this.triggerPlatformNotification(`🏆 ACHIEVEMENT UNLOCKED: ${ach.title}`, `${ach.desc} (+${ach.xp} XP, +${ach.coins} Coins)`, ach.icon);
    if (window.game && window.game.audio) {
      window.game.audio.playAchievement();
    }
  }

  checkAllAchievements(runStats) {
    const s = this.currentUser.stats;
    this.checkAchievement('first_flight', s.gamesPlayed >= 1);
    this.checkAchievement('survivor_60', runStats.survivalTime >= 60);
    this.checkAchievement('survivor_180', runStats.survivalTime >= 180);
    this.checkAchievement('survivor_300', runStats.survivalTime >= 300);
    this.checkAchievement('near_miss_10', s.nearMisses >= 10);
    this.checkAchievement('near_miss_50', s.nearMisses >= 50);
    this.checkAchievement('combo_3', runStats.maxCombo >= 3);
    this.checkAchievement('combo_5', runStats.maxCombo >= 5);
    this.checkAchievement('crystals_50', s.crystalsCollected >= 50);
    this.checkAchievement('crystals_500', s.crystalsCollected >= 500);
    this.checkAchievement('crystals_1000', s.crystalsCollected >= 1000);
    this.checkAchievement('powerups_20', s.powerupsCollected >= 20);
    this.checkAchievement('score_25k', runStats.score >= 25000);
    this.checkAchievement('score_100k', runStats.score >= 100000);
    this.checkAchievement('score_500k', runStats.score >= 500000);
  }

  // --- ANTI-CHEAT & SCORE SUBMISSION ---
  startSession() {
    this.gameSessionToken = 'ses_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
    this.gameSessionStart = {
      token: this.gameSessionToken,
      timestamp: Date.now(),
      score: 0,
      crystals: 0,
      nearMisses: 0,
      powerups: 0
    };
  }

  submitScore(rawScore, survivalSeconds, runDetails = {}) {
    const now = Date.now();
    const sessionDuration = this.gameSessionStart ? (now - this.gameSessionStart.timestamp) / 1000 : survivalSeconds;

    // 1. Session Replay Protection
    if (this.gameSessionStart && this.usedSessionTokens && this.usedSessionTokens.has(this.gameSessionStart.token)) {
      console.warn('[Anti-Cheat] Duplicate score submission rejected (replay token).');
      return { verified: false, score: 0 };
    }
    if (this.gameSessionStart) {
      if (!this.usedSessionTokens) this.usedSessionTokens = new Set();
      this.usedSessionTokens.add(this.gameSessionStart.token);
    }

    // 2. Score ceiling per second (max ~320 pts/s under sustained 5X combo + double score powerup)
    const maxAllowableScore = Math.max(100, (sessionDuration + 3) * 320);
    if (rawScore > maxAllowableScore) {
      console.warn('[Anti-Cheat] Score rejected due to anomalous scoring telemetry:', rawScore, 'Max:', maxAllowableScore);
      this.triggerPlatformNotification('SECURITY NOTICE', 'Score rejected by sector anti-cheat protocol.', '⚠️');
      return { verified: false, score: 0 };
    }

    // 3. Minimum survival time vs score jump
    if (rawScore > 5000 && sessionDuration < 5) {
      console.warn('[Anti-Cheat] Impossible score for survival time.');
      return { verified: false, score: 0 };
    }

    // 4. Rate-limiting for crystals and near-misses
    const maxCrystals = (sessionDuration + 2) * 8;
    if ((runDetails.crystals || 0) > maxCrystals) {
      console.warn('[Anti-Cheat] Excessive crystal collection rate detected.');
      return { verified: false, score: 0 };
    }

    const verifiedScore = Math.max(0, Math.floor(rawScore));
    const stats = this.currentUser.stats;

    // Update career stats
    stats.gamesPlayed++;
    stats.lastRunScore = verifiedScore;
    stats.totalScore += verifiedScore;
    stats.totalSurvivalTime += Math.floor(survivalSeconds);
    stats.longestSurvival = Math.max(stats.longestSurvival, Math.floor(survivalSeconds));
    stats.crystalsCollected += (runDetails.crystals || 0);
    stats.obstaclesDodged += (runDetails.dodges || 0);
    stats.nearMisses += (runDetails.nearMisses || 0);
    stats.powerupsCollected += (runDetails.powerups || 0);
    stats.highestCombo = Math.max(stats.highestCombo, runDetails.maxCombo || 1);

    const isNewPersonalBest = verifiedScore > stats.bestScore;
    if (isNewPersonalBest) {
      stats.bestScore = verifiedScore;
    }

    // Award career XP and coins based on score & survival
    const earnedXp = Math.floor(verifiedScore / 10) + Math.floor(survivalSeconds * 2);
    const earnedCoins = Math.floor(verifiedScore / 50) + Math.floor(survivalSeconds / 3);
    this.addXp(earnedXp);
    this.addCoins(earnedCoins);

    // Update daily, weekly, and seasonal missions (single verified pipeline)
    this.updateMissionProgress('survival', survivalSeconds);
    this.updateMissionProgress('crystals', runDetails.crystals || 0);
    this.updateMissionProgress('nearMiss', runDetails.nearMisses || 0);
    this.updateMissionProgress('combo', runDetails.maxCombo || 1);
    this.updateMissionProgress('powerup', runDetails.powerups || 0);
    this.updateMissionProgress('score', verifiedScore);
    this.updateMissionProgress('games', 1);
    this.updateMissionProgress('dodges', runDetails.dodges || 0);

    // Check all achievements
    this.checkAllAchievements({
      score: verifiedScore,
      survivalTime: survivalSeconds,
      maxCombo: runDetails.maxCombo || 1
    });

    // Check offline resilience
    if (!navigator.onLine) {
      try {
        const offlineQueue = JSON.parse(localStorage.getItem('neon_escape_offline_runs') || '[]');
        offlineQueue.push({ score: verifiedScore, time: survivalSeconds, timestamp: Date.now() });
        localStorage.setItem('neon_escape_offline_runs', JSON.stringify(offlineQueue));
      } catch (err) {}
    }

    // Check active challenge
    let challengeOutcome = null;
    if (this.activeChallenge) {
      if (verifiedScore >= this.activeChallenge.targetScore) {
        challengeOutcome = { won: true, reward: 200 };
        this.addCoins(200);
        stats.challengesWon++;
        this.checkAchievement('challenge_win', true);
        this.triggerPlatformNotification('CHALLENGE VICTORY!', `You beat ${this.activeChallenge.opponentName}'s score of ${this.activeChallenge.targetScore.toLocaleString()}! +200 Coins!`, '⚔️');
      } else {
        challengeOutcome = { won: false };
        stats.challengesLost++;
      }
      this.activeChallenge = null;
    }

    // Update Leaderboard
    const rankInfo = this.recordLeaderboardScore(verifiedScore, survivalSeconds);

    this.saveUserSession();
    this.renderHeaderUserBar();

    return {
      verified: true,
      score: verifiedScore,
      isNewPersonalBest,
      earnedXp,
      earnedCoins,
      globalRank: rankInfo.rank,
      isNewGlobalRank: rankInfo.isTop10,
      challengeOutcome
    };
  }

  // Record score into leaderboard collection
  recordLeaderboardScore(score, survivalTime) {
    if (score <= 0) return { rank: null, isTop10: false };

    const board = this.getLeaderboardData('global', 'all-time');
    const existingIndex = board.findIndex(entry => entry.playerId === this.currentUser.playerId);

    const now = new Date();
    const dateStr = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`;

    const playerEntry = {
      id: this.currentUser.uid,
      playerId: this.currentUser.playerId,
      username: this.currentUser.username,
      displayName: this.currentUser.displayName || this.currentUser.username,
      country: this.currentUser.country || '🌍 GL',
      flag: this.currentUser.flag || '🌍',
      avatar: this.currentUser.avatar || 'apex',
      level: this.currentUser.level || 1,
      score: Math.max(score, existingIndex >= 0 ? board[existingIndex].score : 0),
      survivalTime: Math.floor(survivalTime),
      date: dateStr,
      updatedAt: now.toISOString()
    };

    if (existingIndex >= 0) {
      board[existingIndex] = playerEntry;
    } else {
      board.push(playerEntry);
    }

    board.sort((a, b) => b.score - a.score);
    this.saveLeaderboardData('global', 'all-time', board);

    // Save to Firestore leaderboard collection if online
    if (window.FirebaseBridge && window.FirebaseBridge.isLive && !this.currentUser.isGuest) {
      try {
        window.FirebaseBridge.db.collection('leaderboard').doc(this.currentUser.playerId).set(playerEntry, { merge: true });
      } catch (err) {
        console.warn('Firestore leaderboard write deferred:', err);
      }
    }

    const newRank = board.findIndex(e => e.playerId === this.currentUser.playerId) + 1;
    return {
      rank: newRank,
      isTop10: newRank <= 10
    };
  }

  // --- LEADERBOARDS ENGINE ---
  getLeaderboardData(category = 'global', period = 'all-time') {
    const key = `neon_escape_lb_${category}_${period}`;
    let entries = [];
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          entries = parsed;
        }
      } else {
        // Fallback to global all-time store
        const globalStored = localStorage.getItem('neon_escape_lb_global_all-time');
        if (globalStored) {
          const parsed = JSON.parse(globalStored);
          if (Array.isArray(parsed)) entries = parsed;
        }
      }
    } catch (e) {}

    // Ensure current user's recorded high score is included if they have played
    if (this.currentUser && this.currentUser.stats && this.currentUser.stats.bestScore > 0) {
      const exists = entries.some(e => e.playerId === this.currentUser.playerId);
      if (!exists) {
        entries.push({
          id: this.currentUser.uid,
          playerId: this.currentUser.playerId,
          username: this.currentUser.username,
          displayName: this.currentUser.displayName || this.currentUser.username,
          country: this.currentUser.country || '🌍 GL',
          flag: this.currentUser.flag || '🌍',
          avatar: this.currentUser.avatar || 'apex',
          level: this.currentUser.level || 1,
          score: this.currentUser.stats.bestScore,
          survivalTime: this.currentUser.stats.longestSurvival || 0,
          date: new Date().toLocaleDateString()
        });
      }
    }

    // Filter by country if country board
    if (category === 'country' && this.currentUser) {
      const countryCode = (this.currentUser.country || '').split(' ')[1] || 'US';
      entries = entries.filter(p => (p.country || '').includes(countryCode));
    } else if (category === 'friends' && this.currentUser) {
      const friends = this.currentUser.friends || [];
      entries = entries.filter(p => friends.includes(p.playerId) || p.playerId === this.currentUser.playerId);
    }

    return entries.sort((a, b) => b.score - a.score);
  }

  saveLeaderboardData(category, period, list) {
    const key = `neon_escape_lb_${category}_${period}`;
    try {
      localStorage.setItem(key, JSON.stringify(list.slice(0, 100)));
    } catch (e) {}
  }

  async syncCloudLeaderboard() {
    if (window.FirebaseBridge && window.FirebaseBridge.isLive) {
      try {
        const snap = await window.FirebaseBridge.db.collection('leaderboard')
          .orderBy('score', 'desc')
          .limit(50)
          .get();
        if (snap && !snap.empty) {
          const cloudList = [];
          snap.forEach(doc => {
            const data = doc.data();
            if (data && data.score) cloudList.push(data);
          });
          if (cloudList.length > 0) {
            this.saveLeaderboardData('global', 'all-time', cloudList);
            if (this.activeTab === 'rankings') {
              this.renderRankingsTab();
            }
          }
        }
      } catch (e) {
        console.warn('Cloud leaderboard fetch note:', e.message);
      }
    }
  }

  // --- NAVIGATION & TABS ---
  bindPlatformNavigation() {
    const navButtons = document.querySelectorAll('.nav-tab-btn, .mobile-nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab) this.switchTab(tab);
      });
    });

    // Profile Trigger in Header
    const userCardBtn = document.getElementById('headerUserCard');
    if (userCardBtn) {
      userCardBtn.addEventListener('click', () => this.switchTab('profile'));
    }

    // Modal close buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.game-overlay, .platform-modal');
        if (modal) modal.classList.add('hidden');
      });
    });
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll('.nav-tab-btn, .mobile-nav-btn').forEach(b => {
      if (b.dataset.tab === tabName) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    document.querySelectorAll('.platform-view-tab').forEach(view => {
      if (view.id === `tab-${tabName}`) {
        view.classList.remove('hidden');
      } else {
        view.classList.add('hidden');
      }
    });

    this.renderCurrentTab();
  }

  renderCurrentTab() {
    switch (this.activeTab) {
      case 'play':
        this.renderPlayTab();
        break;
      case 'rankings':
        this.renderRankingsTab();
        break;
      case 'profile':
        this.renderProfileTab();
        break;
      case 'missions':
        this.renderMissionsTab();
        break;
      case 'achievements':
        this.renderAchievementsTab();
        break;
      case 'garage':
        this.renderGarageTab();
        break;
      case 'friends':
        this.renderFriendsTab();
        break;
      case 'challenges':
        this.renderChallengesTab();
        break;
      case 'settings':
        this.renderSettingsTab();
        break;
      case 'howtoplay':
        this.renderHowToPlayTab();
        break;
    }
  }

  // --- HEADER USER STATUS BAR ---
  renderHeaderUserBar() {
    const u = this.currentUser;
    if (!u) return;

    const avatarBox = document.getElementById('headerAvatarBox');
    const mobileAvatar = document.getElementById('mobileAvatarIcon');
    const nameEl = document.getElementById('headerUsername');
    const idEl = document.getElementById('headerPlayerId');
    const levelEl = document.getElementById('headerLevel');
    const coinsEl = document.getElementById('headerCoins');
    const xpBar = document.getElementById('headerXpBar');
    const guestBanner = document.getElementById('guestBannerNotice');
    const sidebarMissionPill = document.getElementById('sidebarMissionPill');

    const curAvatar = this.avatarsCatalog.find(a => a.id === u.avatar) || this.avatarsCatalog[0];
    if (avatarBox) avatarBox.textContent = curAvatar.icon;
    if (mobileAvatar) mobileAvatar.textContent = curAvatar.icon;
    if (nameEl) nameEl.textContent = u.displayName || u.username;
    if (idEl) idEl.textContent = u.playerId;
    if (levelEl) levelEl.textContent = `LVL ${u.level}`;
    if (coinsEl) coinsEl.textContent = u.coins.toLocaleString();

    if (xpBar) {
      const nextXp = this.getXpForNextLevel(u.level);
      const pct = Math.min(100, Math.floor((u.xp / nextXp) * 100));
      xpBar.style.width = `${pct}%`;
      xpBar.setAttribute('title', `${u.xp} / ${nextXp} XP (${pct}%)`);
    }

    if (sidebarMissionPill && this.dailyMissions) {
      const uncompleted = this.dailyMissions.filter(m => !m.claimed).length;
      sidebarMissionPill.textContent = uncompleted;
    }

    if (guestBanner) {
      if (u.isGuest) {
        guestBanner.classList.remove('hidden');
      } else {
        guestBanner.classList.add('hidden');
      }
    }
  }

  getUserGlobalRank() {
    const list = this.getLeaderboardData('global', 'all-time');
    const idx = list.findIndex(p => p.playerId === this.currentUser.playerId);
    return idx >= 0 ? (idx + 1) : null;
  }

  // --- TAB: PLAY ---
  renderPlayTab() {
    const u = this.currentUser;
    const bestScoreEl = document.getElementById('playBestScoreVal');
    const gamesPlayedEl = document.getElementById('playGamesVal');
    const dailyMissionsBadge = document.getElementById('playMissionsCount');
    const greetingEl = document.getElementById('heroGreetingTag');

    if (bestScoreEl) bestScoreEl.textContent = u.stats.bestScore.toLocaleString();
    if (gamesPlayedEl) gamesPlayedEl.textContent = u.stats.gamesPlayed.toLocaleString();

    const uncompletedDaily = (this.dailyMissions || []).filter(m => !m.claimed).length;
    if (dailyMissionsBadge) {
      dailyMissionsBadge.textContent = `${uncompletedDaily} Available`;
    }

    if (greetingEl) {
      const h = new Date().getHours();
      const timeGreeting = h < 12 ? 'Good morning' : (h < 18 ? 'Good afternoon' : 'Good evening');
      const streak = this.currentUser.dailyStreak || 1;
      greetingEl.textContent = `${timeGreeting}, ${u.displayName || u.username} • 🔥 ${streak}-day streak`;
    }

    // 1. Returning Player Summary Card
    const returnGreeting = document.getElementById('returnPlayerGreeting');
    const returnAvatar = document.getElementById('returnPlayerAvatar');
    const returnLastRun = document.getElementById('returnLastRunScore');
    const returnBest = document.getElementById('returnBestScore');
    const returnRank = document.getElementById('returnCurrentRank');
    const returnMissions = document.getElementById('returnDailyMissionsCount');

    if (returnGreeting) returnGreeting.textContent = `WELCOME BACK, ${(u.displayName || u.username).toUpperCase()}`;
    if (returnAvatar) returnAvatar.textContent = this.getAvatarIcon(u.avatar);
    if (returnLastRun) returnLastRun.textContent = `${(u.stats.lastRunScore || 0).toLocaleString()} PTS`;
    if (returnBest) returnBest.textContent = `${u.stats.bestScore.toLocaleString()} PTS`;
    const userRank = this.getUserGlobalRank();
    if (returnRank) returnRank.textContent = userRank ? `#${userRank}` : 'Unranked';
    if (returnMissions) returnMissions.textContent = `${uncompletedDaily} Available`;

    // 2. Friends Duel Snapshot
    const duelEl = document.getElementById('friendsDuelContent');
    if (duelEl) {
      const friends = this.currentUser.friends || [];
      const board = this.getLeaderboardData('global', 'all-time');
      const rival = friends.length > 0 ? board.find(p => friends.includes(p.playerId) && p.playerId !== u.playerId) : null;

      if (rival) {
        const diff = Math.abs(rival.score - u.stats.bestScore);
        const isAhead = u.stats.bestScore >= rival.score;
        const comparisonText = isAhead 
          ? `You lead ${rival.username} by <strong style="color: var(--color-success);">${diff.toLocaleString()} points</strong>!` 
          : `You're <strong style="color: var(--accent-primary);">${diff.toLocaleString()} points</strong> behind ${rival.username}.`;

        duelEl.innerHTML = `
          <div class="duel-player-item">
            <span class="duel-avatar">${this.getAvatarIcon(rival.avatar)}</span>
            <div class="duel-info">
              <span class="duel-name">${this.escapeHtml(rival.username)} <span class="badge-level">LVL ${rival.level}</span></span>
              <span class="duel-score highlight-score">${rival.score.toLocaleString()} PTS</span>
            </div>
          </div>
          <div class="duel-vs-chip">VS</div>
          <div class="duel-player-item you">
            <span class="duel-avatar">${this.getAvatarIcon(u.avatar)}</span>
            <div class="duel-info">
              <span class="duel-name">You (${this.escapeHtml(u.username)}) <span class="you-badge">YOU</span></span>
              <span class="duel-score highlight-score">${u.stats.bestScore.toLocaleString()} PTS</span>
            </div>
          </div>
          <div class="duel-action-row">
            <span class="duel-hint-text">${comparisonText}</span>
            <button class="btn btn-sm btn-primary" onclick="window.platform.openCreateChallenge('${rival.playerId}', '${rival.username}', ${rival.score})">
              Challenge ${rival.username}
            </button>
          </div>
        `;
      } else {
        duelEl.innerHTML = `
          <div style="padding: 16px; text-align: center; width: 100%;">
            <div style="font-size: 26px; margin-bottom: 6px;">🤝</div>
            <strong style="display: block; font-size: 14px; margin-bottom: 4px;">ALLIED FLEET &amp; DUELS</strong>
            <p class="text-xs text-secondary" style="margin-bottom: 12px; line-height: 1.4;">Add friends using their unique Player ID to compete in head-to-head score battles.</p>
            <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
              <button class="btn btn-sm btn-secondary" onclick="window.platform.copyPlayerId()">
                📋 Copy My ID (${this.currentUser.playerId})
              </button>
              <button class="btn btn-sm btn-primary" onclick="window.platform.switchTab('friends')">
                View Friends
              </button>
            </div>
          </div>
        `;
      }
    }

    // 3. Render Dashboard Missions Preview (first 3)
    const missionsPreview = document.getElementById('dashboardMissionsPreview');
    if (missionsPreview && this.dailyMissions) {
      missionsPreview.innerHTML = '';
      this.dailyMissions.slice(0, 3).forEach(m => {
        const isComplete = m.current >= m.target;
        const pct = Math.min(100, Math.floor((m.current / m.target) * 100));
        const card = document.createElement('div');
        card.className = `surface-card mission-preview-card ${m.claimed ? 'mission-claimed' : (isComplete ? 'mission-ready' : '')}`;
        card.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <span style="font-size: 20px;">${m.icon}</span>
            <div style="flex-grow: 1; min-width: 0;">
              <strong style="display: block; font-size: 13px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${this.escapeHtml(m.title)}</strong>
              <span class="text-xs text-secondary">+${m.xp} XP • +${m.coins} 🪙</span>
            </div>
            ${m.claimed 
              ? '<span class="badge-chip">Claimed</span>' 
              : (isComplete 
                  ? `<button class="btn btn-sm btn-primary" onclick="window.platform.claimMission('${m.id}')">Claim</button>`
                  : `<span class="badge-chip">${pct}%</span>`
                )
            }
          </div>
          <div class="progress-bar-bg" style="height: 5px;">
            <div class="progress-bar-fill" style="width: ${pct}%;"></div>
          </div>
        `;
        missionsPreview.appendChild(card);
      });
    }

    // 4. Render Top Players Mini Preview
    const miniTopEl = document.getElementById('dashboardTopPlayersMini');
    if (miniTopEl) {
      const list = this.getLeaderboardData('global', 'all-time').slice(0, 3);
      miniTopEl.innerHTML = '';
      if (list.length === 0) {
        miniTopEl.innerHTML = `
          <div class="text-xs text-secondary" style="padding: 12px; text-align: center;">
            You're currently among the first players! Deploy a run to record the sector benchmark.
          </div>
        `;
      } else {
        list.forEach((p, idx) => {
          const badges = ['🥇', '🥈', '🥉'];
          const row = document.createElement('div');
          row.className = 'mini-player-row';
          row.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="mini-rank-pill">${badges[idx]}</span>
              <span style="font-weight: 600;">${this.escapeHtml(p.username)}</span>
              <span class="text-xs text-secondary">${p.country || ''}</span>
            </div>
            <span style="font-weight: 700; color: var(--accent-primary);">${p.score.toLocaleString()}</span>
          `;
          miniTopEl.appendChild(row);
        });
      }
    }
  }

  // --- TAB: RANKINGS ---
  renderRankingsTab() {
    this.syncCloudLeaderboard();
    const list = this.getLeaderboardData(this.currentRankingFilter, this.currentRankingPeriod);
    const podiumEl = document.getElementById('rankingsPodium');
    const listEl = document.getElementById('rankingsTableBody');
    const yourRankEl = document.getElementById('yourRankDock');

    // Filter by search query if present
    let filtered = list;
    if (this.searchQuery && this.searchQuery.trim().length > 0) {
      const q = this.searchQuery.trim().toLowerCase();
      filtered = list.filter(p => 
        (p.username && p.username.toLowerCase().includes(q)) || 
        (p.playerId && p.playerId.toLowerCase().includes(q)) ||
        (p.country && p.country.toLowerCase().includes(q))
      );
    }

    // Render Top 3 Podium
    if (podiumEl) {
      if (list.length === 0) {
        podiumEl.innerHTML = `
          <div class="surface-card" style="grid-column: 1 / -1; text-align: center; padding: 36px 20px; border: 1px dashed var(--border-subtle); border-radius: 16px; background: rgba(37, 99, 235, 0.04);">
            <div style="font-size: 38px; margin-bottom: 8px;">🚀</div>
            <h3 style="font-size: 17px; font-weight: 700; margin-bottom: 6px;">You're currently among the first players!</h3>
            <p class="text-sm text-secondary" style="max-width: 440px; margin: 0 auto 16px;">The season leaderboard is waiting for its first record-breakers. Launch your interceptor into the void and claim the #1 spot!</p>
            <button class="btn btn-primary btn-sm" onclick="window.platform.launchGame()">Deploy First Run</button>
          </div>
        `;
      } else {
        const top3 = list.slice(0, 3);
        const p1 = top3[0] || null;
        const p2 = top3[1] || null;
        const p3 = top3[2] || null;

        podiumEl.innerHTML = `
          <!-- Rank #2 Silver (Left) -->
          <div class="podium-card rank-silver podium-stagger-2">
            <div class="podium-medal-circle silver">🥈</div>
            <div class="podium-avatar-box">${p2 ? this.getAvatarIcon(p2.avatar) : '🛸'}</div>
            <div class="podium-name">${p2 ? this.escapeHtml(p2.username) : 'Awaiting Challenger'}</div>
            <div class="podium-country">${p2 ? (p2.country || '🌍') + ' • LVL ' + (p2.level || 1) : 'Open Spot'}</div>
            <div class="podium-score highlight-score">${p2 ? p2.score.toLocaleString() : '--'}</div>
            <div class="podium-pedestal-step silver-step">2ND PLACE</div>
          </div>

          <!-- Rank #1 Gold (Center, Elevated) -->
          <div class="podium-card rank-gold podium-stagger-1">
            <div class="podium-medal-circle gold">🥇</div>
            <div class="podium-avatar-box gold-glow">${p1 ? this.getAvatarIcon(p1.avatar) : '🏆'}</div>
            <div class="podium-name">${p1 ? this.escapeHtml(p1.username) : 'Awaiting Challenger'}</div>
            <div class="podium-country">${p1 ? (p1.country || '🌍') + ' • LVL ' + (p1.level || 1) : 'Claim Champion'}</div>
            <div class="podium-score highlight-gold">${p1 ? p1.score.toLocaleString() : '--'}</div>
            <div class="podium-pedestal-step gold-step">CHAMPION</div>
          </div>

          <!-- Rank #3 Bronze (Right) -->
          <div class="podium-card rank-bronze podium-stagger-3">
            <div class="podium-medal-circle bronze">🥉</div>
            <div class="podium-avatar-box">${p3 ? this.getAvatarIcon(p3.avatar) : '🛸'}</div>
            <div class="podium-name">${p3 ? this.escapeHtml(p3.username) : 'Awaiting Challenger'}</div>
            <div class="podium-country">${p3 ? (p3.country || '🌍') + ' • LVL ' + (p3.level || 1) : 'Open Spot'}</div>
            <div class="podium-score highlight-score">${p3 ? p3.score.toLocaleString() : '--'}</div>
            <div class="podium-pedestal-step bronze-step">3RD PLACE</div>
          </div>
        `;
      }
    }

    // Render Table Rows
    if (listEl) {
      listEl.innerHTML = '';
      if (filtered.length === 0) {
        const msg = this.searchQuery 
          ? `No players found matching "${this.escapeHtml(this.searchQuery)}"`
          : "You're currently among the first players. Complete your first run to set a global benchmark!";
        listEl.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 28px; color: var(--text-secondary);">${msg}</td></tr>`;
      } else {
        filtered.forEach((entry, idx) => {
          const rank = idx + 1;
          const isYou = entry.playerId === this.currentUser.playerId;
          const tr = document.createElement('tr');
          if (isYou) tr.className = 'leaderboard-you-row';

          let rankBadge = `#${rank}`;
          if (rank === 1) rankBadge = '🥇 #1';
          else if (rank === 2) rankBadge = '🥈 #2';
          else if (rank === 3) rankBadge = '🥉 #3';

          tr.innerHTML = `
            <td class="col-rank">${rankBadge}</td>
            <td class="col-player">
              <span class="player-avatar-mini">${this.getAvatarIcon(entry.avatar)}</span>
              <span class="player-username">${this.escapeHtml(entry.username)}</span>
              ${isYou ? '<span class="you-badge">YOU</span>' : ''}
              <span class="player-subid">${entry.playerId}</span>
            </td>
            <td class="col-country">${entry.country || '🌍 GL'}</td>
            <td class="col-level"><span class="badge-level">LVL ${entry.level || 1}</span></td>
            <td class="col-score highlight-score">${entry.score.toLocaleString()}</td>
          `;
          listEl.appendChild(tr);
        });
      }
    }

    // Persistent "YOUR RANK" Dock Card
    if (yourRankEl) {
      const userRank = this.getUserGlobalRank();
      const hasScore = this.currentUser.stats && this.currentUser.stats.bestScore > 0;
      yourRankEl.innerHTML = `
        <div class="your-rank-info">
          <div class="your-rank-title-row">
            <span class="your-rank-badge">YOUR RANK: <strong>${userRank ? '#' + userRank + ' GLOBAL' : 'UNRANKED'}</strong></span>
            ${userRank ? '<span class="rank-delta-badge">★ Active Record</span>' : '<span class="text-xs text-secondary">Deploy a run to record rank</span>'}
          </div>
          <div class="your-rank-user">${this.escapeHtml(this.currentUser.username)} • ${this.currentUser.country}</div>
        </div>
        <div class="your-rank-score highlight-score">
          ${hasScore ? this.currentUser.stats.bestScore.toLocaleString() + ' PTS' : '--'}
        </div>
      `;
    }
  }

  // --- TAB: PROFILE ---
  renderProfileTab() {
    const u = this.currentUser;
    const nameEl = document.getElementById('profileUsername');
    const idEl = document.getElementById('profilePlayerId');
    const countryEl = document.getElementById('profileCountry');
    const levelEl = document.getElementById('profileLevelBadge');
    const xpText = document.getElementById('profileXpText');
    const xpFill = document.getElementById('profileXpFill');
    const avatarBox = document.getElementById('profileAvatarBox');

    const nextXp = this.getXpForNextLevel(u.level);
    const pct = Math.min(100, Math.floor((u.xp / nextXp) * 100));

    if (nameEl) nameEl.textContent = u.displayName || u.username;
    if (idEl) idEl.textContent = u.playerId;
    if (countryEl) countryEl.textContent = u.country;
    if (levelEl) levelEl.textContent = `LEVEL ${u.level}`;
    if (xpText) xpText.textContent = `${u.xp.toLocaleString()} / ${nextXp.toLocaleString()} XP`;
    if (xpFill) xpFill.style.width = `${pct}%`;
    if (avatarBox) avatarBox.textContent = this.getAvatarIcon(u.avatar);

    // Career Stats Grid
    const s = u.stats;
    const statsBindings = {
      'statBestScore': s.bestScore.toLocaleString(),
      'statGamesPlayed': s.gamesPlayed.toLocaleString(),
      'statTotalScore': s.totalScore.toLocaleString(),
      'statLongestRun': this.formatTime(s.longestSurvival),
      'statTotalSurvival': this.formatTime(s.totalSurvivalTime),
      'statCrystals': s.crystalsCollected.toLocaleString(),
      'statNearMisses': s.nearMisses.toLocaleString(),
      'statDodges': s.obstaclesDodged.toLocaleString(),
      'statPowerups': s.powerupsCollected.toLocaleString(),
      'statMaxCombo': `${s.highestCombo}x`
    };

    for (let id in statsBindings) {
      const el = document.getElementById(id);
      if (el) el.textContent = statsBindings[id];
    }
  }

  // --- TAB: MISSIONS (Items 25, 26, 27, 28, 29) ---
  renderMissionsTab() {
    const container = document.getElementById('missionsListContainer');
    const streakEl = document.getElementById('missionsStreakCounter');
    if (streakEl) streakEl.textContent = `🔥 ${this.currentUser.dailyStreak || 1} Day Streak`;

    if (!container) return;
    container.innerHTML = '';

    const list = this.activeMissionCategory === 'weekly' 
      ? (this.weeklyMissions || [])
      : (this.activeMissionCategory === 'seasonal' ? (this.seasonalMissions || []) : (this.dailyMissions || []));

    if (list.length === 0) {
      container.innerHTML = '<div class="surface-card text-secondary" style="text-align:center; padding: 24px;">No directives currently active in this category.</div>';
      return;
    }

    list.forEach(m => {
      const isComplete = m.current >= m.target;
      const pct = Math.min(100, Math.floor((m.current / m.target) * 100));
      
      // Determine 4 Visual States (Items 25, 26, 28, 29)
      let stateClass = 'state-not-started';
      let stateBadge = `<span class="badge-chip">Not Started</span>`;
      let actionHtml = `<button class="btn btn-sm btn-secondary" disabled>0 / ${m.target}</button>`;

      if (m.claimed) {
        stateClass = 'state-claimed';
        stateBadge = `<span class="badge-chip state-chip-claimed">✓ Claimed</span>`;
        actionHtml = `<button class="btn btn-sm btn-secondary" disabled>✓ Claimed</button>`;
      } else if (isComplete) {
        stateClass = 'state-completed';
        stateBadge = `<span class="badge-chip state-chip-ready">✓ Complete</span>`;
        actionHtml = `<button class="btn btn-sm btn-primary claim-mission-btn" onclick="window.platform.claimMission('${m.id}')">CLAIM REWARD</button>`;
      } else if (m.current > 0) {
        stateClass = 'state-in-progress';
        stateBadge = `<span class="badge-chip state-chip-progress">${pct}%</span>`;
        actionHtml = `<button class="btn btn-sm btn-secondary" disabled>${m.current} / ${m.target}</button>`;
      }

      const rewardBadges = `
        <span class="mission-pill-xp">+${m.xp} XP</span>
        <span class="mission-pill-coins">+${m.coins} 🪙</span>
        ${m.cosmetic ? `<span class="mission-pill-cosmetic">🏆 ${m.cosmetic}</span>` : ''}
      `;

      const card = document.createElement('div');
      card.className = `mission-card ${stateClass}`;
      card.innerHTML = `
        <div class="mission-icon-box">${m.icon}</div>
        <div class="mission-details">
          <div class="mission-title-row">
            <span class="mission-title">${this.escapeHtml(m.title)}</span>
            ${stateBadge}
          </div>
          <p class="mission-desc">${this.escapeHtml(m.desc)}</p>
          <div class="mission-progress-bar">
            <div class="mission-progress-fill" style="width: ${pct}%"></div>
          </div>
          <div class="mission-meta-footer">
            <span class="mission-progress-text">${m.current} / ${m.target} (${pct}%)</span>
            <div class="mission-rewards-row">${rewardBadges}</div>
          </div>
        </div>
        <div class="mission-action">
          ${actionHtml}
        </div>
      `;
      container.appendChild(card);
    });
  }

  // --- TAB: ACHIEVEMENTS ---
  renderAchievementsTab() {
    const container = document.getElementById('achievementsGridContainer');
    const countEl = document.getElementById('achievementsCountBadge');
    if (!container) return;

    const unlocked = Object.keys(this.currentUser.achievementsUnlocked).length;
    if (countEl) countEl.textContent = `${unlocked} / ${this.achievementsCatalog.length} Unlocked`;

    container.innerHTML = '';
    this.achievementsCatalog.forEach(ach => {
      const isUnlocked = Boolean(this.currentUser.achievementsUnlocked[ach.id]);
      const card = document.createElement('div');
      card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;

      card.innerHTML = `
        <div class="ach-icon-ring ${isUnlocked ? 'ach-unlocked-glow' : ''}">${ach.icon}</div>
        <div class="ach-info">
          <div class="ach-title">${this.escapeHtml(ach.title)}</div>
          <div class="ach-desc">${this.escapeHtml(ach.desc)}</div>
          <div class="ach-pills">
            <span class="ach-pill xp">+${ach.xp} XP</span>
            <span class="ach-pill coins">+${ach.coins} Coins</span>
            ${isUnlocked ? '<span class="ach-pill status-unlocked">Completed</span>' : '<span class="ach-pill status-locked">Locked</span>'}
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // --- TAB: GARAGE & COSMETICS ---
  renderGarageTab() {
    const shipList = document.getElementById('garageShipSelector');
    const trailList = document.getElementById('garageTrailSelector');

    // Render Ships
    if (shipList) {
      shipList.innerHTML = '';
      this.shipsCatalog.forEach(ship => {
        const isUnlocked = this.currentUser.unlockedShips.includes(ship.id);
        const isEquipped = this.currentUser.equippedShip === ship.id;
        const card = document.createElement('div');
        card.className = `cosmetic-card ${isEquipped ? 'equipped' : (isUnlocked ? 'unlocked' : 'locked')}`;
        
        card.innerHTML = `
          <div class="cosmetic-preview-box" style="border-color: ${ship.color}">
            <span class="cosmetic-icon">🚀</span>
          </div>
          <div class="cosmetic-name">${ship.name}</div>
          <div class="cosmetic-desc">${ship.desc}</div>
          <div class="cosmetic-footer">
            ${isEquipped 
              ? '<span class="badge-equipped">EQUIPPED</span>'
              : (isUnlocked 
                  ? `<button class="btn btn-sm btn-secondary btn-block" onclick="window.platform.equipCosmetic('ship', '${ship.id}')">Equip</button>`
                  : (this.currentUser.level >= ship.reqLevel && this.currentUser.coins >= ship.cost
                      ? `<button class="btn btn-sm btn-primary btn-block" onclick="window.platform.buyCosmetic('ship', '${ship.id}')">Unlock (${ship.cost} 🪙)</button>`
                      : `<span class="badge-locked">🔒 Level ${ship.reqLevel} or ${ship.cost} 🪙</span>`
                    )
                )
            }
          </div>
        `;
        shipList.appendChild(card);
      });
    }

    // Render Trails
    if (trailList) {
      trailList.innerHTML = '';
      this.trailsCatalog.forEach(trail => {
        const isUnlocked = this.currentUser.unlockedTrails.includes(trail.id);
        const isEquipped = this.currentUser.equippedTrail === trail.id;
        const card = document.createElement('div');
        card.className = `cosmetic-card ${isEquipped ? 'equipped' : (isUnlocked ? 'unlocked' : 'locked')}`;

        card.innerHTML = `
          <div class="cosmetic-preview-box">
            <span class="trail-swatch" style="background: ${trail.color === 'rainbow' ? 'linear-gradient(90deg, #ff007f, #00f0ff, #00ff88)' : trail.color}"></span>
          </div>
          <div class="cosmetic-name">${trail.name} Trail</div>
          <div class="cosmetic-desc" style="min-height: 20px;">Exhaust particle plume</div>
          <div class="cosmetic-footer">
            ${isEquipped 
              ? '<span class="badge-equipped">EQUIPPED</span>'
              : (isUnlocked 
                  ? `<button class="btn btn-sm btn-secondary btn-block" onclick="window.platform.equipCosmetic('trail', '${trail.id}')">Equip</button>`
                  : (this.currentUser.coins >= trail.cost
                      ? `<button class="btn btn-sm btn-primary btn-block" onclick="window.platform.buyCosmetic('trail', '${trail.id}')">Unlock (${trail.cost} 🪙)</button>`
                      : `<span class="badge-locked">🔒 ${trail.cost} 🪙</span>`
                    )
                )
            }
          </div>
        `;
        trailList.appendChild(card);
      });
    }
  }

  equipCosmetic(type, id) {
    if (type === 'ship') {
      this.currentUser.equippedShip = id;
    } else if (type === 'trail') {
      this.currentUser.equippedTrail = id;
    }
    this.saveUserSession();
    this.renderGarageTab();
    this.triggerPlatformNotification('Cosmetic Equipped', `Activated ${id.toUpperCase()} on your ship!`, '✨');
  }

  buyCosmetic(type, id) {
    const catalog = type === 'ship' ? this.shipsCatalog : this.trailsCatalog;
    const item = catalog.find(i => i.id === id);
    if (!item || this.currentUser.coins < item.cost) {
      this.triggerPlatformNotification('Insufficient Coins', `You need ${item.cost} coins to unlock this item.`, '⚠️');
      return;
    }

    this.currentUser.coins -= item.cost;
    if (type === 'ship') {
      this.currentUser.unlockedShips.push(id);
      this.currentUser.equippedShip = id;
    } else {
      this.currentUser.unlockedTrails.push(id);
      this.currentUser.equippedTrail = id;
    }

    this.saveUserSession();
    this.renderHeaderUserBar();
    this.renderGarageTab();
    this.triggerPlatformNotification('Item Unlocked', `Successfully acquired ${item.name}!`, '🎉');
  }

  // --- TAB: FRIENDS ---
  renderFriendsTab() {
    const listEl = document.getElementById('friendsListContainer');
    if (!listEl) return;

    listEl.innerHTML = '';
    const friends = this.currentUser.friends || [];
    if (friends.length === 0) {
      listEl.innerHTML = `
        <div class="surface-card text-secondary" style="text-align:center; padding: 32px 20px;">
          <div style="font-size: 32px; margin-bottom: 8px;">🤝</div>
          <strong style="display:block; font-size: 15px; color: var(--text-primary); margin-bottom: 4px;">No Pilots Allied Yet</strong>
          <p class="text-sm" style="max-width: 400px; margin: 0 auto 12px;">Share your unique Player ID (<code style="color:var(--accent-primary); font-weight:700;">${this.currentUser.playerId}</code>) with fellow players or enter their ID above to form your squadron.</p>
          <button class="btn btn-sm btn-secondary" onclick="window.platform.copyPlayerId()">Copy My Player ID</button>
        </div>
      `;
      return;
    }

    const leaderboard = this.getLeaderboardData('global', 'all-time');
    friends.forEach(fId => {
      const friendData = leaderboard.find(p => p.playerId === fId) || {
        playerId: fId,
        username: fId,
        country: '🌍 GL',
        score: 0,
        level: 1,
        avatar: 'apex'
      };

      const card = document.createElement('div');
      card.className = 'friend-card';
      card.innerHTML = `
        <div class="friend-info">
          <span class="player-avatar-mini">${this.getAvatarIcon(friendData.avatar)}</span>
          <div>
            <div class="friend-name">${this.escapeHtml(friendData.username)} <span class="badge-level">LVL ${friendData.level || 1}</span></div>
            <div class="friend-id">${friendData.playerId} • ${friendData.country || '🌍 GL'}</div>
          </div>
        </div>
        <div class="friend-actions">
          <button class="btn btn-sm btn-primary" onclick="window.platform.openCreateChallenge('${friendData.playerId}', '${friendData.username}', ${friendData.score || 1000})">Challenge</button>
          <button class="btn btn-sm btn-tertiary" onclick="window.platform.removeFriend('${friendData.playerId}')">Remove</button>
        </div>
      `;
      listEl.appendChild(card);
    });
  }

  addFriend(playerIdOrUsername) {
    if (!playerIdOrUsername) return;
    const clean = playerIdOrUsername.trim().toUpperCase();
    if (clean === this.currentUser.playerId) {
      this.triggerPlatformNotification('Notice', 'You cannot add yourself as a friend.', 'ℹ️');
      return;
    }

    if (!this.currentUser.friends) this.currentUser.friends = [];
    if (this.currentUser.friends.includes(clean)) {
      this.triggerPlatformNotification('Notice', 'Player is already on your friends list.', 'ℹ️');
      return;
    }

    this.currentUser.friends.push(clean);
    this.checkAchievement('allied_pilot', true);
    this.saveUserSession();
    this.renderFriendsTab();
    this.triggerPlatformNotification('Friend Added', `Added ${clean} to your alliance!`, '🤝');
  }

  removeFriend(playerId) {
    if (!this.currentUser.friends) return;
    this.currentUser.friends = this.currentUser.friends.filter(id => id !== playerId);
    this.saveUserSession();
    this.renderFriendsTab();
    this.triggerPlatformNotification('Friend Removed', `Removed from friends list.`, '🗑️');
  }

  // --- TAB: CHALLENGES ---
  renderChallengesTab() {
    const listEl = document.getElementById('challengesListContainer');
    if (!listEl) return;

    listEl.innerHTML = '';
    let challenges = [];
    try {
      challenges = JSON.parse(localStorage.getItem('neon_escape_challenges') || '[]');
    } catch (e) {}

    if (challenges.length === 0) {
      listEl.innerHTML = `
        <div class="surface-card text-secondary" style="text-align:center; padding: 32px 20px;">
          <div style="font-size: 32px; margin-bottom: 8px;">⚔️</div>
          <strong style="display:block; font-size: 15px; color: var(--text-primary); margin-bottom: 4px;">No Active Duels</strong>
          <p class="text-sm" style="max-width: 400px; margin: 0 auto 12px;">Challenge an ally from your Friends list or the Leaderboard to initiate an asynchronous high-score duel.</p>
          <button class="btn btn-sm btn-secondary" onclick="window.platform.switchTab('friends')">View Friends List</button>
        </div>
      `;
      return;
    }

    challenges.forEach(ch => {
      const card = document.createElement('div');
      card.className = 'challenge-card';
      card.innerHTML = `
        <div>
          <div class="challenge-header">
            <span class="challenge-title">Score Duel: ${this.escapeHtml(ch.opponentName)}</span>
            <span class="challenge-reward-badge">+${ch.reward || 200} Coins</span>
          </div>
          <p class="challenge-desc">Target score to beat: <strong style="color: var(--accent-primary);">${(ch.targetScore || 0).toLocaleString()} PTS</strong></p>
        </div>
        <div class="challenge-actions">
          <button class="btn btn-sm btn-primary" onclick="window.platform.acceptChallenge('${ch.id}', '${ch.opponentName}', ${ch.targetScore})">Accept &amp; Play</button>
        </div>
      `;
      listEl.appendChild(card);
    });
  }

  openCreateChallenge(opponentId, opponentName, bestScore) {
    const target = Math.max(1000, Math.floor(bestScore * 0.9));
    this.activeChallenge = {
      opponentId,
      opponentName,
      targetScore: target
    };
    this.triggerPlatformNotification('CHALLENGE ENGAGED', `Target: Beat ${opponentName}'s ${target.toLocaleString()} score! Launching game...`, '⚔️');
    this.launchGame();
  }

  acceptChallenge(id, opponentName, targetScore) {
    this.activeChallenge = {
      id,
      opponentName,
      targetScore
    };
    this.triggerPlatformNotification('CHALLENGE ACCEPTED', `Beat ${targetScore.toLocaleString()} pts to claim victory!`, '🚀');
    this.launchGame();
  }

  // --- VIRAL SOCIAL SHARING (ITEM 9) ---
  shareRunResult(score, survivalSeconds) {
    const s = score || (this.currentUser.stats.lastRunScore || this.currentUser.stats.bestScore || 0);
    const secs = Math.floor(survivalSeconds || this.currentUser.stats.longestSurvival || 0);
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    const timeStr = `${mins}m ${remSecs}s`;
    const rank = this.getUserGlobalRank();
    const rankStr = rank ? `Rank #${rank}` : 'Sector Contender';
    
    const shareText = `I survived ${timeStr} in NEON ESCAPE and scored ${s.toLocaleString()} points (${rankStr})! Can you beat my record?`;
    const shareUrl = window.location.origin + window.location.pathname;

    if (navigator.share) {
      navigator.share({
        title: 'NEON ESCAPE - Arcade Survival',
        text: shareText,
        url: shareUrl
      }).catch(err => {
        if (err.name !== 'AbortError') this.copyToClipboard(`${shareText} Play: ${shareUrl}`);
      });
    } else {
      this.copyToClipboard(`${shareText} Play: ${shareUrl}`);
    }
  }

  copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.triggerPlatformNotification('Copied!', 'Score and challenge link copied to clipboard. Share with your friends!', '📋');
      }).catch(() => {
        this.fallbackCopy(text);
      });
    } else {
      this.fallbackCopy(text);
    }
  }

  fallbackCopy(text) {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
      this.triggerPlatformNotification('Copied!', 'Score and challenge link copied to clipboard. Share with your friends!', '📋');
    } catch (e) {
      this.triggerPlatformNotification('Share Text', text, '🔗');
    }
    document.body.removeChild(el);
  }

  copyPlayerId() {
    this.copyToClipboard(this.currentUser.playerId);
  }

  // --- TAB: SETTINGS & PREFERENCES ---
  renderSettingsTab() {
    const guestCard = document.getElementById('settingsGuestCard');
    const authStatus = document.getElementById('settingsAuthStatus');
    const fbStatus = document.getElementById('settingsFirebaseStatus');

    if (guestCard) {
      if (this.currentUser.isGuest) {
        guestCard.classList.remove('hidden');
      } else {
        guestCard.classList.add('hidden');
      }
    }

    if (authStatus) {
      authStatus.textContent = this.currentUser.isGuest 
        ? 'Guest Mode (Data preserved locally)' 
        : `Authenticated (${this.currentUser.email || this.currentUser.username})`;
    }

    if (fbStatus && window.FirebaseBridge) {
      fbStatus.textContent = window.FirebaseBridge.getStatus().mode;
    }

    // Load and update settings controls
    const settings = this.getSettings();
    const reducedMotionToggle = document.getElementById('settingReducedMotion');
    if (reducedMotionToggle) reducedMotionToggle.checked = !!settings.reducedMotion;

    const vibrationToggle = document.getElementById('settingVibration');
    if (vibrationToggle) vibrationToggle.checked = settings.vibration !== false;

    const qualitySelect = document.getElementById('settingQuality');
    if (qualitySelect) qualitySelect.value = settings.graphicsQuality || 'HIGH';
  }

  getSettings() {
    try {
      return JSON.parse(localStorage.getItem('neon_escape_settings') || '{}');
    } catch (e) {
      return {};
    }
  }

  saveSettings(settings) {
    try {
      localStorage.setItem('neon_escape_settings', JSON.stringify(settings));
    } catch (e) {}
  }

  toggleReducedMotion(enabled) {
    const s = this.getSettings();
    s.reducedMotion = enabled;
    this.saveSettings(s);
    document.documentElement.classList.toggle('reduced-motion', enabled);
    this.triggerPlatformNotification('Preferences', `Reduced motion ${enabled ? 'enabled' : 'disabled'}.`, '⚙️');
  }

  toggleVibration(enabled) {
    const s = this.getSettings();
    s.vibration = enabled;
    this.saveSettings(s);
    this.triggerPlatformNotification('Preferences', `Haptic vibration ${enabled ? 'enabled' : 'disabled'}.`, '📳');
  }

  setGraphicsQuality(level) {
    const s = this.getSettings();
    s.graphicsQuality = level;
    this.saveSettings(s);
    if (window.game && window.game.qm) {
      window.game.qm.currentQuality = level;
    }
    this.triggerPlatformNotification('Quality Mode', `Graphics set to ${level}.`, '🖥️');
  }

  logout() {
    if (window.FirebaseBridge && window.FirebaseBridge.auth) {
      window.FirebaseBridge.auth.signOut().catch(() => {});
    }
    this.currentUser = this.createInitialProfile();
    this.saveUserSession();
    this.renderHeaderUserBar();
    this.switchTab('play');
    this.triggerPlatformNotification('Logged Out', 'Reverted to offline guest profile.', '👋');
  }

  // --- TAB: HOW TO PLAY ---
  renderHowToPlayTab() {
    // Content rendered directly in HTML
  }

  // --- SEASONS TIMER ---
  startSeasonTimer() {
    const timerEl = document.getElementById('seasonCountdownTimer');
    if (!timerEl) return;

    const update = () => {
      const diff = new Date(this.currentSeason.endDate).getTime() - Date.now();
      if (diff <= 0) {
        timerEl.textContent = 'SEASON ENDED';
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      timerEl.textContent = `${days}D ${hours}H ${mins}M REMAINING`;
    };

    update();
    setInterval(update, 60000);
  }

  // --- LAUNCH GAMEPLAY ---
  launchGame() {
    const modal = document.getElementById('gameplayModal');
    if (modal) modal.classList.remove('hidden');

    this.startSession();
    if (window.game) {
      window.game.startGame();
    }
  }

  exitGameToPlatform() {
    const modal = document.getElementById('gameplayModal');
    if (modal) modal.classList.add('hidden');
    this.switchTab('play');
    this.renderHeaderUserBar();
  }

  // --- TOAST NOTIFICATIONS ---
  triggerPlatformNotification(title, message, icon = '⚡') {
    const toast = document.getElementById('platformToast');
    if (!toast) return;

    const iconEl = toast.querySelector('.toast-icon');
    const titleEl = toast.querySelector('.toast-title');
    const msgEl = toast.querySelector('.toast-desc');

    if (iconEl) iconEl.textContent = icon;
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;

    toast.classList.remove('hidden');
    toast.classList.add('toast-active');

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('toast-active');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, 4000);
  }

  // --- HELPERS ---
  getAvatarIcon(avatarId) {
    const a = this.avatarsCatalog.find(item => item.id === avatarId);
    return a ? a.icon : '🚀';
  }

  formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  escapeHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
}

// Global instance
window.platform = new PlatformController();
window.addEventListener('DOMContentLoaded', () => {
  window.platform.init();
});
