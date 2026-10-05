/**
 * NEON ESCAPE — Production Monetization Architecture
 * 
 * Provides clean, ethical, production-ready hooks for:
 * 1. Rewarded Ads (Extra Revive, Post-Game 1.5x Multiplier, Daily Coin Boost)
 * 2. Ad-Free Lifetime Pass (Remove Ads)
 * 3. Premium / Seasonal Cosmetic Purchases
 * 
 * DESIGN PRINCIPLES:
 * - Zero Pay-to-Win mechanics.
 * - Zero gambling or randomized loot boxes.
 * - Zero fake ads or mock timer countdowns.
 * - Clean event callbacks ensuring rewards are ONLY granted when the ad provider confirms completion.
 * 
 * INTEGRATION GUIDE:
 * To connect a live ad network (e.g., Google AdSense for Games / H5 Games Ads / Unity Ads):
 * 1. Set window.NEON_AD_PROVIDER = yourProviderInstance in index.html.
 * 2. Implement the provider interface: { showRewarded(placement): Promise<{ rewarded: boolean }> }
 */

'use strict';

class MonetizationManager {
  constructor() {
    this.adProvider = null;
    this.isAdFreeUser = false;
    this.activeRewardedPlacement = null;
    this.initialized = false;
  }

  init() {
    try {
      this.isAdFreeUser = localStorage.getItem('neon_escape_ad_free') === 'true';
      if (typeof window !== 'undefined' && window.NEON_AD_PROVIDER) {
        this.adProvider = window.NEON_AD_PROVIDER;
      }
      this.initialized = true;
    } catch (e) {
      console.warn('[Monetization] Init error:', e.message);
    }
  }

  isAdFree() {
    return this.isAdFreeUser;
  }

  setAdFree(status = true) {
    this.isAdFreeUser = Boolean(status);
    try {
      localStorage.setItem('neon_escape_ad_free', this.isAdFreeUser ? 'true' : 'false');
    } catch (e) {}
  }

  canShowRewardedAd() {
    // Only available if an actual ad provider is registered and ready
    return Boolean(this.adProvider && typeof this.adProvider.showRewarded === 'function');
  }

  /**
   * Show a rewarded ad for specific game hooks
   * @param {string} placement - 'revive' | 'post_game_multiplier' | 'daily_coins'
   * @param {function} onReward - Callback when reward is legitimately verified
   * @param {function} onDismiss - Callback when user closes or fails ad
   */
  async showRewardedAd(placement, onReward, onDismiss) {
    if (!this.canShowRewardedAd()) {
      if (window.platform) {
        window.platform.triggerPlatformNotification(
          'Ads Unavailable',
          'No sponsored ad currently available in your region. Enjoy ad-free gameplay!',
          'ℹ️'
        );
      }
      if (typeof onDismiss === 'function') onDismiss();
      return;
    }

    try {
      const result = await this.adProvider.showRewarded(placement);
      if (result && result.rewarded) {
        if (typeof onReward === 'function') onReward();
      } else {
        if (typeof onDismiss === 'function') onDismiss();
      }
    } catch (err) {
      console.warn('[Monetization] Rewarded ad failed:', err.message);
      if (typeof onDismiss === 'function') onDismiss();
    }
  }

  /**
   * Purchase cosmetics with in-game currency or payment provider
   */
  purchaseCosmetic(cosmeticId, costCoins, onSuccess, onFailure) {
    if (!window.platform || !window.platform.currentUser) {
      if (typeof onFailure === 'function') onFailure('User session not found');
      return;
    }

    const u = window.platform.currentUser;
    if (u.coins >= costCoins) {
      u.coins -= costCoins;
      window.platform.saveUserSession();
      window.platform.renderHeaderUserBar();
      if (typeof window.platform.updateAllCoinDisplays === 'function') {
        window.platform.updateAllCoinDisplays();
      }
      if (typeof onSuccess === 'function') onSuccess();
    } else {
      if (typeof onFailure === 'function') onFailure('Insufficient Neon Coins');
    }
  }
}

// Global Singleton
window.monetization = new MonetizationManager();
window.addEventListener('DOMContentLoaded', () => {
  window.monetization.init();
});
