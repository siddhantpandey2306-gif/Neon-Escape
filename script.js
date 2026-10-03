/**
 * NEON ESCAPE — HIGH-PERFORMANCE ARCADE GAME ENGINE
 * Features:
 * 1. Zero-lag game loop with single requestAnimationFrame and proper cleanup
 * 2. Complete Object Pooling for Obstacles, Crystals, Power-ups, and Particles
 * 3. Mobile Performance Quality Director (HIGH, MEDIUM, LOW) with auto-drop
 * 4. Separation of Canvas graphics from DOM (throttled 200ms DOM updates)
 * 5. Fast, snappy player physics & zero-latency pointer touch controls
 * 6. Skill-based Near Miss system with cascading multipliers
 * 7. Combo multiplier system with on-hit "Combo Lost" feedback
 * 8. Streak feedback ("Nice!", "On Fire!", "Unstoppable!", "Elite Run!")
 * 9. Random Gameplay Events (Meteor Storm, Energy Rush, Slow Zone, Double Score)
 * 10. In-run Mini Challenges with bonus XP rewards
 * 11. Personal Best chasing & celebratory beat effects
 * 12. Score milestones (10k, 25k, 50k, 100k, 250k, 500k, 1M)
 * 13. Mobile Haptic feedback (navigator.vibrate)
 * 14. Performance debug toggle (Key 'F')
 */

'use strict';

/* ==========================================================================
   1. QUALITY & PERFORMANCE MANAGER
   ========================================================================== */
class QualityManager {
  constructor() {
    this.isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 768;
    this.level = this.isMobile ? 'MEDIUM' : 'HIGH';
    this.fps = 60;
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();
    this.showDebug = false;

    // Quality parameters
    this.configs = {
      HIGH: { maxParticles: 120, maxFloatingTexts: 18, starCount: 45, useGlowHalos: true, gridAnim: true },
      MEDIUM: { maxParticles: 40, maxFloatingTexts: 10, starCount: 22, useGlowHalos: false, gridAnim: true },
      LOW: { maxParticles: 15, maxFloatingTexts: 6, starCount: 12, useGlowHalos: false, gridAnim: false }
    };
  }

  get config() {
    return this.configs[this.level];
  }

  update(now) {
    this.frameCount++;
    const elapsed = now - this.lastFpsUpdate;
    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed);
      this.frameCount = 0;
      this.lastFpsUpdate = now;

      // Auto-adapt if FPS drops significantly
      if (this.fps < 40 && this.level === 'HIGH') {
        this.level = 'MEDIUM';
        console.log('[NeonEscape Performance] Dropped to MEDIUM quality');
      } else if (this.fps < 28 && this.level === 'MEDIUM') {
        this.level = 'LOW';
        console.log('[NeonEscape Performance] Dropped to LOW quality');
      }
    }
  }

  toggleDebug() {
    this.showDebug = !this.showDebug;
  }
}

/* ==========================================================================
   2. PROCEDURAL WEB AUDIO SYNTHESIZER
   ========================================================================== */
class AudioController {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.bassline = [110.0, 110.0, 130.81, 110.0, 98.0, 98.0, 123.47, 98.0, 87.31, 87.31, 110.0, 87.31, 98.0, 98.0, 130.81, 146.83];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.isMuted) this.stopBgm();
    else { this.init(); this.startBgm(); }
  }

  playCollect(combo = 1) {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const baseFreq = 587.33 * (1 + (combo - 1) * 0.14);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.10);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  playRareCollect() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.20);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  playNearMiss(streak = 1) {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const pitch = 1200 + Math.min(600, streak * 150);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(pitch * 1.8, now + 0.08);
      gain.gain.setValueAtTime(0.20, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.10);
    } catch (e) {}
  }

  playPowerUp() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.type = 'sine'; osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(440, now); osc1.frequency.exponentialRampToValueAtTime(880, now + 0.25);
      osc2.frequency.setValueAtTime(659.25, now); osc2.frequency.exponentialRampToValueAtTime(1318.5, now + 0.25);
      gain.gain.setValueAtTime(0.25, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.30);
      osc1.connect(gain); osc2.connect(gain); gain.connect(this.ctx.destination);
      osc1.start(now); osc2.start(now);
      osc1.stop(now + 0.30); osc2.stop(now + 0.30);
    } catch (e) {}
  }

  playHit() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.28);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.30);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.30);
    } catch (e) {}
  }

  playShieldDeflect() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.25);
      gain.gain.setValueAtTime(0.30, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {}
  }

  playMilestone() {
    if (this.isMuted || !this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + (idx * 0.08);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.20);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.20);
      });
    } catch (e) {}
  }

  playGameOver() {
    if (this.isMuted || !this.ctx) return;
    try {
      const notes = [440, 370, 311.13, 261.63];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + (idx * 0.14);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.20, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch (e) {}
  }

  playAchievement() {
    this.playMilestone();
  }

  startBgm() {
    if (this.isMuted || this.bgmTimer) return;
    this.init();
    if (!this.ctx) return;
    this.bgmStep = 0;
    this.bgmTimer = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const freq = this.bassline[this.bgmStep % this.bassline.length];
        this.bgmStep++;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      } catch (e) {}
    }, 180);
  }

  stopBgm() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

/* ==========================================================================
   3. GENERIC OBJECT POOL
   ========================================================================== */
class ObjectPool {
  constructor(factoryFn, initialSize = 10, maxCapacity = 150) {
    this.factoryFn = factoryFn;
    this.pool = [];
    this.maxCapacity = maxCapacity;
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factoryFn());
    }
  }

  get() {
    return this.pool.length > 0 ? this.pool.pop() : this.factoryFn();
  }

  release(obj) {
    if (this.pool.length < this.maxCapacity) {
      this.pool.push(obj);
    }
  }
}

/* ==========================================================================
   4. OPTIMIZED PARTICLES & FLOATING TEXTS (OBJECT POOLED)
   ========================================================================== */
class Particle {
  constructor() {
    this.init(0, 0, 0, 0, '#ffffff', 2, 0.5, 1, 'circle', 0.95);
  }

