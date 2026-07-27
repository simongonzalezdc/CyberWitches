/**
 * ModalManager.js
 * Manages all modal dialogs and overlays in the game.
 */

import { idbDelete } from '../../save/indexedDBBackup.js';
import { escapeHtml } from '../../utils.js';

export class ModalManager {
    constructor(gameState, designTierSystem) {
        this.gameState = gameState;
        this.designTierSystem = designTierSystem;
        this.modals = {};
        this.activeModal = null;
        // Element that had focus before a modal opened, so we can restore it on
        // close (the focus-management behavior a native <dialog> gives for free).
        this._lastFocused = null;
        this._onModalKeydown = this._onModalKeydown.bind(this);

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
        this.modals.settings = document.getElementById('settings-modal');

        // Initialize help modal listeners
        this.initHelpModal();
        // Wire the welcome-back close button + the (previously dead) settings modal.
        this.initWelcomeBackModal();
        this.initSettingsModal();
        // Wire the prestige modal's CONFIRM_REBOOT / CANCEL buttons (both were dead).
        this.initPrestigeModal();
    }

    initPrestigeModal() {
        if (!this.modals.prestige) return;
        const close = () => this.closeModal('prestige');
        document.getElementById('close-prestige-button')?.addEventListener('click', close);
        this.modals.prestige.addEventListener('click', (e) => {
            if (e.target === this.modals.prestige) close();
        });
        document.getElementById('ascend-button')?.addEventListener('click', () => {
            if (!this.gameState) return;
            // ascend() grants keys, resets the run, fires onPrestigeCompleted (which
            // drives the element-specialization choice), and saves immediately.
            this.gameState.ascend();
            this.closeModal('prestige');
            // ModalManager isn't given a uiManager reference (constructor takes
            // gameState + designTierSystem), so the old `this.uiManager` guard was
            // always false and never refreshed. Use the global handle instead.
            if (window.uiManager && window.uiManager.updateAllUI) window.uiManager.updateAllUI();
        });
    }

    initWelcomeBackModal() {
        if (!this.modals.welcomeBack) return;
        const close = () => this.closeModal('welcomeBack');
        this.modals.welcomeBack.querySelector('.modal-close')?.addEventListener('click', close);
        this.modals.welcomeBack.addEventListener('click', (e) => {
            if (e.target === this.modals.welcomeBack) close();
        });
    }

    initSettingsModal() {
        const settingsButton = document.getElementById('settings-button');
        if (settingsButton && this.modals.settings) {
            settingsButton.addEventListener('click', () => this.openModal('settings'));
        }
        if (!this.modals.settings) return;

        const close = () => this.closeModal('settings');
        document.getElementById('close-settings-button')?.addEventListener('click', close);
        this.modals.settings.querySelector('.modal-close')?.addEventListener('click', close);
        this.modals.settings.addEventListener('click', (e) => {
            if (e.target === this.modals.settings) close();
        });

        // Wipe save (with confirmation).
        document.getElementById('clear-save-button')?.addEventListener('click', async () => {
            const ok = await this.showDestructiveConfirmation(
                'Wipe save',
                'This removes all local progress, backups, meditation state, and critical error logs from this browser. Type WIPE SAVE to continue.',
                'WIPE SAVE'
            );
            if (!ok) return;
            // Remove EVERY persisted progression key, not just the main save.
            // MeditationState.saveState() writes to its own `meditationState`
            // key, so wiping only `cyberWitchesSave` left meditation focus /
            // towers / stats behind — they resurrected on reload, contradicting
            // the "Wipe ALL save data" promise.
            const keys = ['cyberWitchesSave', 'meditationState', 'cyberWitchesCriticalErrors'];
            try {
                keys.forEach((key) => localStorage.removeItem(key));
            } catch (e) {
                console.error('Failed to wipe save:', e);
            }
            // AWAIT the IndexedDB deletes before reloading — otherwise the reload
            // can beat the async delete and restore-on-boot would resurrect the
            // save from the durable mirror, silently defeating the wipe.
            try {
                await Promise.all(keys.map((key) => idbDelete(key)));
            } catch (e) {
                console.error('Failed to clear IndexedDB backup:', e);
            }
            window.location.reload();
        });

        // Cross-browser save export/import FALLBACK. Chromium's File System Access
        // path is wired by PWAFeaturesManager when `showSaveFilePicker` exists, so
        // only attach these (Blob download / file input) when it does NOT — exactly
        // one handler per button per browser, and export/import now work in
        // Firefox/Safari instead of being Chromium-only.
        if (typeof window !== 'undefined' && !('showSaveFilePicker' in window)) {
            this.initSaveIOFallback();
        }

        // Initialize paste import validation
        this.initPasteImportValidation();
    }

