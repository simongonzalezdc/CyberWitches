/**
 * ModalManager.js
 * Manages all modal dialogs and overlays in the game.
 */

import { stripEmojisIfLowTier } from './notifications.js';

export class ModalManager {
    constructor(gameState, designTierSystem) {
        this.gameState = gameState;
        this.designTierSystem = designTierSystem;
        this.modals = {};
        this.activeModal = null;

        // Bind methods
        this.showPrestigeModal = this.showPrestigeModal.bind(this);
        this.showWelcomeBack = this.showWelcomeBack.bind(this);
        this.showStoryIntroduction = this.showStoryIntroduction.bind(this);
        this.showMeditationStoryIntroduction = this.showMeditationStoryIntroduction.bind(this);
        this.showFullStoryModal = this.showFullStoryModal.bind(this);
        this.showElementSpecializationChoice = this.showElementSpecializationChoice.bind(this);
        this.showDestructiveConfirmation = this.showDestructiveConfirmation.bind(this);

        // Initialize references to existing DOM modals
        this.initDOMReferences();
    }

    initDOMReferences() {
        this.modals.prestige = document.getElementById('prestige-modal');
        this.modals.welcomeBack = document.getElementById('welcome-back-modal');
        this.modals.help = document.getElementById('help-modal');

        // Initialize help modal listeners
        this.initHelpModal();
    }

    initHelpModal() {
        const helpButton = document.getElementById('help-button');
        const closeHelpButton = document.getElementById('close-help-button');
        const helpModalClose = this.modals.help?.querySelector('.modal-close');

        if (helpButton && this.modals.help) {
            helpButton.addEventListener('click', () => this.openModal('help'));
        }

        if (closeHelpButton && this.modals.help) {
            closeHelpButton.addEventListener('click', () => this.closeModal('help'));
        }

        if (helpModalClose && this.modals.help) {
            helpModalClose.addEventListener('click', () => this.closeModal('help'));
        }

        // Close on backdrop click
        if (this.modals.help) {
            this.modals.help.addEventListener('click', (e) => {
                if (e.target === this.modals.help) {
                    this.closeModal('help');
                }
            });
        }
    }

    openModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('active');
            // Force visibility
            modal.style.pointerEvents = 'auto';
            modal.style.visibility = 'visible';
            modal.style.opacity = '1';

            this.activeModal = modal;

