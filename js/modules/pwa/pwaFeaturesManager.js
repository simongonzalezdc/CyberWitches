/**
 * Modern PWA Features System
 * Implements 2025 PWA capabilities
 */

import { stripEmojisIfLowTier } from '../ui/uiHelpers.js';

export class PWAFeaturesManager {
    /**
     * @param {Object} gameState - The game state
     * @param {Object} uiManager - The UI manager
     */
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.serviceWorker = null;
        this.deferredPrompt = null;
    }

    init() {
        // Register service worker
        this.registerServiceWorker();

        // Set up Web Share API
        this.setupWebShare();

        // Set up File System Access API
        this.setupFileSystemAccess();

        // Set up Background Sync
        this.setupBackgroundSync();

        // Set up Web Push Notifications
        this.setupPushNotifications();

        // Set up Install Prompt
        this.setupInstallPrompt();
    }

    /**
     * Register service worker
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
                this.serviceWorker = registration;
                console.info('Service Worker registered:', registration);
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    /**
     * Set up Web Share API
     */
    setupWebShare() {
        if ('share' in navigator) {
            // Add share button to UI if needed
            // We attach to window for button onclick handlers if they exist in HTML
            // But ideally we should attach listeners in init()
            const shareBtn = document.getElementById('share-button');
            if (shareBtn) {
                shareBtn.addEventListener('click', async () => {
                    try {
                        await navigator.share({
                            title: 'Hex Compiler — Browser Idle Game',
                            text: 'Magic is fading. Play as a Hex Compiler preserving spells in code.',
                            url: window.location.href
                        });
                    } catch (error) {
                        if (error.name !== 'AbortError') {
                            console.error('Share failed:', error);
                        }
                    }
                });
            }
        }
    }

    /**
     * Set up File System Access API
     */
    setupFileSystemAccess() {
        if ('showSaveFilePicker' in window) {
            // Export save data
            const exportBtn = document.getElementById('export-save-button');
            if (exportBtn) {
                exportBtn.addEventListener('click', async () => {
                    try {
                        const fileHandle = await window.showSaveFilePicker({
                            suggestedName: 'cyber-witches-save.json',
                            types: [{
                                description: 'JSON files',
                                accept: { 'application/json': ['.json'] }
                            }]
                        });

                        const writable = await fileHandle.createWritable();
                        const saveData = localStorage.getItem('cyberWitchesSave');
                        await writable.write(saveData);
                        await writable.close();

                        if (this.uiManager && this.uiManager.showNotification) {
                            this.uiManager.showNotification('Save data exported successfully!', 'success');
                        }
                    } catch (error) {
                        if (error.name !== 'AbortError') {
                            console.error('Export failed:', error);
                        }
                    }
                });
            }

            // Import save data
            const importBtn = document.getElementById('import-save-button');
            if (importBtn) {
                importBtn.addEventListener('click', async () => {
                    try {
                        const [fileHandle] = await window.showOpenFilePicker({
                            types: [{
                                description: 'JSON files',
                                accept: { 'application/json': ['.json'] }
                            }]
                        });

                        const file = await fileHandle.getFile();
                        const text = await file.text();
                        const saveData = JSON.parse(text);

                        // Validate save data
                        if (this.gameState && this.gameState.validateSaveData) {
                            if (this.gameState.validateSaveData(saveData)) {
                                localStorage.setItem('cyberWitchesSave', JSON.stringify(saveData));
                                if (this.uiManager && this.uiManager.showNotification) {
                                    this.uiManager.showNotification('Save data imported successfully!', 'success');
                                }
                                // Reload game
                                location.reload();
                            } else {
                                if (this.uiManager && this.uiManager.showNotification) {
                                    this.uiManager.showNotification('Invalid save data file', 'error');
                                }
                            }
                        }
                    } catch (error) {
                        if (error.name !== 'AbortError') {
                            console.error('Import failed:', error);
                        }
                    }
                });
            }
        }
    }

    /**
     * Set up Background Sync
     */
    setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            // Background sync for offline actions
            // This would typically be triggered by specific actions
        }
    }

    /**
     * Set up Web Push Notifications
     */
    setupPushNotifications() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            // Request notification permission
            if (Notification.permission === 'default') {
                // Could request permission here
            }
        }
    }

    /**
     * Set up Install Prompt
     */
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;

            // Show install button
            const installButton = document.getElementById('install-pwa-button');
            if (installButton) {
                installButton.style.display = 'block';
                // Remove old listeners
                const newBtn = installButton.cloneNode(true);
                installButton.parentNode.replaceChild(newBtn, installButton);

                newBtn.addEventListener('click', async () => {
                    this.handleInstallButtonClick();
                });
            }

            // Show welcome/install modal for first-time users
            if (!localStorage.getItem('installPromptShown')) {
                this.showInstallWelcomeModal();
                localStorage.setItem('installPromptShown', 'true');
            } else if (this.uiManager && this.uiManager.showNotification) {
                this.uiManager.showNotification('Install Cyber Witches for offline play.', 'info', 5000);
            }
        });

        window.addEventListener('appinstalled', () => {
            this.deferredPrompt = null;
            console.info('PWA was installed');
            if (this.uiManager && this.uiManager.showNotification) {
                this.uiManager.showNotification('App installed successfully!', 'success');
            }
        });
    }
    /**
     * Handle install button click
     */
    async handleInstallButtonClick() {
        if (this.deferredPrompt) {
            try {
                // Show install prompt (BeforeInstallPromptEvent — not in the standard
                // DOM lib, so treat as `any`).
                const deferredPrompt = /** @type {any} */ (this.deferredPrompt);
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;

                if (outcome === 'accepted') {
                    console.info('User accepted install prompt');
                    if (this.uiManager && this.uiManager.showNotification) {
                        this.uiManager.showNotification('<span class="css-icon-celebration"></span> Installing Cyber Witches...', 'success');
                    }
                    // Hide install button
                    const installButton = document.getElementById('install-app-button');
                    if (installButton) {
                        installButton.style.display = 'none';
                    }
                } else {
                    console.info('User dismissed install prompt');
                }

                this.deferredPrompt = null;
            } catch (error) {
                console.error('Error showing install prompt:', error);
                // Fallback: show manual installation instructions
                this.showInstallInstructions();
            }
        } else {
            // No prompt available, show manual instructions
            this.showInstallInstructions();
        }
    }

    /**
     * Show welcome/install modal for first-time users
     */
    showInstallWelcomeModal() {
        const modal = document.createElement('div');
        modal.id = 'install-welcome-modal';
        modal.className = 'install-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'install-welcome-title');
        modal.innerHTML = `
            <div class="install-modal-content">
                <div class="install-modal-header">
                    <h2 id="install-welcome-title">${stripEmojisIfLowTier('Welcome to Cyber Witches')}</h2>
                    <button class="install-modal-close" aria-label="Close">&times;</button>
                </div>
                <div class="install-modal-body">
                    <p><strong>Install the app for the best experience:</strong></p>
                    <ul class="install-benefits">
                        <li>${stripEmojisIfLowTier('Play offline - no internet required')}</li>
                        <li>${stripEmojisIfLowTier('Auto-save - your progress is always safe')}</li>
                        <li>${stripEmojisIfLowTier('Faster startup - launch like a desktop app')}</li>
                        <li>${stripEmojisIfLowTier('Full screen - immersive gameplay')}</li>
                    </ul>
                    <div class="install-modal-actions">
                        <button id="install-welcome-button" class="btn-primary btn-install-large">
                            Install Now
                        </button>
                        <button class="btn-secondary install-modal-skip">Maybe Later</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close button
        const closeBtn = modal.querySelector('.install-modal-close');
        const skipBtn = modal.querySelector('.install-modal-skip');
        const installBtn = modal.querySelector('#install-welcome-button');

        closeBtn.addEventListener('click', () => modal.remove());
        skipBtn.addEventListener('click', () => modal.remove());

        // Install button
        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                const prompt = /** @type {any} */ (this.deferredPrompt);
                if (prompt) {
                    try {
                        prompt.prompt();
                        const { outcome } = await prompt.userChoice;
                        if (outcome === 'accepted') {
                            modal.remove();
                        }
                    } catch (error) {
                        console.error('Error showing install prompt:', error);
                        this.showInstallInstructions();
                        modal.remove();
                    }
                } else {
                    // No prompt available, show instructions
                    this.showInstallInstructions();
                    modal.remove();
                }
            });
        }

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * Show manual installation instructions based on platform
     */
    showInstallInstructions() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
        const isEdge = /Edge/.test(navigator.userAgent);
        // const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent); // Unused

        let instructions;

        if (isIOS) {
            instructions = `
                <h3>${stripEmojisIfLowTier('Install on iOS Safari')}</h3>
                <ol>
                    <li>Tap the <strong>Share</strong> button at the bottom</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                    <li>Tap <strong>"Add"</strong> to confirm</li>
                    <li>Launch from your home screen!</li>
                </ol>
            `;
        } else if (isAndroid) {
            instructions = `
                <h3>${stripEmojisIfLowTier('Install on Android')}</h3>
                <ol>
                    <li>Tap the <strong>Menu</strong> button (three dots)</li>
                    <li>Select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></li>
                    <li>Tap <strong>"Install"</strong> to confirm</li>
                    <li>Launch from your home screen!</li>
                </ol>
            `;
        } else if (isChrome || isEdge) {
            instructions = `
                <h3>${stripEmojisIfLowTier('Install on Desktop Chrome/Edge')}</h3>
                <ol>
                    <li>Look for the <strong>Install</strong> icon in the address bar</li>
                    <li>Click it and select <strong>"Install"</strong></li>
                    <li>Or use the <strong>"Install"</strong> button in the top bar</li>
                    <li>Launch from your desktop or app menu!</li>
                </ol>
            `;
        } else {
            instructions = `
                <h3>${stripEmojisIfLowTier('Install Instructions')}</h3>
                <p>Look for an <strong>"Install"</strong> or <strong>"Add to Home Screen"</strong> option in your browser menu.</p>
                <p>On desktop: Check the address bar for an install icon.</p>
                <p>On mobile: Use the browser's share menu to add to home screen.</p>
            `;
        }

        const modal = document.createElement('div');
        modal.className = 'install-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'install-instructions-title');
        modal.innerHTML = `
            <div class="install-modal-content">
                <div class="install-modal-header">
                    <h2 id="install-instructions-title">${stripEmojisIfLowTier('How to Install')}</h2>
                    <button class="install-modal-close" aria-label="Close">&times;</button>
                </div>
                <div class="install-modal-body">
                    ${instructions}
                    <div class="install-modal-actions">
                        <button class="btn-primary install-modal-close">Got it!</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.install-modal-close');
        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
}