    initSaveIOFallback() {
        const exportBtn = document.getElementById('export-save-button');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                // Add processing state
                exportBtn.classList.add('modal-btn-feedback', 'processing');
                exportBtn.textContent = 'Exporting...';

                try {
                    const data = localStorage.getItem('cyberWitchesSave') || '{}';
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `cyber-witches-save-${new Date().toISOString().slice(0,10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);

                    // Show success state
                    exportBtn.classList.remove('processing');
                    exportBtn.classList.add('success');
                    exportBtn.textContent = 'Export complete!';

                    if (window.showNotification) {
                        window.showNotification('Save data exported successfully.', 'success');
                    }

                    // Reset button after delay
                    setTimeout(() => {
                        exportBtn.classList.remove('modal-btn-feedback', 'success');
                        exportBtn.textContent = 'Export save';
                    }, 2000);
                } catch (e) {
                    console.error('Export failed:', e);
                    exportBtn.classList.remove('processing');
                    exportBtn.classList.add('error');
                    exportBtn.textContent = 'Export failed';

                    setTimeout(() => {
                        exportBtn.classList.remove('modal-btn-feedback', 'error');
                        exportBtn.textContent = 'Export save';
                    }, 2000);
                }
            });
        }

        const importBtn = document.getElementById('import-save-button');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'application/json,.json';
                input.addEventListener('change', async () => {
                    const file = input.files && input.files[0];
                    if (!file) return;

                    // Show processing state
                    importBtn.classList.add('modal-btn-feedback', 'processing');
                    importBtn.textContent = 'Importing...';

                    try {
                        const text = await file.text();
                        const data = JSON.parse(text);
                        const valid = this.gameState && this.gameState.validateSaveData
                            ? this.gameState.validateSaveData(data) : true;
                        if (!valid) {
                            importBtn.classList.remove('processing');
                            importBtn.classList.add('error');
                            importBtn.textContent = 'Invalid save file';

                            if (window.showNotification) {
                                window.showNotification('Invalid save file format.', 'error');
                            }

                            setTimeout(() => {
                                importBtn.classList.remove('modal-btn-feedback', 'error');
                                importBtn.textContent = 'Import save';
                            }, 2000);
                            return;
                        }

                        importBtn.classList.remove('processing');
                        importBtn.classList.add('success');
                        importBtn.textContent = 'Import successful!';

                        if (window.showNotification) {
                            window.showNotification('Save data imported. Reloading...', 'success');
                        }

                        // Delay reload slightly to show success state
                        setTimeout(() => {
                            localStorage.setItem('cyberWitchesSave', JSON.stringify(data));
                            window.location.reload();
                        }, 500);
                    } catch (e) {
                        console.error('Import failed:', e);
                        importBtn.classList.remove('processing');
                        importBtn.classList.add('error');
                        importBtn.textContent = 'Import failed';

                        if (window.showNotification) {
                            window.showNotification('Could not read that save file.', 'error');
                        }

                        setTimeout(() => {
                            importBtn.classList.remove('modal-btn-feedback', 'error');
                            importBtn.textContent = 'Import save';
                        }, 2000);
                    }
                });
                input.click();
            });
        }
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
            // CRITICAL: remove the `hidden` utility class. It is `display:none
            // !important`, so the inline `display:flex` below cannot override it —
            // without this, NO modal (prestige, help, settings, welcome-back) ever
            // actually became visible to the user.
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
            modal.classList.add('active');
            // Force visibility
            modal.style.pointerEvents = 'auto';
            modal.style.visibility = 'visible';
            modal.style.opacity = '1';

            this.activeModal = modal;

            // Accessibility / keyboard behavior — the practical value of a native
            // <dialog>, delivered without rewriting the (recently-repaired) modal
            // markup/CSS:
            //  - remember what had focus, then move focus into the modal
            //  - Escape closes; Tab is trapped inside the modal
            //  - focus is restored to the trigger on close
            this._lastFocused = document.activeElement;
            const focusables = this._getFocusable(modal);
            if (focusables.length > 0) {
                focusables[0].focus();
            } else {
                modal.tabIndex = -1;
                modal.focus();
            }
            document.addEventListener('keydown', this._onModalKeydown, true);

            if (window.announceToScreenReader) {
                window.announceToScreenReader(`${modalName} modal opened`, 'polite');
            }
        }
    }