  init(x, y, vx, vy, color, size, life, alpha = 1, shape = 'circle', decay = 0.95) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
    this.alpha = alpha;
    this.shape = shape;
    this.decay = decay;
    this.isDead = false;
  }

  update(dt) {
    this.life -= dt;
    if (this.life <= 0) {
      this.isDead = true;
      return false;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= this.decay;
    this.vy *= this.decay;
    this.alpha = Math.max(0, this.life / this.maxLife);
    return true;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    if (this.shape === 'spark') {
      ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
    } else if (this.shape === 'ring') {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * (2 - this.alpha), 0, Math.PI * 2);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

class FloatingText {
  constructor() {
    this.init('', 0, 0, '#ffffff', 18);
  }

  init(text, x, y, color = '#ffffff', size = 18) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
    this.life = 0.85;
    this.maxLife = 0.85;
    this.vy = -55;
    this.alpha = 1;
    this.isDead = false;
  }

  update(dt) {
    this.life -= dt;
    if (this.life <= 0) {
      this.isDead = true;
      return false;
    }
    this.y += this.vy * dt;
    this.alpha = Math.max(0, this.life / this.maxLife);
    return true;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.font = `bold ${this.size}px 'Inter', sans-serif`;
    ctx.fillStyle = this.color;
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

class ParticleManager {
  constructor(qualityManager) {
    this.qm = qualityManager;
    this.particles = [];
    this.floatingTexts = [];

    // Object Pools to eliminate garbage collection
    this.particlePool = new ObjectPool(() => new Particle(), 50, 150);
    this.textPool = new ObjectPool(() => new FloatingText(), 15, 40);
  }

  spawnExplosion(x, y, count = 20, baseColor = '#DC2626') {
    const maxAllowed = this.qm.config.maxParticles;
    const actualCount = Math.min(count, maxAllowed - this.particles.length);
    if (actualCount <= 0) return;

    for (let i = 0; i < actualCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 200;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = 2 + Math.random() * 3.5;
      const life = 0.35 + Math.random() * 0.4;
      const color = Math.random() > 0.3 ? baseColor : '#ffffff';
      const shape = Math.random() > 0.5 ? 'spark' : 'circle';
      const p = this.particlePool.get();
      p.init(x, y, vx, vy, color, size, life, 1, shape);
      this.particles.push(p);
    }
  }

  spawnNearMissSparks(x, y) {
    const maxAllowed = this.qm.config.maxParticles;
    const count = this.qm.level === 'LOW' ? 4 : 8;
    if (this.particles.length + count > maxAllowed) return;

    for (let i = 0; i < count; i++) {
      const angle = (Math.random() - 0.5) * Math.PI;
      const speed = 80 + Math.random() * 110;
      const vx = Math.sin(angle) * speed;
      const vy = Math.cos(angle) * speed * 0.5;
      const p = this.particlePool.get();
      p.init(x, y, vx, vy, '#2563EB', 2.5, 0.3, 1, 'spark');
      this.particles.push(p);
    }
  }

  spawnCrystalSparkles(x, y, isRare = false) {
    const maxAllowed = this.qm.config.maxParticles;
    const count = isRare ? (this.qm.level === 'HIGH' ? 16 : 8) : (this.qm.level === 'HIGH' ? 10 : 5);
    if (this.particles.length + count > maxAllowed) return;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 140;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = 2 + Math.random() * 3;
      const life = 0.3 + Math.random() * 0.35;
      const color = isRare ? (Math.random() > 0.4 ? '#F59E0B' : '#ffffff') : (Math.random() > 0.3 ? '#38BDF8' : '#ffffff');
      const p = this.particlePool.get();
      p.init(x, y, vx, vy, color, size, life, 1, 'circle');
      this.particles.push(p);
    }
  }

  spawnCustomThruster(x, y, vxOffset = 0, trailType = 'plasma') {
    if (this.particles.length >= this.qm.config.maxParticles) return;
    const vx = vxOffset + (Math.random() - 0.5) * 16;
    const vy = 110 + Math.random() * 70;
    const size = 2 + Math.random() * 2.5;
    const life = 0.18 + Math.random() * 0.12;

    let color = '#38BDF8';
    if (trailType === 'fire') color = Math.random() > 0.5 ? '#F97316' : '#EF4444';
    else if (trailType === 'ice') color = Math.random() > 0.5 ? '#7DD3FC' : '#E0F2FE';
    else if (trailType === 'cosmic') color = Math.random() > 0.5 ? '#A855F7' : '#EC4899';
    else if (trailType === 'rainbow') color = `hsl(${(Date.now() * 0.4) % 360}, 100%, 65%)`;

    const p = this.particlePool.get();
    p.init(x, y, vx, vy, color, size, life, 1, 'circle', 0.88);
    this.particles.push(p);
  }

  addText(text, x, y, color = '#2563EB', size = 18) {
    if (this.floatingTexts.length >= this.qm.config.maxFloatingTexts) {
      const oldest = this.floatingTexts.shift();
      this.textPool.release(oldest);
    }
    const t = this.textPool.get();
    t.init(text, x, y, color, size);
    this.floatingTexts.push(t);
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p.update(dt)) {
        this.particlePool.release(p);
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      if (!t.update(dt)) {
        this.textPool.release(t);
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].draw(ctx);
    }
    for (let i = 0; i < this.floatingTexts.length; i++) {
      this.floatingTexts[i].draw(ctx);
    }
  }

  clear() {
    while (this.particles.length > 0) {
      this.particlePool.release(this.particles.pop());
    }
    while (this.floatingTexts.length > 0) {
      this.textPool.release(this.floatingTexts.pop());
    }
  }
}

/* ==========================================================================
   5. ZERO-LATENCY POINTER & TOUCH INPUT HANDLER
   ========================================================================== */
class InputHandler {
  constructor(canvas) {
    this.canvas = canvas;
    this.left = false;
    this.right = false;
    this.touchActive = false;
    this.touchTargetX = null;
    this.onPauseRequested = null;
    this.initListeners();
  }

  initListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.code === 'KeyA') this.left = true;
      if (e.key === 'ArrowRight' || e.code === 'KeyD') this.right = true;
      if (e.key === 'Escape' || e.code === 'KeyP') {
        if (this.onPauseRequested) this.onPauseRequested();
      }
      if (e.code === 'KeyF') {
        if (window.game && window.game.qm) window.game.qm.toggleDebug();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.code === 'KeyA') this.left = false;
      if (e.key === 'ArrowRight' || e.code === 'KeyD') this.right = false;
    });

    const leftBtn = document.getElementById('mobileLeftBtn');
    const rightBtn = document.getElementById('mobileRightBtn');

    // Pointer-events bind for zero-latency mobile touch
    const bindPointer = (btn, isLeft) => {
      if (!btn) return;
      btn.style.touchAction = 'none';

      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        try { btn.setPointerCapture(e.pointerId); } catch (err) {}
        btn.classList.add('active');
        if (isLeft) this.left = true; else this.right = true;
        if (navigator.vibrate) navigator.vibrate(10);
      });

      const release = (e) => {
        e.preventDefault();
        try { btn.releasePointerCapture(e.pointerId); } catch (err) {}
        btn.classList.remove('active');
        if (isLeft) this.left = false; else this.right = false;
      };

      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('pointerleave', release);
    };

    bindPointer(leftBtn, true);
    bindPointer(rightBtn, false);

    // Canvas Direct Touch / Pointer Drag
    const getCanvasX = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      return (e.clientX - rect.left) * scaleX;
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.touchActive = true;
      this.touchTargetX = getCanvasX(e);
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (this.touchActive) {
        e.preventDefault();
        this.touchTargetX = getCanvasX(e);
      }
    });

    const endCanvas = () => {
      this.touchActive = false;
      this.touchTargetX = null;
    };

    this.canvas.addEventListener('pointerup', endCanvas);
    this.canvas.addEventListener('pointercancel', endCanvas);
  }

  reset() {
    this.left = false;
    this.right = false;
    this.touchActive = false;
    this.touchTargetX = null;
    document.querySelectorAll('.touch-control-btn').forEach(b => b.classList.remove('active'));
  }
}

/* ==========================================================================
   6. PLAYER ENTITY (RESPONSIVE INERTIA & PURE CANVAS RENDERING)
   ========================================================================== */
