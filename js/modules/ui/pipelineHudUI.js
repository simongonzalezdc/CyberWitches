/**
 * Pipeline role HUD projector (ticket 13) — progressive disclosure, a11y.
 * Reads Kernel projectors; no economy rules.
 */
import { projectorsFromGameState, gameStateToKernel } from '../../kernel/adapter.js';
import { prestigeRecommend } from '../../kernel/prestige.js';

const ROLE_LABELS = {
    capture: 'CAPTURE',
    store: 'STORE',
    bind: 'BIND',
    compile: 'COMPILE',
    shield: 'SHIELD'
};

export class PipelineHudUI {
    /**
     * @param {import('../../gameState.js').GameState} gameState
     */
    constructor(gameState) {
        this.gameState = gameState;
        this.root = null;
        this.affinityEl = null;
        this._lastSig = '';
    }

    ensureDom() {
        if (this.root && document.body.contains(this.root)) return;
        this.root = document.getElementById('pipeline-role-hud');
        this.affinityEl = document.getElementById('affinity-foreshadow');
        if (!this.root) return;

        // Progressive disclosure: compact on narrow viewports via CSS class
        this.root.setAttribute('role', 'region');
        this.root.setAttribute('aria-label', 'Pipeline roles Capture Store Bind Compile Shield');
        this.root.setAttribute('data-one-thumb', 'false');
    }

    update() {
        this.ensureDom();
        if (!this.root || !this.gameState) return;

        const { pipeline, affinity, contract } = projectorsFromGameState(this.gameState);
        const kState = gameStateToKernel(this.gameState);
        const rec = prestigeRecommend(kState);
        const used = Math.floor(Number(pipeline.storageUsed) || 0);
        const cap = Math.floor(Number(pipeline.storageCap) || 50);
        const over = !!pipeline.storageOvercap;
        const sig = JSON.stringify({
            r: pipeline.roles.map((x) => [x.role, x.ownedTotal]),
            a: affinity.lead,
            c: contract.id,
            cap,
            used,
            over,
            band: rec.band
        });
        if (sig === this._lastSig) return;
        this._lastSig = sig;

        const parts = pipeline.roles.map((roleBlock) => {
            const label = ROLE_LABELS[roleBlock.role] || roleBlock.role.toUpperCase();
            const owned = roleBlock.ownedTotal;
            const unlocked = roleBlock.modules.filter(
                (/** @type {{ unlocked?: boolean }} */ m) => !!m.unlocked
            ).length;
            return `<div class="pipeline-role-chip" data-role="${roleBlock.role}" title="${label}: ${owned} owned, ${unlocked} unlocked">
                <span class="pipeline-role-name">${label}</span>
                <span class="pipeline-role-count" aria-label="${owned} owned">${owned}</span>
            </div>`;
        });

        this.root.innerHTML = `
            <div class="pipeline-role-row" aria-live="polite">
                ${parts.join('<span class="pipeline-role-arrow" aria-hidden="true">→</span>')}
            </div>
            <div class="pipeline-role-meta text-[10px] font-mono ${over ? 'text-ky-amber' : 'text-gray-400'} mt-1" data-storage-pressure="${over ? 'overcap' : 'ok'}">
                STORAGE ${used}/${cap}${over ? ' · VOID_PRESSURE' : ''} · EXEC primary
            </div>
            ${rec.band === 'recommend' && (this.gameState.prestigeCount || 0) === 0 ? `
            <div class="pipeline-prestige-interrupt text-[10px] font-mono mt-1 border-l-2 border-ky-amber pl-2 text-ky-crystal" role="status" data-prestige-band="recommend">
                ASCEND_BAND: Keys ready — plane grind diminishing. Preview prestige when ready.
            </div>` : ''}
        `;
        this.root.hidden = false;
        this.root.removeAttribute('aria-hidden');

        if (this.affinityEl) {
            /** @type {Record<string, number>} */
            const shares = /** @type {any} */ (affinity.shares || {});
            const pct = (/** @type {number} */ n) => Math.round((n || 0) * 100);
            // Keep copy short so it does not clip under toast stack / narrow rails
            this.affinityEl.innerHTML = affinity.locked
                ? `<span class="text-ky-green">AFFINITY_LOCK ${String(affinity.lockedId || '').toUpperCase()}</span>
                   <span class="text-gray-400"> — ${affinity.strategyName || ''}</span>`
                : `<span>AFFINITY lean <strong>${String(affinity.lead || '').toUpperCase()}</strong>
                   F${pct(shares.fire || 0)} W${pct(shares.water || 0)} A${pct(shares.air || 0)} C${pct(shares.crystal || 0)}</span>
                   <span class="text-gray-500"> · prestige path</span>`;
            this.affinityEl.hidden = false;
        }

        // Prefer kernel contract message on compile goal if empty-ish
        const goalMsg = document.getElementById('compile-goal-message');
        const goalTitle = document.getElementById('compile-goal-title');
        const rail = document.getElementById('compile-goal-rail');
        if (rail && goalMsg && contract && contract.message) {
            // Only seed when rail is showing and message still placeholder
            if (!rail.hidden && /Awaiting|tutorial/i.test(goalMsg.textContent || '')) {
                if (goalTitle) goalTitle.textContent = contract.title || 'COMPILE_CONTRACT';
                goalMsg.textContent = contract.message;
            }
        }
    }
}