            if (window.announceToScreenReader) {
                window.announceToScreenReader(`${modalName} modal opened`, 'polite');
            }
        }
    }

    closeModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
            modal.style.pointerEvents = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';

            if (this.activeModal === modal) {
                this.activeModal = null;
            }

            if (window.announceToScreenReader) {
                window.announceToScreenReader(`${modalName} modal closed`, 'polite');
            }
        }
    }

    closeAllModals() {
        Object.keys(this.modals).forEach(key => this.closeModal(key));

        // Also close dynamic modals
        const dynamicModals = document.querySelectorAll('.story-intro-modal, .meditation-story-modal, .full-story-modal, .specialization-modal, .modal-overlay');
        dynamicModals.forEach(modal => modal.remove());
    }

    showPrestigeModal() {
        if (!this.gameState || !this.modals.prestige) return;

        document.getElementById('prestige-ek').textContent = this.gameState.prestigePoints;
        document.getElementById('prestige-gain').textContent = this.gameState.calculatePrestigeGain();

        const ascendButton = document.getElementById('ascend-button');
        if (ascendButton) {
            ascendButton.disabled = this.gameState.calculatePrestigeGain() <= 0;
        }

        this.openModal('prestige');
    }

    showWelcomeBack(elapsed, abGained, formatTimeDuration, formatShort) {
        if (!this.modals.welcomeBack) return;

        const timeEl = document.getElementById('welcome-time');
        const abEl = document.getElementById('welcome-ab');

        if (timeEl) timeEl.innerHTML = `<span class="css-icon-clock"></span> Away for: ${formatTimeDuration(elapsed)}`;
        if (abEl) abEl.innerHTML = `<span class="css-icon-sparkle"></span> Earned: ${formatShort(abGained)} SE`;

        this.openModal('welcomeBack');

        // Animate modal appearance
        const modalContent = this.modals.welcomeBack.querySelector('.modal-content');
        if (modalContent && window.slideIn) {
            window.slideIn(modalContent, 'bottom', 400);
        }

        // Auto-close after 5 seconds
        setTimeout(() => {
            this.closeModal('welcomeBack');
        }, 5000);
    }

    showStoryIntroduction() {
        // Check if story introduction was already shown
        const hasSeenStory = localStorage.getItem('hasSeenStoryIntroduction') === 'true';
        if (hasSeenStory) return;

        const modal = document.createElement('div');
        modal.className = 'story-intro-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10001;
            backdrop-filter: blur(10px);
        `;

        const content = document.createElement('div');
        content.className = 'story-intro-content';
        content.style.cssText = `
            background: var(--bg-primary, #1a1a2e);
            border: 2px solid var(--accent, #6c5ce7);
            border-radius: 15px;
            padding: 40px;
            max-width: 600px;
            width: 90%;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
        `;

        content.innerHTML = `
            <h1 style="color: var(--accent, #6c5ce7); font-size: 36px; margin-bottom: 20px;">Hex Compiler</h1>
            <p style="color: var(--text-primary, #fff); font-size: 18px; line-height: 1.6; margin-bottom: 15px;">
                Magic is dying. The world's spell energy is fading, and once it's gone, it won't return.
            </p>
            <p style="color: var(--text-primary, #fff); font-size: 18px; line-height: 1.6; margin-bottom: 15px;">
                You are a <strong style="color: var(--success, #00d4aa);">Hex Compiler</strong>—one of the last who knows how to preserve magic by crystallizing it into permanent structures.
            </p>
            <p style="color: var(--text-secondary, #aaa); font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Every spell you cast pulls energy from a dwindling pool. If you don't act, magic will be gone forever.
            </p>
            <p style="color: var(--text-secondary, #aaa); font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Your workstations are preservation chambers—structures that capture and hold spell energy before it fades.
            </p>
            <button class="btn-primary" id="close-story-intro" style="
                padding: 15px 40px;
                font-size: 18px;
                background: var(--accent, #6c5ce7);
                border: none;
                border-radius: 8px;
                color: white;
                cursor: pointer;
                transition: all 0.3s;
            ">Begin Preservation</button>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Add event listener
        const closeBtn = modal.querySelector('#close-story-intro');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });
        }

        // Mark as seen
        localStorage.setItem('hasSeenStoryIntroduction', 'true');
    }

    showMeditationStoryIntroduction() {
        const modal = document.createElement('div');
        modal.className = 'meditation-story-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10001;
            backdrop-filter: blur(10px);
        `;

        const content = document.createElement('div');
        content.className = 'meditation-story-content';
        content.style.cssText = `
            background: var(--bg-primary, #1a1a2e);
            border: 2px solid var(--accent, #6c5ce7);
            border-radius: 15px;
            padding: 40px;
            max-width: 600px;
            width: 90%;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
        `;

        content.innerHTML = `
            <h1 style="color: var(--accent, #6c5ce7); font-size: 36px; margin-bottom: 20px;">The Mental Defense</h1>
            <p style="color: var(--text-primary, #fff); font-size: 18px; line-height: 1.6; margin-bottom: 15px;">
                As magic fades, the chaos and despair create <strong style="color: var(--error, #ff4757);">Distractions</strong>—mental intrusions that break your focus.
            </p>
            <p style="color: var(--text-primary, #fff); font-size: 18px; line-height: 1.6; margin-bottom: 15px;">
                The fading doesn't just drain magic; it attacks your mind. Doubt, despair, and chaos seep in, making it harder to preserve what remains.
            </p>
            <p style="color: var(--text-secondary, #aaa); font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                You've learned to defend your mind. <strong style="color: var(--success, #00d4aa);">Meditation</strong> is your mental fortress—a space where you use preserved materials to build towers of focus.
            </p>
            <p style="color: var(--text-secondary, #aaa); font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                These towers defend your <strong style="color: var(--success, #00d4aa);">Tranquility</strong> against waves of Distractions. The more focused you are, the better you can preserve magic.
            </p>
            <button class="btn-primary" id="close-meditation-story" style="
                padding: 15px 40px;
                font-size: 18px;
                background: var(--accent, #6c5ce7);
                border: none;
                border-radius: 8px;
                color: white;
                cursor: pointer;
                transition: all 0.3s;
            ">Enter Meditation</button>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('#close-meditation-story');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });
        }
    }

    showFullStoryModal() {
        const modal = document.createElement('div');
        modal.className = 'full-story-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10001;
            backdrop-filter: blur(10px);
            overflow-y: auto;
        `;

        const content = document.createElement('div');
        content.className = 'full-story-content';
        content.style.cssText = `
            background: var(--bg-primary, #1a1a2e);
            border: 2px solid var(--accent, #6c5ce7);
            border-radius: 15px;
            padding: 40px;
            max-width: 800px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
            margin: 20px;
        `;

        content.innerHTML = `
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: var(--accent, #6c5ce7); font-size: 36px; margin-bottom: 10px;">Hex Compiler</h1>
                <p style="color: var(--text-secondary, #aaa); font-size: 18px;">The Story of The Fading</p>
            </div>
            
            <div style="color: var(--text-primary, #fff); font-size: 16px; line-height: 1.8; margin-bottom: 20px;">
                <h2 style="color: var(--accent, #6c5ce7); font-size: 24px; margin-top: 30px; margin-bottom: 15px;">The Premise</h2>
                <p style="margin-bottom: 15px;">
                    Magic is dying. The world's spell energy is fading, and once it's gone, it won't return. You are a <strong style="color: var(--success, #00d4aa);">Hex Compiler</strong>—one of the last who knows how to preserve magic by crystallizing it into permanent structures.
                </p>
                
                <h2 style="color: var(--accent, #6c5ce7); font-size: 24px; margin-top: 30px; margin-bottom: 15px;">The Urgency</h2>
                <p style="margin-bottom: 15px;">
                    Every spell you cast pulls energy from a dwindling pool. If you don't act, magic will be gone forever. Your workstations are preservation chambers—structures that capture and hold spell energy before it fades.
                </p>
                
                <h2 style="color: var(--accent, #6c5ce7); font-size: 24px; margin-top: 30px; margin-bottom: 15px;">The Journey</h2>
                
                <h3 style="color: var(--success, #00d4aa); font-size: 20px; margin-top: 20px; margin-bottom: 10px;">Early Game</h3>
                <p style="margin-bottom: 15px;">
                    You cast desperate spells, gathering what elemental essences remain. Fire, Water, Air, Crystal—each element fades at a different rate. You build basic workstations (Forges, Wells, Generators, Chambers) to stabilize these essences into materials that won't fade.
                </p>
                
                <h3 style="color: var(--success, #00d4aa); font-size: 20px; margin-top: 20px; margin-bottom: 10px;">Mid Game</h3>
                <p style="margin-bottom: 15px;">
                    You've learned to combine preserved materials into more stable forms. Some workstations can generate Arcane Bits—they're not just preserving magic, they're creating self-sustaining loops that slow the fading.
                </p>
                
                <h3 style="color: var(--success, #00d4aa); font-size: 20px; margin-top: 20px; margin-bottom: 10px;">Late Game</h3>
                <p style="margin-bottom: 15px;">
                    You're building quantum and void-level structures—the most stable forms possible. These are your last hope to preserve magic in forms that might outlast the fading.
                </p>
                
                <h3 style="color: var(--success, #00d4aa); font-size: 20px; margin-top: 20px; margin-bottom: 10px;">Meditation - The Mental Defense</h3>
                <p style="margin-bottom: 15px;">
                    As magic fades, the chaos and despair create <strong style="color: var(--error, #ff4757);">Distractions</strong>—mental intrusions that break your focus. The fading doesn't just drain magic; it attacks your mind. Doubt, despair, and chaos seep in, making it harder to preserve what remains.
                </p>
                <p style="margin-bottom: 15px;">
                    After your first Ascension, you learn to defend your mind. <strong style="color: var(--success, #00d4aa);">Meditation</strong> is your mental fortress—a space where you use preserved materials to build towers of focus. These towers defend your <strong style="color: var(--success, #00d4aa);">Tranquility</strong> against waves of Distractions.
                </p>
                
                <h3 style="color: var(--success, #00d4aa); font-size: 20px; margin-top: 20px; margin-bottom: 10px;">Ascension - The Elemental Choice</h3>
                <p style="margin-bottom: 15px;">
                    This plane is too far gone. You've learned all you can here. As you prepare to Ascend to other realms where magic still exists, you must choose how you'll approach preservation in the next realm. Each element offers a different strategy for fighting the fading:
                </p>
                <ul style="margin-left: 20px; margin-bottom: 15px; list-style: none;">
                    <li style="margin-bottom: 10px;"><strong style="color: var(--primary, #FF2DAA);">🔥 Fire Path:</strong> Preserve through intensity. Build aggressive preservation structures that burn bright and fast.</li>
                    <li style="margin-bottom: 10px;"><strong style="color: var(--secondary, #22E3FF);">💧 Water Path:</strong> Preserve through efficiency. Build balanced structures that flow smoothly.</li>
                    <li style="margin-bottom: 10px;"><strong style="color: var(--accent, #FFDB6E);">💨 Air Path:</strong> Preserve through speed. Unlock preservation techniques faster—time is running out.</li>
                    <li style="margin-bottom: 10px;"><strong style="color: var(--success, #3CE3C5);">💎 Crystal Path:</strong> Preserve through stability. Build universal foundations that support all elements.</li>
                </ul>
                <p style="margin-bottom: 15px;">
                    You carry your chosen preservation technique forward. Each realm teaches you more, but the fading follows you—you must work faster, build better, preserve more.
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <button class="btn-primary" id="close-full-story" style="
                    padding: 15px 40px;
                    font-size: 18px;
                    background: var(--accent, #6c5ce7);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    cursor: pointer;
                    transition: all 0.3s;
                ">Close</button>
            </div>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('#close-full-story');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });
        }
    }

    showElementSpecializationChoice(ELEMENT_SPECIALIZATIONS, updateAllUI) {
        // Don't show if already has specialization
        if (this.gameState.elementSpecialization) {
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'specialization-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;

        const content = document.createElement('div');
        content.className = 'specialization-content';
        content.style.cssText = `
            background: var(--bg-primary, #1a1a2e);
            border: 2px solid var(--accent, #6c5ce7);
            border-radius: 15px;
            padding: 30px;
            max-width: 800px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        `;

        content.innerHTML = `
            <h2 style="text-align: center; margin-bottom: 20px; color: var(--accent, #6c5ce7); font-size: 28px;">
                Choose Your Preservation Strategy
            </h2>
            <p style="text-align: center; margin-bottom: 30px; color: var(--text-secondary, #aaa); font-size: 16px;">
                This plane is too far gone. You've learned all you can here. As you prepare to Ascend to other realms where magic still exists, you must choose how you'll approach preservation in the next realm. Each element offers a different strategy for fighting the fading.
            </p>
            <div class="element-choices" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; margin-bottom: 20px;">
                ${Object.values(ELEMENT_SPECIALIZATIONS).map(spec => `
                    <div class="element-choice" data-element="${spec.id}" style="
                        background: var(--bg-secondary, #16213e);
                        border: 2px solid var(--accent, #6c5ce7);
                        border-radius: 10px;
                        padding: 20px;
                        cursor: pointer;
                        transition: all 0.3s;
                        text-align: center;
                    ">
                        <div class="element-icon" style="font-size: 48px; margin-bottom: 10px;">${spec.icon}</div>
                        <h3 style="margin: 10px 0; color: var(--text-primary, #fff); font-size: 18px;">${spec.name}</h3>
                        <p style="margin: 10px 0; color: var(--text-secondary, #aaa); font-size: 12px; line-height: 1.4;">${spec.description}</p>
                        <div class="element-bonuses" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border, #333);">
                            ${Object.entries(spec.bonuses).map(([key, value]) => {
            let display = '';
            if (key === 'baseProductionMult') display = `+${((value - 1) * 100).toFixed(0)}% ${spec.id} production`;
            else if (key === 'abProductionMult') display = `+${((value - 1) * 100).toFixed(0)}% AB from ${spec.id} reactors`;
            else if (key === 'costReduction') display = `-${(value * 100).toFixed(0)}% ${spec.id} costs`;
            else if (key === 'castRewardMult') display = `+${((value - 1) * 100).toFixed(0)}% cast rewards`;
            else if (key === 'globalProductionMult') display = `+${((value - 1) * 100).toFixed(0)}% all production`;
            else if (key === 'ingredientProductionMult') display = `+${((value - 1) * 100).toFixed(0)}% ingredient production`;
            else if (key === 'unlockSpeedMult') display = `Unlock ${((1 - value) * 100).toFixed(0)}% earlier`;
            else if (key === 'productionSpeedMult') display = `+${((value - 1) * 100).toFixed(0)}% production speed`;
            else if (key === 'castSpeedMult') display = `+${((value - 1) * 100).toFixed(0)}% cast speed`;
            else if (key === 'universalIngredientMult') display = `+${((value - 1) * 100).toFixed(0)}% universal ingredients`;
            else if (key === 'bottleneckCostReduction') display = `-${(value * 100).toFixed(0)}% bottleneck costs`;
            else if (key === 'crystalBuildingMult') display = `+${((value - 1) * 100).toFixed(0)}% Crystal building production`;
            return `<div style="font-size: 11px; color: var(--success, #00d4aa); margin: 3px 0;">${display}</div>`;
        }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Add hover effects and click handlers
        const choices = modal.querySelectorAll('.element-choice');
        choices.forEach(choice => {
            choice.addEventListener('mouseenter', () => {
                choice.style.transform = 'scale(1.05)';
                choice.style.borderColor = 'var(--success, #00d4aa)';
                choice.style.boxShadow = '0 5px 20px rgba(0, 212, 170, 0.3)';
            });
            choice.addEventListener('mouseleave', () => {
                choice.style.transform = 'scale(1)';
                choice.style.borderColor = 'var(--accent, #6c5ce7)';
                choice.style.boxShadow = 'none';
            });
            choice.addEventListener('click', () => {
                const element = choice.dataset.element;
                if (this.gameState.chooseElementSpecialization(element)) {
                    modal.remove();
                    if (window.showNotification) {
                        const spec = ELEMENT_SPECIALIZATIONS[element];
                        window.showNotification(`${spec.icon} ${spec.name} chosen!`, 'success');
                    }
                    if (updateAllUI) updateAllUI();
                }
            });
        });
    }

    showDestructiveConfirmation(title, message, confirmText = 'RESET') {
        return new Promise((resolve) => {
            // Create modal overlay
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;';

            // Create modal content
            const modal = document.createElement('div');
            modal.className = 'destructive-confirmation-modal';
            modal.style.cssText = 'background: var(--bg-card); border: 2px solid var(--error, #FF4444); border-radius: 12px; padding: 24px; max-width: 500px; width: 90%; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);';

            modal.innerHTML = `
                <h2 style="color: var(--error, #FF4444); margin-bottom: 16px; font-size: 24px;">${title}</h2>
                <p style="color: var(--text); margin-bottom: 20px; line-height: 1.6;">${message}</p>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; color: var(--text); margin-bottom: 8px; font-weight: 600;">
                        Type "${confirmText}" to confirm:
                    </label>
                    <input type="text" id="destructive-confirm-input" 
                        style="width: 100%; padding: 12px; background: var(--bg-dark); border: 2px solid var(--border); border-radius: 8px; color: var(--text); font-size: 16px;"
                        autocomplete="off" spellcheck="false">
                </div>
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="destructive-confirm-cancel" class="btn-secondary" style="padding: 12px 24px;">Cancel</button>
                    <button id="destructive-confirm-ok" class="btn-danger" style="padding: 12px 24px;" disabled>Confirm</button>
                </div>
            `;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            const input = modal.querySelector('#destructive-confirm-input');
            const cancelBtn = modal.querySelector('#destructive-confirm-cancel');
            const okBtn = modal.querySelector('#destructive-confirm-ok');

            // Enable OK button when text matches
            input.addEventListener('input', (e) => {
                okBtn.disabled = e.target.value !== confirmText;
            });

            // Handle Enter key
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !okBtn.disabled) {
                    okBtn.click();
                }
            });

            // Focus input
            input.focus();

            // Cancel handler
            cancelBtn.addEventListener('click', () => {
                document.body.removeChild(overlay);
                resolve(false);
            });

            // Confirm handler
            okBtn.addEventListener('click', () => {
                if (input.value === confirmText) {
                    document.body.removeChild(overlay);
                    resolve(true);
                }
            });

            // Close on overlay click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                    resolve(false);
                }
            });

            // Close on Escape
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    document.body.removeChild(overlay);
                    document.removeEventListener('keydown', escapeHandler);
                    resolve(false);
                }
            };
            document.addEventListener('keydown', escapeHandler);
        });
    }
}