    /**
     * Focusable elements within a container, in DOM order (visible ones only).
     * @returns {HTMLElement[]}
     */
    _getFocusable(container) {
        const sel = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const els = /** @type {HTMLElement[]} */ (Array.from(container.querySelectorAll(sel)));
        return els.filter((el) => el.offsetParent !== null || el === document.activeElement);
    }

    /** Escape-to-close + Tab focus-trap for the active managed modal. */
    _onModalKeydown(e) {
        const modal = this.activeModal;
        if (!modal) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            const name = Object.keys(this.modals).find((k) => this.modals[k] === modal);
            if (name) this.closeModal(name);
            return;
        }

        if (e.key === 'Tab') {
            const focusables = this._getFocusable(modal);
            if (focusables.length === 0) {
                e.preventDefault();
                return;
            }
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement;
            if (e.shiftKey && active === first) {
                e.preventDefault();
                /** @type {HTMLElement} */ (last).focus();
            } else if (!e.shiftKey && active === last) {
                e.preventDefault();
                /** @type {HTMLElement} */ (first).focus();
            }
        }
    }

    closeModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            // Restore the `hidden` class (paired with openModal removing it).
            modal.classList.add('hidden');
            modal.style.display = 'none';
            modal.classList.remove('active');
            modal.style.pointerEvents = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';

            if (this.activeModal === modal) {
                this.activeModal = null;
                // Tear down the keyboard trap and restore focus to whatever opened
                // the modal (falls back to no-op if that element is gone).
                document.removeEventListener('keydown', this._onModalKeydown, true);
                const last = /** @type {any} */ (this._lastFocused);
                if (last && typeof last.focus === 'function') {
                    last.focus();
                }
                this._lastFocused = null;
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

        const gain = this.gameState.calculatePrestigeGain();
        // Null-safe: previously `getElementById('prestige-ek')` was missing from
        // the markup, so this threw and the ascension modal never opened.
        const ekEl = document.getElementById('prestige-ek');
        if (ekEl) ekEl.textContent = this.gameState.prestigePoints;
        const gainEl = document.getElementById('prestige-gain');
        if (gainEl) gainEl.textContent = gain;

        const ascendButton = /** @type {HTMLButtonElement} */ (document.getElementById('ascend-button'));
        if (ascendButton) {
            ascendButton.disabled = gain <= 0;
        }

        this.openModal('prestige');
    }

    showWelcomeBack(elapsed, abGained, formatTimeDuration, formatShort) {
        if (!this.modals.welcomeBack) return;

        const timeEl = document.getElementById('welcome-time');
        const abEl = document.getElementById('welcome-ab');

        if (timeEl) timeEl.innerHTML = `<span class="css-icon-clock"></span> Away for: ${escapeHtml(formatTimeDuration(elapsed))}`;
        if (abEl) abEl.innerHTML = `<span class="css-icon-sparkle"></span> Earned: ${escapeHtml(formatShort(abGained))} AB`;

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
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'story-intro-title');

        const content = document.createElement('div');
        content.className = 'story-intro-content';
        content.tabIndex = -1;

        content.innerHTML = `
            <h1 class="story-title" id="story-intro-title">Hex Compiler</h1>
            <p class="story-text-secondary">The Story of The Fading</p>
            <p class="story-text">
                Magic is dying. The world's spell energy is fading, and once it's gone, it won't return.
            </p>
            <p class="story-text">
                You are a <strong class="text-success">Hex Compiler</strong>—one of the last who knows how to preserve magic by crystallizing it into permanent structures.
            </p>
            <p class="story-text">
                Cast to gather essence. Build workstations to preserve it. Ascend when this plane runs dry and carry stronger preservation strategies forward.
            </p>
            <button class="btn-primary story-button" id="close-story-intro">Begin Preservation</button>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        const closeStory = () => {
            localStorage.setItem('hasSeenStoryIntroduction', 'true');
            modal.remove();
            document.removeEventListener('keydown', closeOnEscape);
            clearTimeout(autoCloseTimer);
            document.getElementById('cast-button')?.focus();
        };
        const closeOnEscape = (e) => {
            if (e.key === 'Escape') closeStory();
        };

        const closeBtn = modal.querySelector('#close-story-intro');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeStory);
        }

        // Click-on-overlay-to-dismiss (clicks on the dark backdrop, not the content card)
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeStory();
        });

        document.addEventListener('keydown', closeOnEscape);
        content.focus();

        // Safety: auto-dismiss after 30 seconds so the game is never permanently
        // blocked if the user misses the close button or the button fails.
        // 30s gives screen reader users and users with motor impairments
        // adequate time (WCAG 2.2.1 Timing Adjustable).
        const autoCloseTimer = setTimeout(() => {
            console.warn('Story intro auto-dismissed after 30s timeout.');
            closeStory();
        }, 30_000);
    }

    showMeditationStoryIntroduction() {
        const modal = document.createElement('div');
        modal.className = 'meditation-story-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'meditation-story-title');

        const content = document.createElement('div');
        content.className = 'meditation-story-content';
        content.tabIndex = -1;

        content.innerHTML = `
            <h1 class="story-title" id="meditation-story-title">The Mental Defense</h1>
            <p class="story-text">
                As magic fades, the chaos and despair create <strong class="text-error">Distractions</strong>—mental intrusions that break your focus.
            </p>
            <p class="story-text">
                The fading doesn't just drain magic; it attacks your mind. Doubt, despair, and chaos seep in, making it harder to preserve what remains.
            </p>
            <p class="story-text-secondary">
                You've learned to defend your mind. <strong class="text-success">Meditation</strong> is your mental fortress—a space where you use preserved materials to build towers of focus.
            </p>
            <p class="story-text-secondary">
                These towers defend your <strong class="text-success">Tranquility</strong> against waves of Distractions. The more focused you are, the better you can preserve magic.
            </p>
            <button class="btn-primary story-button" id="close-meditation-story">Enter Meditation</button>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('#close-meditation-story');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });
        }
        content.focus();
    }

    showFullStoryModal() {
        const modal = document.createElement('div');
        modal.className = 'full-story-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'full-story-title');

        const content = document.createElement('div');
        content.className = 'full-story-content';
        content.tabIndex = -1;

        content.innerHTML = `
            <div class="full-story-header">
                <h1 class="story-title mb-10" id="full-story-title">Hex Compiler</h1>
                <p class="story-text-secondary mb-0">The Story of The Fading</p>
            </div>
            
            <div class="full-story-body">
                <h2 class="full-story-section-title">The Premise</h2>
                <p class="story-text">
                    Magic is dying. The world's spell energy is fading, and once it's gone, it won't return. You are a <strong class="text-success">Hex Compiler</strong>—one of the last who knows how to preserve magic by crystallizing it into permanent structures.
                </p>
                
                <h2 class="full-story-section-title">The Urgency</h2>
                <p class="story-text">
                    Every spell you cast pulls energy from a dwindling pool. If you don't act, magic will be gone forever. Your workstations are preservation chambers—structures that capture and hold spell energy before it fades.
                </p>
                
                <h2 class="full-story-section-title">The Journey</h2>
                
                <h3 class="full-story-subsection-title">Early Game</h3>
                <p class="story-text">
                    You cast desperate spells, gathering what elemental essences remain. Fire, Water, Air, Crystal—each element fades at a different rate. You build basic workstations (Forges, Wells, Generators, Chambers) to stabilize these essences into materials that won't fade.
                </p>
                
                <h3 class="full-story-subsection-title">Mid Game</h3>
                <p class="story-text">
                    You've learned to combine preserved materials into more stable forms. Some workstations can generate Arcane Bits—they're not just preserving magic, they're creating self-sustaining loops that slow the fading.
                </p>
                
                <h3 class="full-story-subsection-title">Late Game</h3>
                <p class="story-text">
                    You're building quantum and void-level structures—the most stable forms possible. These are your last hope to preserve magic in forms that might outlast the fading.
                </p>
                
                <h3 class="full-story-subsection-title">Meditation - The Mental Defense</h3>
                <p class="story-text">
                    As magic fades, the chaos and despair create <strong class="text-error">Distractions</strong>—mental intrusions that break your focus. The fading doesn't just drain magic; it attacks your mind. Doubt, despair, and chaos seep in, making it harder to preserve what remains.
                </p>
                <p class="story-text">
                    After your first Ascension, you learn to defend your mind. <strong class="text-success">Meditation</strong> is your mental fortress—a space where you use preserved materials to build towers of focus. These towers defend your <strong class="text-success">Tranquility</strong> against waves of Distractions.
                </p>
                
                <h3 class="full-story-subsection-title">Ascension - The Elemental Choice</h3>
                <p class="story-text">
                    This plane is too far gone. You've learned all you can here. As you prepare to Ascend to other realms where magic still exists, you must choose how you'll approach preservation in the next realm. Each element offers a different strategy for fighting the fading:
                </p>
                <ul class="full-story-list">
                    <li class="full-story-list-item"><strong class="text-primary">Fire Path:</strong> Preserve through intensity. Build aggressive preservation structures that burn bright and fast.</li>
                    <li class="full-story-list-item"><strong class="text-secondary">Water Path:</strong> Preserve through efficiency. Build balanced structures that flow smoothly.</li>
                    <li class="full-story-list-item"><strong class="text-accent">Air Path:</strong> Preserve through speed. Unlock preservation techniques faster—time is running out.</li>
                    <li class="full-story-list-item"><strong class="text-success">Crystal Path:</strong> Preserve through stability. Build universal foundations that support all elements.</li>
                </ul>
                <p class="mb-15">
                    You carry your chosen preservation technique forward. Each realm teaches you more, but the fading follows you—you must work faster, build better, preserve more.
                </p>
            </div>
            
            <div class="text-center mt-30">
                <button class="btn-primary story-button" id="close-full-story">Close</button>
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
        content.focus();
    }

    showElementSpecializationChoice(ELEMENT_SPECIALIZATIONS, updateAllUI) {
        // Don't show if already has specialization
        if (this.gameState.elementSpecialization) {
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'specialization-modal';
        // Styles moved to CSS

        const content = document.createElement('div');
        content.className = 'specialization-content';
        // Styles moved to CSS

        content.innerHTML = `
            <h2 class="specialization-title">
                Choose Your Preservation Strategy
            </h2>
            <p class="specialization-subtitle">
                This plane is too far gone. You've learned all you can here. As you prepare to Ascend to other realms where magic still exists, you must choose how you'll approach preservation in the next realm. Each element offers a different strategy for fighting the fading.
            </p>
            <div class="element-choices-grid">
                ${Object.values(ELEMENT_SPECIALIZATIONS).map(spec => `
                    <div class="element-choice-card" data-element="${escapeHtml(spec.id)}">
                        <div class="element-icon-large">${escapeHtml(spec.icon)}</div>
                        <h3 class="element-choice-name">${escapeHtml(spec.name)}</h3>
                        <p class="element-choice-desc">${escapeHtml(spec.description)}</p>
                        <div class="element-bonuses-list">
                            ${Object.entries(spec.bonuses).map(([key, value]) => {
        let display = '';
        if (key === 'baseProductionMult') display = `+${((value - 1) * 100).toFixed(0)}% ${escapeHtml(spec.id)} production`;
        else if (key === 'abProductionMult') display = `+${((value - 1) * 100).toFixed(0)}% AB from ${escapeHtml(spec.id)} reactors`;
        else if (key === 'costReduction') display = `-${(value * 100).toFixed(0)}% ${escapeHtml(spec.id)} costs`;
        else if (key === 'castRewardMult') display = `+${((value - 1) * 100).toFixed(0)}% cast rewards`;
        else if (key === 'globalProductionMult') display = `+${((value - 1) * 100).toFixed(0)}% all production`;
        else if (key === 'ingredientProductionMult') display = `+${((value - 1) * 100).toFixed(0)}% ingredient production`;
        else if (key === 'unlockSpeedMult') display = `Unlock ${((1 - value) * 100).toFixed(0)}% earlier`;
        else if (key === 'productionSpeedMult') display = `+${((value - 1) * 100).toFixed(0)}% production speed`;
        else if (key === 'castSpeedMult') display = `+${((value - 1) * 100).toFixed(0)}% cast speed`;
        else if (key === 'universalIngredientMult') display = `+${((value - 1) * 100).toFixed(0)}% universal ingredients`;
        else if (key === 'bottleneckCostReduction') display = `-${(value * 100).toFixed(0)}% bottleneck costs`;
        else if (key === 'crystalBuildingMult') display = `+${((value - 1) * 100).toFixed(0)}% Crystal building production`;
        return `<div class="element-bonus-item">${escapeHtml(display)}</div>`;
    }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Add hover effects and click handlers
        const choices = /** @type {NodeListOf<HTMLElement>} */ (modal.querySelectorAll('.element-choice-card'));
        choices.forEach(choice => {
            // Hover effects handled by CSS

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
            const previousFocus = document.activeElement;

            // Create modal overlay
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-labelledby', 'destructive-confirmation-title');
            overlay.setAttribute('aria-describedby', 'destructive-confirmation-text');

            // Create modal content
            const modal = document.createElement('div');
            modal.className = 'destructive-confirmation-modal';
            modal.tabIndex = -1;

            modal.innerHTML = `
                <h2 class="destructive-title" id="destructive-confirmation-title">${escapeHtml(title)}</h2>
                <p class="destructive-text" id="destructive-confirmation-text">${escapeHtml(message)}</p>
                <div class="destructive-input-container">
                    <label class="destructive-input-label" for="destructive-confirm-input">
                        Type "${escapeHtml(confirmText)}" to confirm:
                    </label>
                    <input type="text" id="destructive-confirm-input"
                        class="destructive-input"
                        autocomplete="off" spellcheck="false">
                </div>
                <div class="destructive-actions">
                    <button id="destructive-confirm-cancel" class="btn-secondary destructive-btn">Cancel</button>
                    <button id="destructive-confirm-ok" class="btn-danger destructive-btn" disabled>Confirm</button>
                </div>
            `;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            const input = /** @type {HTMLInputElement} */ (modal.querySelector('#destructive-confirm-input'));
            const cancelBtn = /** @type {HTMLButtonElement} */ (modal.querySelector('#destructive-confirm-cancel'));
            const okBtn = /** @type {HTMLButtonElement} */ (modal.querySelector('#destructive-confirm-ok'));

            const cleanup = (value) => {
                if (overlay.parentNode) document.body.removeChild(overlay);
                document.removeEventListener('keydown', escapeHandler);
                const focusTarget = /** @type {any} */ (previousFocus);
                if (focusTarget && typeof focusTarget.focus === 'function') focusTarget.focus();
                resolve(value);
            };

            // Enable OK button when text matches
            input.addEventListener('input', (e) => {
                okBtn.disabled = /** @type {HTMLInputElement} */ (e.target).value !== confirmText;
            });

            // Handle Enter key
            input.addEventListener('keydown', (/** @type {KeyboardEvent} */ e) => {
                if (e.key === 'Enter' && !okBtn.disabled) {
                    okBtn.click();
                }
            });

            // Focus input
            input.focus();

            // Cancel handler
            cancelBtn.addEventListener('click', () => {
                cleanup(false);
            });

            // Confirm handler
            okBtn.addEventListener('click', () => {
                if (input.value === confirmText) {
                    cleanup(true);
                }
            });

            // Close on overlay click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    cleanup(false);
                }
            });

            // Close on Escape
            const escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    cleanup(false);
                }
            };
            document.addEventListener('keydown', escapeHandler);
        });
    }

    initPasteImportValidation() {
        const importData = /** @type {HTMLTextAreaElement} */ (document.getElementById('import-data'));
        const importError = document.getElementById('import-error');
        const pasteImportButton = document.getElementById('paste-import-button');

        if (!importData || !importError) return;

        const validate = () => {
            const val = importData.value.trim();
            if (!val) {
                importData.setAttribute('aria-invalid', 'true');
                importError.textContent = '> ERROR: Save data required';
                importError.classList.add('visible');
                return false;
            }
            try {
                JSON.parse(val);
                importData.setAttribute('aria-invalid', 'false');
                importError.classList.remove('visible');
                return true;
            } catch {
                importData.setAttribute('aria-invalid', 'true');
                importError.textContent = '> ERROR: Invalid JSON format';
                importError.classList.add('visible');
                return false;
            }
        };

        // Validate on blur and during input when already invalid
        importData.addEventListener('blur', validate);
        importData.addEventListener('input', () => {
            if (importData.getAttribute('aria-invalid') === 'true') {
                validate();
            }
        });

        // Handle paste import button
        if (pasteImportButton) {
            pasteImportButton.addEventListener('click', () => {
                if (!validate()) {
                    if (window.showNotification) {
                        window.showNotification('Please fix validation errors before importing.', 'error');
                    }
                    return;
                }

                try {
                    const data = JSON.parse(importData.value.trim());
                    const valid = this.gameState && this.gameState.validateSaveData
                        ? this.gameState.validateSaveData(data) : true;

                    if (!valid) {
                        importData.setAttribute('aria-invalid', 'true');
                        importError.textContent = '> ERROR: Invalid save file format';
                        importError.classList.add('visible');

                        if (window.showNotification) {
                            window.showNotification('Invalid save file format.', 'error');
                        }
                        return;
                    }

                    // Success - import the data
                    pasteImportButton.classList.add('modal-btn-feedback', 'processing');
                    pasteImportButton.textContent = 'Importing...';

                    if (window.showNotification) {
                        window.showNotification('Save data imported. Reloading...', 'success');
                    }

                    setTimeout(() => {
                        localStorage.setItem('cyberWitchesSave', JSON.stringify(data));
                        window.location.reload();
                    }, 500);
                } catch (e) {
                    console.error('Import failed:', e);
                    importData.setAttribute('aria-invalid', 'true');
                    importError.textContent = '> ERROR: Import failed';
                    importError.classList.add('visible');

                    pasteImportButton.classList.remove('processing');
                    pasteImportButton.classList.add('error');
                    pasteImportButton.textContent = 'Import failed';

                    if (window.showNotification) {
                        window.showNotification('Could not import save data.', 'error');
                    }

                    setTimeout(() => {
                        pasteImportButton.classList.remove('modal-btn-feedback', 'error');
                        pasteImportButton.textContent = 'Import Pasted Data';
                    }, 2000);
                }
            });
        }
    }
}
