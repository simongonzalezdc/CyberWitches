/**
 * Post-tutorial primary compile goal rail (single primary objective).
 */
import { getPrimaryCompileGoal, syncCompletedGoals } from '../game/compileGoalStack.js';

const STORAGE_KEY = 'cw.compileGoals.completed';

export class CompileGoalUI {
    /**
     * @param {import('../../gameState.js').GameState} gameState
     * @param {import('./uiManager.js').UIManager} [uiManager]
     */
    constructor(gameState, uiManager = null) {
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.completedIds = this.loadCompleted();
        this.root = document.getElementById('compile-goal-rail');
        this.titleEl = document.getElementById('compile-goal-title');
        this.msgEl = document.getElementById('compile-goal-message');
        this.visible = false;
    }

    loadCompleted() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed.map(String) : [];
        } catch {
            return [];
        }
    }

    saveCompleted() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.completedIds));
        } catch { /* private mode */ }
    }

    isTutorialDone() {
        try {
            return localStorage.getItem('tutorialCompleted') === 'true';
        } catch {
            return false;
        }
    }

    buildContext() {
        /** @type {any} */
        const gs = this.gameState || {};
        return {
            ab: gs.ab || 0,
            workstations: gs.workstations || {},
            discoveredRecipes: gs.discoveredRecipes || [],
            prestigeCount: gs.prestigeCount || 0,
            totalTaps: gs.totalTaps || 0,
            meditationSessionDone: !!(gs.storyFlags && gs.storyFlags.meditationSessionDone)
        };
    }

    /**
     * Refresh primary goal. No-op until tutorial is complete.
     */
    update() {
        if (!this.root) {
            this.root = document.getElementById('compile-goal-rail');
            this.titleEl = document.getElementById('compile-goal-title');
            this.msgEl = document.getElementById('compile-goal-message');
        }
        if (!this.root) return;

        if (!this.isTutorialDone()) {
            this.root.hidden = true;
            this.root.setAttribute('aria-hidden', 'true');
            this.visible = false;
            return;
        }

        const ctx = this.buildContext();
        this.completedIds = syncCompletedGoals(ctx, this.completedIds);
        this.saveCompleted();
        const goal = getPrimaryCompileGoal(ctx, this.completedIds);
        if (!goal) {
            this.root.hidden = true;
            return;
        }

        this.root.hidden = false;
        this.root.setAttribute('aria-hidden', 'false');
        this.visible = true;
        if (this.titleEl) this.titleEl.textContent = goal.title;
        if (this.msgEl) this.msgEl.textContent = goal.message;
        this.root.dataset.goalId = goal.id;
    }
}
