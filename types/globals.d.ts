/**
 * Ambient global declarations for the Hex Compiler runtime.
 *
 * This file is the *registry* of every symbol the game intentionally attaches to
 * `window` (or expects on the global scope from a CDN script). It exists for two
 * reasons:
 *
 *  1. Documentation — one place that lists the global contract between modules.
 *  2. Guardrail — `checkJs` validates every `window.foo` access against this
 *     interface. A NEW, un-declared global (e.g. a typo like `window.gameStat`)
 *     becomes a build error, which is exactly the "moved / never-wired symbol"
 *     bug class this Phase 2 work exists to kill.
 *
 * Values are intentionally typed loosely (`any`) for this first pass: the goal is
 * to catch *undeclared* globals, not to fully type the game state. Tighten
 * individual entries over time as the modules they point at gain JSDoc types.
 */

export {};

declare global {
  /**
   * Tone.js is loaded from a CDN `<script>` tag (SRI-pinned), so it is a true
   * ambient global rather than an ES import. The audio system guards every use
   * behind a presence check, so it may be undefined at runtime.
   */
  const Tone: any;

  interface Window {
    // --- Core engine handles (set in game.js after initGame) ---
    gameState: any;
    uiManager: any;
    gameLoop: any;

    // --- Subsystems exposed for cross-module access / debugging ---
    audioSystem: any;
    designTierSystem: any;
    meditationState: any;
    meditationTowers: any;
    meditationUI: any;
    comboSystem: any;
    dailyRituals: any;
    uiStore: any;
    Tone: any;

    // --- Data tables (exposed in gameInit so UI modules can resolve by id) ---
    PRODUCERS: any;
    INGREDIENTS: any;
    UPGRADES: any;
    HIDDEN_RECIPES: any;
    PRESTIGE_BONUSES: any;
    achievements: any;

    // --- Formatters / animation helpers (exposed in gameInit) ---
    // Typed `any` (callable) so assigning existing `Function`-typed module
    // exports onto window doesn't trip structural-assignability checks.
    formatShort: any;
    formatNumber: any;
    formatTimeDuration: any;
    pulseElement: any;
    shakeElement: any;
    slideIn: any;
    triggerBonusFeedback: any;

    // --- UI / feature wiring ---
    updateFeatureIndicators: () => void;
    switchTab: (tabName: string) => void;
    announceToScreenReader: (...args: any[]) => any;
    addTooltip: (...args: any[]) => any;
    addLockIndicator: (...args: any[]) => any;
    // Notifications helper, exposed in gameInit.js so any module can toast.
    showNotification: (message: string, type?: string, duration?: number, options?: { html?: boolean }) => any;
    // SYSTEM_LOG bridge for errorHandler / storage modules (set in gameInit).
    __appendSystemLog?: (message: string, level?: string) => void;
    // Heal-moment / funnel debug surfaces (set at runtime, optional)
    __lastTierAdvance?: { fromTier: number; toTier: number; at: number };
    __lastMeditationMultDelta?: { before: number; after: number; delta: number; pct: number };

    // --- Analytics surface (opt-in) ---
    trackEvent: (...args: any[]) => any;
    performanceBenchmarks: any;

    // --- Legacy WebKit-prefixed AudioContext (Safari fallback, feature-detected) ---
    webkitAudioContext?: typeof AudioContext;

    // --- Gameplay actions surfaced on window ---
    // Read as a boolean flag in some paths and called as a predicate in others
    // (`typeof window.autoCastEnabled === 'function' && window.autoCastEnabled()`).
    autoCastEnabled: any;
    claimTask: (...args: any[]) => any;
    addQuest: (...args: any[]) => any;
    updateQuestProgress: (...args: any[]) => any;
    trackAction: (...args: any[]) => any;
    canUseAnalytics: (...args: any[]) => any;

    // --- Tutorial ---
    startTutorial: (...args: any[]) => any;
    resetTutorial: (...args: any[]) => any;

    // --- Analytics / balance debug reports ---
    runBalanceTests: (...args: any[]) => any;
    getProgressionReport: (...args: any[]) => any;
    getEconomyReport: (...args: any[]) => any;
    getBalanceMetrics: (...args: any[]) => any;

    // --- Performance tooling (opt-in dev instrumentation) ---
    performanceBaseline: any;
    performanceValidator: any;
    errorReporter: any;

    // --- Error telemetry (opt-in sink) ---
    CYBERWITCHES_ERROR_ENDPOINT: string | undefined;

    // --- File System Access API (Chromium-only; feature-detected) ---
    showSaveFilePicker?: (...args: any[]) => Promise<any>;
    showOpenFilePicker?: (...args: any[]) => Promise<any>;
  }

  /**
   * Chrome-only non-standard memory metrics, read by the performance baseline
   * tooling behind a presence check.
   */
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }
}