class Player {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.width = 50;
    this.height = 46;
    this.radius = 23;
    this.x = canvasWidth / 2;
    this.y = canvasHeight - 120;
    this.vx = 0;
    this.speed = 520; // Crisp, responsive speed
    this.tilt = 0;
    this.bobTime = 0;
    this.bobOffsetY = 0;
    this.lives = 3;
    this.hasShield = false;
    this.invulnerableTimer = 0;
    this.blinkTimer = 0;
  }

  reset() {
    this.x = this.canvasWidth / 2;
    this.y = this.canvasHeight - 120;
    this.vx = 0;
    this.lives = 3;
    this.hasShield = false;
    this.invulnerableTimer = 0;
    this.tilt = 0;
    this.bobTime = 0;
    this.bobOffsetY = 0;
  }

  update(dt, input, particleManager) {
    let moveDir = 0;
    if (input.left) moveDir -= 1;
    if (input.right) moveDir += 1;

    if (moveDir === 0 && input.touchActive && input.touchTargetX !== null) {
      const diff = input.touchTargetX - this.x;
      if (Math.abs(diff) > 4) {
        moveDir = Math.sign(diff) * Math.min(1.0, Math.abs(diff) / 22);
      }
    }

    // Snappy, immediate acceleration (22 factor vs sluggish 14)
    const targetVx = moveDir * this.speed;
    this.vx += (targetVx - this.vx) * 22 * dt;
    this.x += this.vx * dt;

    // Boundary constraints
    const halfW = this.width / 2;
    if (this.x < halfW + 10) { this.x = halfW + 10; this.vx = 0; }
    if (this.x > this.canvasWidth - halfW - 10) { this.x = this.canvasWidth - halfW - 10; this.vx = 0; }

    // Banking tilt
    const targetTilt = Math.max(-1, Math.min(1, this.vx / this.speed)) * 0.26;
    this.tilt += (targetTilt - this.tilt) * 18 * dt;

    // Bobbing
    this.bobTime += dt * 4;
    this.bobOffsetY = Math.sin(this.bobTime) * 3;

    // Thruster engine particles
    if (Math.random() < 0.75) {
      const trail = (window.platform && window.platform.currentUser) ? window.platform.currentUser.equippedTrail : 'plasma';
      particleManager.spawnCustomThruster(this.x + (Math.random() - 0.5) * 8, this.y + this.height / 2 + this.bobOffsetY, -moveDir * 18, trail);
    }

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
      this.blinkTimer += dt * 20;
    }
  }

  draw(ctx) {
    if (this.invulnerableTimer > 0 && Math.sin(this.blinkTimer) > 0) return;

    ctx.save();
    ctx.translate(this.x, this.y + this.bobOffsetY);
    ctx.rotate(this.tilt);

    const shipSkin = (window.platform && window.platform.currentUser) ? window.platform.currentUser.equippedShip : 'phantom';
    let primaryColor = '#2563EB';
    let secondaryColor = '#1D4ED8';

    if (shipSkin === 'nova') { primaryColor = '#F59E0B'; secondaryColor = '#D97706'; }
    else if (shipSkin === 'spectre') { primaryColor = '#8B5CF6'; secondaryColor = '#6D28D9'; }
    else if (shipSkin === 'eclipse') { primaryColor = '#EC4899'; secondaryColor = '#BE185D'; }
    else if (shipSkin === 'hyperion') { primaryColor = '#10B981'; secondaryColor = '#059669'; }

    // Shield Outer Bubble
    if (this.hasShield) {
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 14, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(37, 99, 235, 0.15)';
      ctx.fill();
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Ship Fuselage
    ctx.beginPath();
    ctx.moveTo(0, -this.height / 2);
    ctx.lineTo(this.width / 2, this.height / 2 - 3);
    ctx.lineTo(this.width / 3, this.height / 2);
    ctx.lineTo(6, this.height / 2 - 5);
    ctx.lineTo(0, this.height / 2 - 2);
    ctx.lineTo(-6, this.height / 2 - 5);
    ctx.lineTo(-this.width / 3, this.height / 2);
    ctx.lineTo(-this.width / 2, this.height / 2 - 3);
    ctx.closePath();

    ctx.fillStyle = primaryColor;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner cockpit glass
    ctx.beginPath();
    ctx.ellipse(0, -5, 5, 11, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  }
}

/* ==========================================================================
   7. FALLING ENTITIES & OBJECT POOLS
   ========================================================================== */
class FallingObject {
  constructor(type) {
    this.type = type;
    this.isDead = false;
    this.nearMissChecked = false;
  }

  reset(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.isDead = false;
    this.nearMissChecked = false;
    this.rotation = Math.random() * Math.PI * 2;
  }

  update(dt, speedMultiplier) {
    this.y += this.speed * speedMultiplier * dt;
    this.rotation += (this.rotSpeed || 0) * dt;
  }
}

class MeteorObstacle extends FallingObject {
  constructor() {
    super('meteor');
    this.radius = 22;
    this.rotSpeed = 1.5;
  }

  reset(x, y, speed) {
    super.reset(x, y, speed);
    this.rotSpeed = (Math.random() - 0.5) * 3;
    this.radius = 18 + Math.random() * 8;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    const sides = 7;
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      const r = i % 2 === 0 ? this.radius : this.radius * 0.8;
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = '#EA580C';
    ctx.fill();
    ctx.strokeStyle = '#FED7AA';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}

class BarrierObstacle extends FallingObject {
  constructor() {
    super('barrier');
    this.width = 110;
    this.height = 16;
    this.radius = 55;
  }

  reset(x, y, speed) {
    super.reset(x, y, speed);
    this.pulse = 0;
  }

  update(dt, speedMultiplier) {
    super.update(dt, speedMultiplier);
    this.pulse = (this.pulse || 0) + dt * 6;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    const alpha = 0.8 + Math.sin(this.pulse) * 0.2;
    ctx.fillStyle = `rgba(220, 38, 38, ${alpha})`;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.strokeStyle = '#FEE2E2';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
    // End pods
    ctx.fillStyle = '#7F1D1D';
    ctx.beginPath();
    ctx.arc(-this.width / 2, 0, 7, 0, Math.PI * 2);
    ctx.arc(this.width / 2, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class DroneObstacle extends FallingObject {
  constructor() {
    super('drone');
    this.radius = 20;
    this.sineTime = 0;
  }

  reset(x, y, speed) {
    super.reset(x, y, speed);
    this.startX = x;
    this.sineTime = Math.random() * Math.PI * 2;
  }

  update(dt, speedMultiplier) {
    super.update(dt, speedMultiplier);
    this.sineTime += dt * 4;
    this.x = this.startX + Math.sin(this.sineTime) * 45;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = '#7C3AED';
    ctx.beginPath();
    ctx.moveTo(0, 16); ctx.lineTo(18, -14); ctx.lineTo(-18, -14);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#DDD6FE';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Center glowing sensor
    ctx.beginPath();
    ctx.arc(0, -2, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#EF4444';
    ctx.fill();
    ctx.restore();
  }
}

class PlasmaBallObstacle extends FallingObject {
  constructor() {
    super('plasmaball');
    this.radius = 15;
  }

  reset(x, y, speed) {
    super.reset(x, y, speed);
    this.pulse = 0;
  }

  update(dt, speedMultiplier) {
    super.update(dt, speedMultiplier);
    this.pulse = (this.pulse || 0) + dt * 8;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#06B6D4';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}

class EnergyCrystal extends FallingObject {
  constructor() {
    super('crystal');
    this.radius = 16;
    this.rotSpeed = 3;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.moveTo(0, -this.radius);
    ctx.lineTo(this.radius * 0.7, 0);
    ctx.lineTo(0, this.radius);
    ctx.lineTo(-this.radius * 0.7, 0);
    ctx.closePath();
    ctx.fillStyle = '#38BDF8';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}

class RareCrystal extends FallingObject {
  constructor() {
    super('rarecrystal');
    this.radius = 18;
    this.rotSpeed = 3.5;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.moveTo(0, -this.radius);
    ctx.lineTo(this.radius * 0.75, 0);
    ctx.lineTo(0, this.radius);
    ctx.lineTo(-this.radius * 0.75, 0);
    ctx.closePath();
    ctx.fillStyle = '#F59E0B';
    ctx.fill();
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}

class PowerUpItem extends FallingObject {
  constructor() {
    super('powerup');
    this.radius = 20;
    this.subType = 'shield';
  }

  reset(x, y, speed, subType = 'shield') {
    super.reset(x, y, speed);
    this.subType = subType;
    this.pulse = 0;
    switch (subType) {
      case 'shield': this.color = '#2563EB'; this.symbol = '🛡️'; break;
      case 'slowmo': this.color = '#8B5CF6'; this.symbol = '⏳'; break;
      case 'double': this.color = '#F59E0B'; this.symbol = '2X'; break;
      case 'magnet': this.color = '#10B981'; this.symbol = '🧲'; break;
    }
  }

  update(dt, speedMultiplier) {
    super.update(dt, speedMultiplier);
    this.pulse = (this.pulse || 0) + dt * 5;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.symbol, 0, 1);
    ctx.restore();
  }
}

/* ==========================================================================
   8. BACKGROUND RENDERER (PERFORMANCE TUNED)
   ========================================================================== */
class BackgroundRenderer {
  constructor(width, height, qualityManager) {
    this.width = width;
    this.height = height;
    this.qm = qualityManager;
    this.stars = [];
    this.gridOffset = 0;
    this.initStars();
  }

  initStars() {
    this.stars = [];
    const count = this.qm.config.starCount;
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 1 + Math.random() * 2,
        speed: 30 + Math.random() * 70,
        alpha: 0.3 + Math.random() * 0.7
      });
    }
  }

  update(dt, speedMultiplier) {
    for (let star of this.stars) {
      star.y += star.speed * (speedMultiplier * 0.5 + 0.5) * dt;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
    }
    if (this.qm.config.gridAnim) {
      this.gridOffset = (this.gridOffset + 70 * speedMultiplier * dt) % 40;
    }
  }

  draw(ctx) {
    // Solid gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, '#0a0e1a');
    bgGrad.addColorStop(0.6, '#0f172a');
    bgGrad.addColorStop(1, '#111827');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle space grid
    if (this.qm.config.gridAnim) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;

      for (let i = 0; i <= 8; i++) {
        const x = (i / 8) * this.width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.height);
        ctx.stroke();
      }

      const startY = this.height * 0.35;
      for (let y = startY + this.gridOffset; y < this.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.width, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Stars
    for (let star of this.stars) {
      ctx.save();
      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(star.x, star.y, star.size, star.size);
      ctx.restore();
    }
  }
}

/* ==========================================================================
   9. WAVE DIRECTOR WITH POOLING & SPECIAL EVENTS
   ========================================================================== */
class WaveDirector {
  constructor(canvasWidth, pools) {
    this.canvasWidth = canvasWidth;
    this.pools = pools;
    this.waveTimer = 0.5;
    this.waveIndex = 0;
    this.specialEvent = null; // null | 'meteor_storm' | 'energy_rush' | 'slow_zone' | 'double_score'
    this.eventTimer = 0;
    this.nextEventCheck = 35.0; // Trigger special event every 35s
  }

  reset() {
    this.waveTimer = 0.5;
    this.waveIndex = 0;
    this.specialEvent = null;
    this.eventTimer = 0;
    this.nextEventCheck = 35.0;
  }

  update(dt, game) {
    this.waveTimer -= dt;
    this.nextEventCheck -= dt;

    // Handle Random Timed Events
    if (this.nextEventCheck <= 0 && !this.specialEvent) {
      this.triggerRandomEvent(game);
      this.nextEventCheck = 45.0 + Math.random() * 20.0;
    }

    if (this.specialEvent) {
      this.eventTimer -= dt;
      if (this.eventTimer <= 0) {
        this.specialEvent = null;
        game.activeEventName = null;
      }
    }

    if (this.waveTimer <= 0) {
      this.spawnNextWavePattern(game);
      const isSlowMo = game.slowMoTimer > 0 || this.specialEvent === 'slow_zone';
      const baseInterval = isSlowMo ? 1.6 : Math.max(0.68, 1.25 - (game.survivalSeconds * 0.002));
      this.waveTimer = baseInterval;
    }
  }

  triggerRandomEvent(game) {
    const events = ['energy_rush', 'meteor_storm', 'slow_zone', 'double_score'];
    const chosen = events[Math.floor(Math.random() * events.length)];
    this.specialEvent = chosen;
    this.eventTimer = 8.0;

    let bannerText = 'SPECIAL EVENT!';
    if (chosen === 'energy_rush') { bannerText = '💎 ENERGY RUSH (8s)'; }
    else if (chosen === 'meteor_storm') { bannerText = '☄️ METEOR STORM (8s)'; }
    else if (chosen === 'slow_zone') { bannerText = '⏳ SLOW ZONE (8s)'; }
    else if (chosen === 'double_score') { bannerText = '⚡ 2X DOUBLE SCORE (8s)'; game.doubleScoreTimer = 8.0; }

    game.activeEventName = bannerText;
    game.audio.playMilestone();
  }

  spawnNextWavePattern(game) {
    const w = this.canvasWidth;
    const baseSpeed = 190 + Math.min(220, game.survivalSeconds * 1.4);

    // If Energy Rush event active: spawn clusters of crystals
    if (this.specialEvent === 'energy_rush') {
      for (let i = 0; i < 3; i++) {
        const cx = 50 + Math.random() * (w - 100);
        const crystal = this.pools.crystal.get();
        crystal.reset(cx, -40 - i * 40, baseSpeed * 0.9);
        game.fallingObjects.push(crystal);
      }
      return;
    }

    // If Meteor Storm active
    if (this.specialEvent === 'meteor_storm') {
      const safeX = 80 + Math.random() * (w - 160);
      const m1 = this.pools.meteor.get();
      m1.reset(Math.max(40, safeX - 120), -40, baseSpeed * 1.1);
      game.fallingObjects.push(m1);
      const m2 = this.pools.meteor.get();
      m2.reset(Math.min(w - 40, safeX + 120), -40, baseSpeed * 1.1);
      game.fallingObjects.push(m2);
      return;
    }

    this.waveIndex = (this.waveIndex + 1) % 6;

    switch (this.waveIndex) {
      case 0: // Single Meteor + Crystal
        {
          const meteorX = 60 + Math.random() * (w - 120);
          const crystalX = meteorX > w / 2 ? meteorX - 90 : meteorX + 90;
          const meteor = this.pools.meteor.get();
          meteor.reset(meteorX, -40, baseSpeed);
          game.fallingObjects.push(meteor);

          const crystal = this.pools.crystal.get();
          crystal.reset(crystalX, -40, baseSpeed * 0.95);
          game.fallingObjects.push(crystal);
        }
        break;

      case 1: // Energy Barrier + Reward Lane
        {
          const barrierX = w / 2;
          const barrier = this.pools.barrier.get();
          barrier.reset(barrierX, -40, baseSpeed * 0.9);
          game.fallingObjects.push(barrier);

          const rewardX = Math.random() > 0.5 ? 45 : w - 45;
          if (Math.random() < 0.4) {
            const types = ['shield', 'slowmo', 'double', 'magnet'];
            const pType = types[Math.floor(Math.random() * types.length)];
            const power = this.pools.powerup.get();
            power.reset(rewardX, -50, baseSpeed * 0.85, pType);
            game.fallingObjects.push(power);
          } else {
            const rare = this.pools.rarecrystal.get();
            rare.reset(rewardX, -50, baseSpeed);
            game.fallingObjects.push(rare);
          }
        }
        break;

      case 2: // Crystal Cascade (Combo Builder)
        {
          const startX = 80 + Math.random() * (w - 160);
          for (let i = 0; i < 3; i++) {
            const cx = Math.max(45, Math.min(w - 45, startX + (i % 2 === 0 ? 30 : -30)));
            const crystal = this.pools.crystal.get();
            crystal.reset(cx, -40 - (i * 60), baseSpeed * 0.95);
            game.fallingObjects.push(crystal);
          }
          const m = this.pools.meteor.get();
          m.reset(startX > w / 2 ? 60 : w - 60, -80, baseSpeed * 1.05);
          game.fallingObjects.push(m);
        }
        break;

      case 3: // Hunter Drone with Flanking Crystals
        {
          const droneX = 100 + Math.random() * (w - 200);
          const drone = this.pools.drone.get();
          drone.reset(droneX, -40, baseSpeed * 1.1);
          game.fallingObjects.push(drone);

          const c1 = this.pools.crystal.get();
          c1.reset(Math.max(40, droneX - 60), -50, baseSpeed);
          game.fallingObjects.push(c1);
        }
        break;

      case 4: // Fast Plasma Ball in later phases
        {
          if (game.currentPhase >= 3) {
            const px = 60 + Math.random() * (w - 120);
            const plasma = this.pools.plasma.get();
            plasma.reset(px, -40, baseSpeed * 1.25);
            game.fallingObjects.push(plasma);
          }
          const rare = this.pools.rarecrystal.get();
          rare.reset(w / 2, -50, baseSpeed * 0.9);
          game.fallingObjects.push(rare);
        }
        break;

      case 5: // Double Meteor Pinch
        {
          const m1 = this.pools.meteor.get();
          m1.reset(70, -40, baseSpeed * 1.05);
          game.fallingObjects.push(m1);

          const m2 = this.pools.meteor.get();
          m2.reset(w - 70, -40, baseSpeed * 1.05);
          game.fallingObjects.push(m2);

          const types = ['shield', 'magnet', 'double'];
          const chosen = types[Math.floor(Math.random() * types.length)];
          const power = this.pools.powerup.get();
          power.reset(w / 2, -60, baseSpeed * 0.9, chosen);
          game.fallingObjects.push(power);
        }
        break;
    }
  }
}

/* ==========================================================================
   10. MASTER GAME CONTROLLER
   ========================================================================== */
const GameState = {
  START: 'START',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER'
};

class NeonEscapeGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d', { alpha: false }); // High performance non-alpha canvas
    this.qm = new QualityManager();

    this.state = GameState.START;
    this.lastTime = 0;
    this.rafId = null;

    // Run telemetry
    this.score = 0;
    this.highScore = 0;
    this.crystalsCollected = 0;
    this.obstaclesDodged = 0;
    this.powerupsCollected = 0;
    this.survivalSeconds = 0;
    this.survivalTimerAcc = 0;
    this.currentPhase = 1;

    // Combo & Near Miss Systems
    this.combo = 1;
    this.comboTimer = 0;
    this.maxCombo = 1;
    this.nearMissesCount = 0;
    this.nearMissStreak = 0;
    this.collectionStreak = 0;

    // Power-up timers
    this.slowMoTimer = 0;
    this.doubleScoreTimer = 0;
    this.magnetTimer = 0;
    this.screenShake = 0;

    // Active announcements & event banners
    this.activeEventName = null;
    this.activeMiniChallenge = null;
    this.miniChallengeTimer = 0;
    this.chasingRecordAnnounced = false;

    // DOM update throttler (prevents updating DOM 60 times/sec)
    this.lastDomUpdate = 0;
    this.domThrottleMs = 200; // 5 times/sec max

    // Pools for all entities
    this.pools = {
      meteor: new ObjectPool(() => new MeteorObstacle(), 8, 20),
      barrier: new ObjectPool(() => new BarrierObstacle(), 4, 10),
      drone: new ObjectPool(() => new DroneObstacle(), 4, 10),
      plasma: new ObjectPool(() => new PlasmaBallObstacle(), 4, 10),
      crystal: new ObjectPool(() => new EnergyCrystal(), 12, 30),
      rarecrystal: new ObjectPool(() => new RareCrystal(), 4, 10),
      powerup: new ObjectPool(() => new PowerUpItem(), 4, 10)
    };

    // Subsystems
    this.audio = new AudioController();
    this.particles = new ParticleManager(this.qm);
    this.input = new InputHandler(this.canvas);
    this.background = new BackgroundRenderer(this.canvas.width, this.canvas.height, this.qm);
    this.waveDirector = new WaveDirector(this.canvas.width, this.pools);
    this.player = new Player(this.canvas.width, this.canvas.height);
    this.fallingObjects = [];

    this.input.onPauseRequested = () => this.togglePause();

    // Cache DOM Elements
    this.dom = {
      gameplayModal: document.getElementById('gameplayModal'),
      playingHud: document.getElementById('playingHud'),
      pauseScreen: document.getElementById('pauseScreen'),
      gameOverScreen: document.getElementById('gameOverScreen'),
      currentScoreDisplay: document.getElementById('currentScoreDisplay'),
      highScoreHudDisplay: document.getElementById('highScoreHudDisplay'),
      gameplayAvatar: document.getElementById('gameplayAvatar'),
      gameplayPlayerName: document.getElementById('gameplayPlayerName'),
      gameplayPlayerLevel: document.getElementById('gameplayPlayerLevel'),
      hearts: [document.getElementById('heart1'), document.getElementById('heart2'), document.getElementById('heart3')],
      comboBadge: document.getElementById('comboBadge'),
      comboMultiplierText: document.getElementById('comboMultiplierText'),
      shieldBadge: document.getElementById('shieldBadge'),
      slowmoBadge: document.getElementById('slowmoBadge'),
      doubleBadge: document.getElementById('doubleBadge'),
      magnetBadge: document.getElementById('magnetBadge'),
      finalScoreVal: document.getElementById('finalScoreVal'),
      finalHighScoreVal: document.getElementById('finalHighScoreVal'),
      finalTimeVal: document.getElementById('finalTimeVal'),
      finalCrystalsVal: document.getElementById('finalCrystalsVal'),
      finalDodgesVal: document.getElementById('finalDodgesVal'),
      finalNearMissesVal: document.getElementById('finalNearMissesVal'),
      finalXpEarnedVal: document.getElementById('finalXpEarnedVal'),
      finalCoinsEarnedVal: document.getElementById('finalCoinsEarnedVal'),
      newBestBadge: document.getElementById('newBestBadge'),
      newGlobalRankBadge: document.getElementById('newGlobalRankBadge'),
      finalGlobalRankVal: document.getElementById('finalGlobalRankVal'),
      finalBestComboVal: document.getElementById('finalBestComboVal'),
      goLevelTitle: document.getElementById('goLevelTitle'),
      goLevelXp: document.getElementById('goLevelXp'),
      goLevelFill: document.getElementById('goLevelFill'),
      goOfflineNotice: document.getElementById('goOfflineNotice'),
      soundToggleBtn: document.getElementById('inGameSoundToggleBtn'),
      pauseToggleBtn: document.getElementById('pauseToggleBtn'),
      resumeBtn: document.getElementById('resumeBtn'),
      restartFromPauseBtn: document.getElementById('restartFromPauseBtn'),
      playAgainBtn: document.getElementById('playAgainBtn')
    };

    this.bindEvents();
    this.initAudioPreference();
  }

  initAudioPreference() {
    try {
      const stored = localStorage.getItem('neon_sound_preference');
      this.audio.isMuted = stored === 'false';
    } catch (e) {}
  }

  toggleSound() {
    this.audio.init();
    this.audio.setMuted(!this.audio.isMuted);
    try { localStorage.setItem('neon_sound_preference', String(!this.audio.isMuted)); } catch (e) {}
  }

  bindEvents() {
    if (this.dom.soundToggleBtn) this.dom.soundToggleBtn.addEventListener('click', () => this.toggleSound());
    if (this.dom.pauseToggleBtn) this.dom.pauseToggleBtn.addEventListener('click', () => this.togglePause());
    if (this.dom.resumeBtn) this.dom.resumeBtn.addEventListener('click', () => this.resumeGame());
    if (this.dom.restartFromPauseBtn) this.dom.restartFromPauseBtn.addEventListener('click', () => this.startGame());
    if (this.dom.playAgainBtn) this.dom.playAgainBtn.addEventListener('click', () => this.startGame());
  }

  // --- GAME LIFECYCLE ---
  startGame() {
    // Cancel any existing loop to prevent duplicates
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.audio.init();
    this.audio.startBgm();

    // Reset scores & statistics
    this.score = 0;
    this.crystalsCollected = 0;
    this.obstaclesDodged = 0;
    this.powerupsCollected = 0;
    this.survivalSeconds = 0;
    this.survivalTimerAcc = 0;
    this.currentPhase = 1;

    // Reset combo & near misses
    this.combo = 1;
    this.comboTimer = 0;
    this.maxCombo = 1;
    this.nearMissesCount = 0;
    this.nearMissStreak = 0;
    this.collectionStreak = 0;

    // Timers
    this.slowMoTimer = 0;
    this.doubleScoreTimer = 0;
    this.magnetTimer = 0;
    this.screenShake = 0;
    this.activeEventName = null;
    this.activeMiniChallenge = null;
    this.miniChallengeTimer = 0;
    this.chasingRecordAnnounced = false;

    // Release all active falling objects back to pools
    while (this.fallingObjects.length > 0) {
      const obj = this.fallingObjects.pop();
      if (this.pools[obj.type]) this.pools[obj.type].release(obj);
    }

    this.particles.clear();
    this.player.reset();
    this.input.reset();
    this.waveDirector.reset();

    // Setup player identity from platform
    if (window.platform && window.platform.currentUser) {
      const u = window.platform.currentUser;
      if (this.dom.gameplayAvatar) this.dom.gameplayAvatar.textContent = window.platform.getAvatarIcon(u.avatar);
      if (this.dom.gameplayPlayerName) this.dom.gameplayPlayerName.textContent = u.displayName || u.username;
      if (this.dom.gameplayPlayerLevel) this.dom.gameplayPlayerLevel.textContent = `LVL ${u.level}`;
      this.highScore = u.stats.bestScore || 0;
    }

    this.updateLivesDisplay();
    this.updateHudDom(true);

    if (this.dom.pauseScreen) this.dom.pauseScreen.classList.add('hidden');
    if (this.dom.gameOverScreen) this.dom.gameOverScreen.classList.add('hidden');
    if (this.dom.playingHud) this.dom.playingHud.classList.remove('hidden');

    this.state = GameState.PLAYING;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }

  togglePause() {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
      if (this.dom.pauseScreen) this.dom.pauseScreen.classList.remove('hidden');
      this.audio.stopBgm();
    } else if (this.state === GameState.PAUSED) {
      this.resumeGame();
    }
  }

  resumeGame() {
    if (this.state === GameState.PAUSED) {
      if (this.dom.pauseScreen) this.dom.pauseScreen.classList.add('hidden');
      this.state = GameState.PLAYING;
      this.lastTime = performance.now();
      this.audio.startBgm();
      this.rafId = requestAnimationFrame((t) => this.loop(t));
    }
  }

  addScore(points, isCollectible = false, labelX = null, labelY = null) {
    const isDouble = this.doubleScoreTimer > 0;
    const finalPoints = isDouble ? points * 2 : points;
    this.score += finalPoints;

    // Personal Best Chasing Feedback
    if (this.highScore > 0 && !this.chasingRecordAnnounced && this.score >= this.highScore * 0.9 && this.score < this.highScore) {
      this.chasingRecordAnnounced = true;
      this.particles.addText('CHASING RECORD!', this.player.x, this.player.y - 45, '#F59E0B', 18);
    } else if (this.highScore > 0 && this.score > this.highScore && this.score - finalPoints <= this.highScore) {
      this.audio.playMilestone();
      this.particles.addText('★ NEW PERSONAL BEST! ★', this.player.x, this.player.y - 50, '#10B981', 20);
      if (navigator.vibrate) navigator.vibrate([20, 20, 20]);
    }

    if (this.score > this.highScore) {
      this.highScore = this.score;
    }

    if (isCollectible && labelX !== null && labelY !== null) {
      const tag = isDouble ? `+${finalPoints} (2X)` : `+${finalPoints}`;
      const color = isDouble ? '#F59E0B' : (points >= 50 ? '#F59E0B' : '#38BDF8');
      this.particles.addText(tag, labelX, labelY, color, 16);
    }
  }

  updateLivesDisplay() {
    for (let i = 0; i < 3; i++) {
      const heart = this.dom.hearts[i];
      if (heart) {
        if (i < this.player.lives) {
          heart.style.opacity = '1';
        } else {
          heart.style.opacity = '0.2';
        }
      }
    }
  }

  // Throttled DOM updates (only 5x/sec max to prevent frame drops)
  updateHudDom(force = false) {
    const now = performance.now();
    if (!force && (now - this.lastDomUpdate < this.domThrottleMs)) return;
    this.lastDomUpdate = now;

    if (this.dom.currentScoreDisplay) this.dom.currentScoreDisplay.textContent = this.score.toLocaleString();
    if (this.dom.highScoreHudDisplay) this.dom.highScoreHudDisplay.textContent = this.highScore.toLocaleString();

    // Power-up status badges
    if (this.dom.shieldBadge) {
      if (this.player.hasShield) this.dom.shieldBadge.classList.remove('hidden');
      else this.dom.shieldBadge.classList.add('hidden');
    }
    if (this.dom.slowmoBadge) {
      if (this.slowMoTimer > 0) this.dom.slowmoBadge.classList.remove('hidden');
      else this.dom.slowmoBadge.classList.add('hidden');
    }
    if (this.dom.doubleBadge) {
      if (this.doubleScoreTimer > 0) this.dom.doubleBadge.classList.remove('hidden');
      else this.dom.doubleBadge.classList.add('hidden');
    }
    if (this.dom.magnetBadge) {
      if (this.magnetTimer > 0) this.dom.magnetBadge.classList.remove('hidden');
      else this.dom.magnetBadge.classList.add('hidden');
    }

    // Combo badge
    if (this.dom.comboBadge) {
      if (this.combo > 1 && this.comboTimer > 0) {
        this.dom.comboBadge.classList.remove('hidden');
        if (this.dom.comboMultiplierText) this.dom.comboMultiplierText.textContent = `${this.combo}x`;
      } else {
        this.dom.comboBadge.classList.add('hidden');
      }
    }
  }

  incrementCombo() {
    this.combo = Math.min(5, this.combo + 1);
    this.comboTimer = 2.8;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.collectionStreak++;

    // Streak Feedback
    if (this.collectionStreak === 5) this.particles.addText('Nice! (5 Streak)', this.player.x, this.player.y - 45, '#38BDF8', 16);
    else if (this.collectionStreak === 10) this.particles.addText('On Fire! (10 Streak)', this.player.x, this.player.y - 45, '#F59E0B', 18);
    else if (this.collectionStreak === 25) this.particles.addText('Unstoppable! (25 Streak)', this.player.x, this.player.y - 45, '#10B981', 19);
    else if (this.collectionStreak === 50) this.particles.addText('Elite Run! (50 Streak)', this.player.x, this.player.y - 45, '#EC4899', 20);
  }

  triggerScreenShake(intensity = 8) {
    this.screenShake = intensity;
  }

  checkCircleCollision(c1, c2) {
    const dx = c1.x - c2.x;
    const dy = (c1.y + (c1.bobOffsetY || 0)) - c2.y;
    const distSq = dx * dx + dy * dy;
    const radSum = c1.radius + c2.radius;
    return distSq < (radSum * radSum);
  }

  handlePlayerDamage() {
    if (this.player.invulnerableTimer > 0) return;

    // Reset combos & streaks
    if (this.combo > 1) {
      this.particles.addText('COMBO LOST', this.player.x, this.player.y - 40, '#EF4444', 16);
    }
    this.combo = 1;
    this.comboTimer = 0;
    this.collectionStreak = 0;
    this.nearMissStreak = 0;

    // Deflect with Shield
    if (this.player.hasShield) {
      this.player.hasShield = false;
      this.player.invulnerableTimer = 1.0;
      this.audio.playShieldDeflect();
      this.particles.spawnExplosion(this.player.x, this.player.y, 16, '#38BDF8');
      this.particles.addText('SHIELD DEFLECTED!', this.player.x, this.player.y - 40, '#38BDF8', 16);
      this.triggerScreenShake(6);
      if (navigator.vibrate) navigator.vibrate(25);
      return;
    }

    // Direct Hull Damage
    this.player.lives--;
    this.updateLivesDisplay();
    this.audio.playHit();
    this.triggerScreenShake(12);
    this.particles.spawnExplosion(this.player.x, this.player.y, 25, '#DC2626');
    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);

    if (this.player.lives <= 0) {
      this.gameOver();
    } else {
      this.player.invulnerableTimer = 2.0;
      this.particles.addText('-1 LIFE', this.player.x, this.player.y - 40, '#EF4444', 18);
    }
  }

  gameOver() {
    this.state = GameState.GAME_OVER;
    this.audio.stopBgm();
    this.audio.playGameOver();

    // Submit validated score to platform manager
    const result = window.platform.submitScore(this.score, this.survivalSeconds, {
      crystals: this.crystalsCollected,
      dodges: this.obstaclesDodged,
      nearMisses: this.nearMissesCount,
      maxCombo: this.maxCombo,
      powerups: this.powerupsCollected
    });

    const mins = Math.floor(this.survivalSeconds / 60);
    const secs = Math.floor(this.survivalSeconds % 60);
    const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (this.dom.finalScoreVal) this.dom.finalScoreVal.textContent = this.score.toLocaleString();
    if (this.dom.finalHighScoreVal) this.dom.finalHighScoreVal.textContent = (window.platform.currentUser.stats.bestScore).toLocaleString();
    if (this.dom.finalTimeVal) this.dom.finalTimeVal.textContent = timeFormatted;
    if (this.dom.finalCrystalsVal) this.dom.finalCrystalsVal.textContent = this.crystalsCollected.toLocaleString();
    if (this.dom.finalDodgesVal) this.dom.finalDodgesVal.textContent = this.obstaclesDodged.toLocaleString();
    if (this.dom.finalNearMissesVal) this.dom.finalNearMissesVal.textContent = this.nearMissesCount.toLocaleString();
    if (this.dom.finalXpEarnedVal) this.dom.finalXpEarnedVal.textContent = `+${result.earnedXp} XP`;
    if (this.dom.finalCoinsEarnedVal) this.dom.finalCoinsEarnedVal.textContent = `+${result.earnedCoins} 🪙`;

    // Global Rank & Best Combo
    if (this.dom.finalGlobalRankVal) this.dom.finalGlobalRankVal.textContent = `#${result.globalRank || 1}`;
    if (this.dom.finalBestComboVal) this.dom.finalBestComboVal.textContent = `x${this.maxCombo}`;

    // Level Progression Bar
    const curLevel = window.platform.currentUser.level;
    const curXp = window.platform.currentUser.xp;
    const reqXp = window.platform.getXpForNextLevel(curLevel);
    const xpPct = Math.min(100, Math.floor((curXp / reqXp) * 100));

    if (this.dom.goLevelTitle) this.dom.goLevelTitle.textContent = `LEVEL ${curLevel}`;
    if (this.dom.goLevelXp) this.dom.goLevelXp.textContent = `${curXp.toLocaleString()} / ${reqXp.toLocaleString()} XP`;
    if (this.dom.goLevelFill) {
      this.dom.goLevelFill.style.width = '0%';
      setTimeout(() => {
        if (this.dom.goLevelFill) this.dom.goLevelFill.style.width = `${xpPct}%`;
      }, 100);
    }

    // Offline run status
    if (this.dom.goOfflineNotice) {
      if (!navigator.onLine) {
        this.dom.goOfflineNotice.classList.remove('hidden');
      } else {
        this.dom.goOfflineNotice.classList.add('hidden');
      }
    }

    if (result.isNewPersonalBest && this.dom.newBestBadge) this.dom.newBestBadge.classList.remove('hidden');
    else if (this.dom.newBestBadge) this.dom.newBestBadge.classList.add('hidden');

    if (result.isNewGlobalRank && this.dom.newGlobalRankBadge) this.dom.newGlobalRankBadge.classList.remove('hidden');
    else if (this.dom.newGlobalRankBadge) this.dom.newGlobalRankBadge.classList.add('hidden');

    if (this.dom.playingHud) this.dom.playingHud.classList.add('hidden');
    if (this.dom.gameOverScreen) this.dom.gameOverScreen.classList.remove('hidden');
  }

  // --- UPDATE FRAME ---
  update(dt) {
    const isSlowMo = this.slowMoTimer > 0;
    const speedMultiplier = (isSlowMo ? 0.40 : 1.0) * (1.0 + Math.min(1.6, Math.pow(this.score / 600, 0.75)));

    // Power-up countdowns
    if (this.slowMoTimer > 0) this.slowMoTimer = Math.max(0, this.slowMoTimer - dt);
    if (this.doubleScoreTimer > 0) this.doubleScoreTimer = Math.max(0, this.doubleScoreTimer - dt);

    // Magnet Tractor Field
    if (this.magnetTimer > 0) {
      this.magnetTimer = Math.max(0, this.magnetTimer - dt);
      for (let i = 0; i < this.fallingObjects.length; i++) {
        const obj = this.fallingObjects[i];
        if (obj.type === 'crystal' || obj.type === 'rarecrystal') {
          const dx = this.player.x - obj.x;
          const dy = (this.player.y + this.player.bobOffsetY) - obj.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 240 && dist > 5) {
            const pullSpeed = (240 - dist) * 2.5;
            obj.x += (dx / dist) * pullSpeed * dt;
            obj.y += (dy / dist) * pullSpeed * dt;
          }
        }
      }
    }

    // Combo countdown
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 1;
    }

    // Survival points: +1 every second
    this.survivalSeconds += dt;
    this.survivalTimerAcc += dt;
    if (this.survivalTimerAcc >= 1.0) {
      this.survivalTimerAcc -= 1.0;
      this.addScore(1);
    }

    // Dynamic 5-Phase Difficulty Evolution
    let targetPhase = 1;
    if (this.survivalSeconds >= 360) targetPhase = 5;
    else if (this.survivalSeconds >= 240) targetPhase = 4;
    else if (this.survivalSeconds >= 130) targetPhase = 3;
    else if (this.survivalSeconds >= 50) targetPhase = 2;

    if (targetPhase > this.currentPhase) {
      this.currentPhase = targetPhase;
      const names = ['', 'TRAINING', 'ACCELERATION', 'CHAOS', 'OVERDRIVE', 'NIGHTMARE'];
      this.particles.addText(`PHASE ${this.currentPhase}: ${names[this.currentPhase]}`, this.canvas.width / 2, 90, '#2563EB', 20);
      this.audio.playMilestone();
    }

    // Update Subsystems
    this.background.update(dt, speedMultiplier);
    this.player.update(dt, this.input, this.particles);
    this.particles.update(dt);
    this.waveDirector.update(dt, this);

    // Update Falling Objects
    for (let i = this.fallingObjects.length - 1; i >= 0; i--) {
      const obj = this.fallingObjects[i];
      obj.update(dt, speedMultiplier);

      const isHazard = obj.type === 'meteor' || obj.type === 'barrier' || obj.type === 'drone' || obj.type === 'plasmaball';

      // Collision Check
      if (this.checkCircleCollision(this.player, obj)) {
        if (obj.type === 'crystal') {
          this.crystalsCollected++;
          this.incrementCombo();
          this.audio.playCollect(this.combo);
          this.particles.spawnCrystalSparkles(obj.x, obj.y, false);
          this.addScore(10 * this.combo, true, obj.x, obj.y);
          if (navigator.vibrate) navigator.vibrate(10);
          obj.isDead = true;
        } else if (obj.type === 'rarecrystal') {
          this.crystalsCollected++;
          this.incrementCombo();
          this.audio.playRareCollect();
          this.particles.spawnCrystalSparkles(obj.x, obj.y, true);
          this.addScore(50 * this.combo, true, obj.x, obj.y);
          if (navigator.vibrate) navigator.vibrate(15);
          obj.isDead = true;
        } else if (obj.type === 'powerup') {
          this.powerupsCollected++;
          this.audio.playPowerUp();
          this.particles.spawnExplosion(obj.x, obj.y, 18, obj.color);
          this.addScore(50, true, obj.x, obj.y);

          if (obj.subType === 'shield') {
            this.player.hasShield = true;
            this.particles.addText('SHIELD EQUIPPED!', obj.x, obj.y - 20, '#2563EB', 18);
          } else if (obj.subType === 'slowmo') {
            this.slowMoTimer = 5.0;
            this.particles.addText('SLOW MOTION 5s!', obj.x, obj.y - 20, '#8B5CF6', 18);
          } else if (obj.subType === 'double') {
            this.doubleScoreTimer = 10.0;
            this.particles.addText('DOUBLE SCORE 10s!', obj.x, obj.y - 20, '#F59E0B', 18);
          } else if (obj.subType === 'magnet') {
            this.magnetTimer = 8.0;
            this.particles.addText('MAGNET ACTIVE 8s!', obj.x, obj.y - 20, '#10B981', 18);
          }
          if (navigator.vibrate) navigator.vibrate(25);
          obj.isDead = true;
        } else {
          // Obstacle collision
          this.handlePlayerDamage();
          obj.isDead = true;
        }
      } else if (isHazard && !obj.nearMissChecked && !obj.isDead) {
        // Skill-Based Near-Miss Evasion Detection
        const yDiff = Math.abs(obj.y - (this.player.y + this.player.bobOffsetY));
        if (yDiff < 24) {
          const dist = Math.hypot(obj.x - this.player.x, obj.y - (this.player.y + this.player.bobOffsetY));
          const minSafeDist = this.player.radius + obj.radius;
          if (dist >= minSafeDist && dist <= minSafeDist + 38) {
            obj.nearMissChecked = true;
            this.nearMissesCount++;
            this.nearMissStreak++;
            const multiplier = Math.min(4, this.nearMissStreak);
            const bonus = 25 * multiplier * (this.doubleScoreTimer > 0 ? 2 : 1);
            this.addScore(bonus, false);
            this.comboTimer = Math.min(2.8, this.comboTimer + 0.8); // Near miss extends combo!

            this.audio.playNearMiss(this.nearMissStreak);
            this.particles.spawnNearMissSparks(this.player.x, this.player.y + this.player.bobOffsetY);
            const label = multiplier > 1 ? `${multiplier}x NEAR MISS +${bonus}` : `NEAR MISS +${bonus}`;
            this.particles.addText(label, this.player.x, this.player.y - 32, '#2563EB', 16);
            if (navigator.vibrate) navigator.vibrate(12);
          }
        }
      }

      // Evaded off bottom
      if (obj.y > this.canvas.height + 50) {
        if (isHazard && !obj.isDead) {
          this.obstaclesDodged++;
        }
        obj.isDead = true;
      }

      if (obj.isDead) {
        // Release back to object pool
        if (this.pools[obj.type]) this.pools[obj.type].release(obj);
        this.fallingObjects.splice(i, 1);
      }
    }

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // Throttled HUD update
    this.updateHudDom(false);
  }

  // --- RENDER FRAME ---
  render() {
    this.ctx.save();

    if (this.screenShake > 0) {
      const offsetX = (Math.random() - 0.5) * this.screenShake;
      const offsetY = (Math.random() - 0.5) * this.screenShake;
      this.ctx.translate(offsetX, offsetY);
    }

    // Render background
    this.background.draw(this.ctx);

    // Render falling objects
    for (let i = 0; i < this.fallingObjects.length; i++) {
      this.fallingObjects[i].draw(this.ctx);
    }

    // Render player
    if (this.state !== GameState.GAME_OVER) {
      this.player.draw(this.ctx);
    }

    // Render particles & floating texts
    this.particles.draw(this.ctx);

    // Render active event banner directly on canvas (ultra-smooth)
    if (this.activeEventName) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(37, 99, 235, 0.9)';
      this.ctx.fillRect(this.canvas.width / 2 - 120, 16, 240, 32);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 13px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(this.activeEventName, this.canvas.width / 2, 32);
      this.ctx.restore();
    }

    // Optional Performance Debug Overlay (toggled with 'F')
    if (this.qm.showDebug) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.fillRect(8, 8, 190, 44);
      this.ctx.fillStyle = '#22C55E';
      this.ctx.font = '11px monospace';
      this.ctx.fillText(`FPS: ${this.qm.fps} (${this.qm.level})`, 14, 24);
      this.ctx.fillText(`OBJS: ${this.fallingObjects.length} | PARTS: ${this.particles.particles.length}`, 14, 42);
      this.ctx.restore();
    }

    this.ctx.restore();
  }

  loop(timestamp) {
    if (this.state !== GameState.PLAYING) return;

    if (!this.lastTime) this.lastTime = timestamp;
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // Clamp dt spikes
    this.lastTime = timestamp;

    this.qm.update(timestamp);
    this.update(dt);
    this.render();

    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }
}

// Global initialization
window.game = null;
window.addEventListener('DOMContentLoaded', () => {
  window.game = new NeonEscapeGame();
  console.log('[NeonEscape] Optimized Canvas Engine ready.');
});
