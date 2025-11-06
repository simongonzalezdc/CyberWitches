/**
 * Modern PWA Features System
 * Implements 2025 PWA capabilities
 */

class PWAFeaturesManager {
    constructor() {
        this.serviceWorker = null;
        this.init();
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
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                this.serviceWorker = registration;
                console.log('Service Worker registered:', registration);
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
            window.shareGame = async () => {
                try {
                    await navigator.share({
                        title: 'Cyber Witches: Idle Coven',
                        text: 'Check out this amazing idle game!',
                        url: window.location.href
                    });
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.error('Share failed:', error);
                    }
                }
            };
        }
    }
    
    /**
     * Set up File System Access API
     */
    setupFileSystemAccess() {
        if ('showSaveFilePicker' in window) {
            window.exportSaveData = async () => {
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
                    
                    if (window.showNotification) {
                        window.showNotification('Save data exported successfully!', 'success');
                    }
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.error('Export failed:', error);
                    }
                }
            };
            
            window.importSaveData = async () => {
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
                    if (window.gameState && window.gameState.validateSaveData) {
                        if (window.gameState.validateSaveData(saveData)) {
                            localStorage.setItem('cyberWitchesSave', JSON.stringify(saveData));
                            if (window.showNotification) {
                                window.showNotification('Save data imported successfully!', 'success');
                            }
                            // Reload game
                            location.reload();
                        } else {
                            if (window.showNotification) {
                                window.showNotification('Invalid save data file', 'error');
                            }
                        }
                    }
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.error('Import failed:', error);
                    }
                }
            };
        }
    }
    
    /**
     * Set up Background Sync
     */
    setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            // Background sync for offline actions
            window.syncOfflineActions = async () => {
                const registration = await navigator.serviceWorker.ready;
                try {
                    await registration.sync.register('offline-actions');
                } catch (error) {
                    console.error('Background sync registration failed:', error);
                }
            };
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
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Show install button
            const installButton = document.getElementById('install-pwa-button');
            if (installButton) {
                installButton.style.display = 'block';
                installButton.addEventListener('click', async () => {
                    if (deferredPrompt) {
                        deferredPrompt.prompt();
                        const { outcome } = await deferredPrompt.userChoice;
                        console.log('Install prompt outcome:', outcome);
                        deferredPrompt = null;
                        installButton.style.display = 'none';
                    }
                });
            }
        });
    }
}

// Create global instance
const pwaFeaturesManager = new PWAFeaturesManager();

export default pwaFeaturesManager;

