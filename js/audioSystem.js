import { handleError, safeFunction } from './errorHandler.js';

/**
 * Audio System - Manages sound effects and audio playback
 * Provides toggle functionality and audio management
 */

/**
 * @typedef {Object} SoundEffect
 * @property {string} id - Unique sound identifier
 * @property {string} name - Sound display name
 * @property {string} url - Sound file URL
 * @property {HTMLAudioElement} audio - Audio element
 * @property {number} volume - Sound volume (0-1)
 * @property {boolean} loop - Whether sound should loop
 * @property {number} fadeIn - Fade in duration in milliseconds
 * @property {number} fadeOut - Fade out duration in milliseconds
 */

/**
 * Audio System class
 */
export class AudioSystem {
    /**
     * Create a new AudioSystem instance
     */
    constructor() {
        this.audioContext = null;
        this.masterGainNode = null;
        this.soundEffects = new Map();
        this.musicTracks = new Map();
        this.currentMusicTrack = null;
        
        // Audio settings
        this.isMuted = this.getMutedStatus();
        this.masterVolume = this.getMasterVolume();
        this.sfxVolume = this.getSfxVolume();
        this.musicVolume = this.getMusicVolume();
        
        // Audio state
        this.isInitialized = false;
        this.isAudioSupported = this.checkAudioSupport();
        this.audioUnlockRequired = this.checkAudioUnlockRequired();
        
        // Performance settings
        this.maxConcurrentSounds = 8;
        this.activeSounds = [];
        
        // Initialize audio system
        this.initializeAudio();
        
        // Load default sounds
        this.loadDefaultSounds();
        
        // Listen for visibility changes to pause/resume audio
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }
    
    /**
     * Initialize audio system
     * @private
     */
    initializeAudio() {
        try {
            // Create audio context
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.audioContext = new AudioContextClass();
                this.masterGainNode = this.audioContext.createGain();
                this.masterGainNode.connect(this.audioContext.destination);
                this.isInitialized = true;
            }
        } catch (error) {
            handleError(error, 'audioInitialize');
            this.isInitialized = false;
        }
    }
    
    /**
     * Check if audio is supported
     * @returns {boolean} Whether audio is supported
     * @private
     */
    checkAudioSupport() {
        return !!(window.AudioContext || window.webkitAudioContext || window.Audio);
    }
    
    /**
     * Check if audio unlock is required
     * @returns {boolean} Whether audio unlock is required
     * @private
     */
    checkAudioUnlockRequired() {
        // Most browsers require user interaction before playing audio
        return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    }
    
    /**
     * Unlock audio context (requires user interaction)
     * @returns {Promise<boolean>} Whether unlock was successful
     */
    async unlockAudio() {
        if (!this.isInitialized || !this.audioUnlockRequired) {
            return true;
        }
        
        try {
            // Create and play a silent sound to unlock audio
            const silentBuffer = this.audioContext.createBuffer(1, 1, 22050);
            const source = this.audioContext.createBufferSource();
            source.buffer = silentBuffer;
            source.connect(this.audioContext.destination);
            source.start(0);
            
            this.audioUnlockRequired = false;
            return true;
        } catch (error) {
            handleError(error, 'audioUnlock');
            return false;
        }
    }
    
    /**
     * Load default sound effects
     * @private
     */
    loadDefaultSounds() {
        // Define sound effects with data URLs (simplified for demo)
        const defaultSounds = [
            {
                id: 'click',
                name: 'Click',
                url: this.generateClickSound(),
                volume: 0.3,
                loop: false
            },
            {
                id: 'cast',
                name: 'Spell Cast',
                url: this.generateCastSound(),
                volume: 0.4,
                loop: false
            },
            {
                id: 'achievement',
                name: 'Achievement',
                url: this.generateAchievementSound(),
                volume: 0.5,
                loop: false
            },
            {
                id: 'level_up',
                name: 'Level Up',
                url: this.generateLevelUpSound(),
                volume: 0.6,
                loop: false
            },
            {
                id: 'purchase',
                name: 'Purchase',
                url: this.generatePurchaseSound(),
                volume: 0.4,
                loop: false
            },
            {
                id: 'error',
                name: 'Error',
                url: this.generateErrorSound(),
                volume: 0.3,
                loop: false
            },
            {
                id: 'notification',
                name: 'Notification',
                url: this.generateNotificationSound(),
                volume: 0.4,
                loop: false
            },
            {
                id: 'ritual_complete',
                name: 'Ritual Complete',
                url: this.generateRitualSound(),
                volume: 0.5,
                loop: false
            }
        ];
        
        // Load all sounds
        for (const soundData of defaultSounds) {
            this.loadSound(soundData);
        }
    }
    
    /**
     * Generate a click sound using Web Audio API
     * @returns {string} Data URL for click sound
     * @private
     */
    generateClickSound() {
        if (!this.isInitialized) {
            return '';
        }
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.05; // 50ms
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate click sound (short sine wave burst)
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 50); // Quick decay
            channelData[i] = Math.sin(2 * Math.PI * 800 * t) * envelope * 0.3; // 800Hz sine wave
        }
        
        return this.bufferToDataUrl(buffer);
    }
    
    /**
     * Generate a spell cast sound using Web Audio API
     * @returns {string} Data URL for cast sound
     * @private
     */
    generateCastSound() {
        if (!this.isInitialized) {
            return '';
        }
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.3; // 300ms
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate spell cast sound (sweeping sine wave)
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 3); // Medium decay
            const frequency = 400 + t * 600; // Sweep from 400Hz to 1000Hz
            channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.4;
        }
        
        return this.bufferToDataUrl(buffer);
    }
    
    /**
     * Generate an achievement sound using Web Audio API
     * @returns {string} Data URL for achievement sound
     * @private
     */
    generateAchievementSound() {
        if (!this.isInitialized) {
            return '';
        }
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.8; // 800ms
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate achievement sound (ascending chime)
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 2); // Slow decay
            
            // Create a chord of three frequencies
            const freq1 = 523.25; // C5
            const freq2 = 659.25; // E5
            const freq3 = 783.99; // G5
            
            const sample = (
                Math.sin(2 * Math.PI * freq1 * t) * 0.3 +
                Math.sin(2 * Math.PI * freq2 * t) * 0.2 +
                Math.sin(2 * Math.PI * freq3 * t) * 0.1
            ) * envelope;
            
            channelData[i] = sample;
        }
        
        return this.bufferToDataUrl(buffer);
    }
    
    /**
     * Generate a level up sound using Web Audio API
     * @returns {string} Data URL for level up sound
     * @private
     */
    generateLevelUpSound() {
        if (!this.isInitialized) {
            return '';
        }
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 1.0; // 1 second
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate level up sound (ascending arpeggio)
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 1.5); // Medium-slow decay
            
            // Create an arpeggio
            const noteIndex = Math.floor(t * 8) % 4;
            const baseFreq = 261.63; // C4
            const frequencies = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2]; // C4, E4, G4, C5
            
            const frequency = frequencies[noteIndex];
            channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.4;
        }
        
        return this.bufferToDataUrl(buffer);
    }
    
    /**
     * Generate a purchase sound using Web Audio API
     * @returns {string} Data URL for purchase sound
     * @private
     */
    generatePurchaseSound() {
        if (!this.isInitialized) {
            return '';
        }
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.2; // 200ms
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate purchase sound (positive confirmation)
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 10); // Fast decay
            
            // Create a pleasant confirmation sound
            const sample = (
                Math.sin(2 * Math.PI * 600 * t) * 0.3 +
                Math.sin(2 * Math.PI * 1200 * t) * 0.1
            ) * envelope;
            
            channelData[i] = sample;
        }
        
        return this.bufferToDataUrl(buffer);
    }
    
    /**
     * Generate an error sound using Web Audio API
     * @returns {string} Data URL for error sound
     * @private
     */
    generateErrorSound() {
        if (!this.isInitialized) {
            return '';
        }
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.3; // 300ms
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate error sound (descending tone)
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 5); // Fast decay
            
            // Create a descending tone
            const frequency = 300 - t * 200; // Descend from 300Hz to 100Hz
            channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
        }
        
        return this.bufferToDataUrl(buffer);
    }
    
    /**
     * Generate a notification sound using Web Audio API
     * @returns {string} Data URL for notification sound
     * @private
     */
    generateNotificationSound() {
        if (!this.isInitialized) {
            return '';
        }
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.4; // 400ms
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate notification sound (gentle ping)
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 4); // Medium decay
            
            // Create a gentle ping sound
            const sample = (
                Math.sin(2 * Math.PI * 800 * t) * 0.2 +
                Math.sin(2 * Math.PI * 1600 * t) * 0.1
            ) * envelope;
            
            channelData[i] = sample;
        }
        
        return this.bufferToDataUrl(buffer);
    }
    
    /**
     * Generate a ritual complete sound using Web Audio API
     * @returns {string} Data URL for ritual sound
     * @private
     */
    generateRitualSound() {
        if (!this.isInitialized) {
            return '';
        }
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 1.5; // 1.5 seconds
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate ritual complete sound (mystical chime)
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const envelope = Math.exp(-t * 0.8); // Slow decay
            
            // Create a mystical chime sound
            const sample = (
                Math.sin(2 * Math.PI * 440 * t) * 0.2 + // A4
                Math.sin(2 * Math.PI * 554.37 * t) * 0.15 + // C#5
                Math.sin(2 * Math.PI * 659.25 * t) * 0.1 + // E5
                Math.sin(2 * Math.PI * 880 * t) * 0.05 // A5
            ) * envelope;
            
            channelData[i] = sample;
        }
        
        return this.bufferToDataUrl(buffer);
    }
    
    /**
     * Convert audio buffer to data URL
     * @param {AudioBuffer} buffer - Audio buffer to convert
     * @returns {string} Data URL
     * @private
     */
    bufferToDataUrl(buffer) {
        const length = buffer.length * buffer.numberOfChannels * 2 + 44;
        const arrayBuffer = new ArrayBuffer(length);
        const view = new DataView(arrayBuffer);
        const channels = [];
        let offset = 0;
        let pos = 0;
        
        // Write WAVE header
        const setUint16 = (data) => {
            view.setUint16(pos, data, true);
            pos += 2;
        };
        
        const setUint32 = (data) => {
            view.setUint32(pos, data, true);
            pos += 4;
        };
        
        // RIFF identifier
        setUint32(0x46464952); // "RIFF"
        // File length
        setUint32(length - 8);
        // WAVE identifier
        setUint32(0x45564157); // "WAVE"
        // fmt chunk identifier
        setUint32(0x20746d66); // "fmt "
        // Chunk length
        setUint32(16);
        // Sample format (PCM)
        setUint16(1);
        // Channel count
        setUint16(buffer.numberOfChannels);
        // Sample rate
        setUint32(buffer.sampleRate);
        // Byte rate
        setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
        // Block align
        setUint16(buffer.numberOfChannels * 2);
        // Bits per sample
        setUint16(16);
        // data chunk identifier
        setUint32(0x61746164); // "data"
        // Data length
        setUint32(length - pos - 4);
        
        // Write interleaved data
        for (let i = 0; i < buffer.numberOfChannels; i++) {
            channels.push(buffer.getChannelData(i));
        }
        
        while (pos < length) {
            for (let i = 0; i < buffer.numberOfChannels; i++) {
                let sample = Math.max(-1, Math.min(1, channels[i][offset]));
                sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(pos, sample, true);
                pos += 2;
            }
            offset++;
        }
        
        const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
        return URL.createObjectURL(blob);
    }
    
    /**
     * Load a sound effect
     * @param {Object} soundData - Sound data
     * @returns {Promise<SoundEffect>} Loaded sound effect
     */
    async loadSound(soundData) {
        try {
            const sound = {
                id: soundData.id,
                name: soundData.name,
                url: soundData.url,
                audio: null,
                volume: soundData.volume || 0.5,
                loop: soundData.loop || false,
                fadeIn: soundData.fadeIn || 0,
                fadeOut: soundData.fadeOut || 0
            };
            
            // Create audio element
            if (soundData.url) {
                sound.audio = new Audio(soundData.url);
                sound.audio.preload = 'auto';
                
                // Wait for audio to load
                await new Promise((resolve, reject) => {
                    sound.audio.addEventListener('canplaythrough', resolve);
                    sound.audio.addEventListener('error', reject);
                });
            }
            
            this.soundEffects.set(soundData.id, sound);
            return sound;
        } catch (error) {
            handleError(error, 'loadSound');
            return null;
        }
    }
    
    /**
     * Play a sound effect
     * @param {string} soundId - Sound ID to play
     * @param {Object} options - Playback options
     * @returns {boolean} Whether sound was played successfully
     */
    playSound(soundId, options = {}) {
        if (!this.isAudioSupported || this.isMuted) {
            return false;
        }
        
        try {
            const sound = this.soundEffects.get(soundId);
            if (!sound) {
                console.warn(`Sound not found: ${soundId}`);
                return false;
            }
            
            // Check if we have too many concurrent sounds
            if (this.activeSounds.length >= this.maxConcurrentSounds) {
                return false;
            }
            
            // Clone audio element to allow overlapping sounds
            let audioElement;
            
            if (sound.audio) {
                audioElement = sound.audio.cloneNode();
            } else if (sound.url && this.audioContext) {
                // Create audio from URL using Web Audio API
                audioElement = new Audio(sound.url);
            } else {
                return false;
            }
            
            // Set audio properties
            audioElement.volume = (options.volume || sound.volume) * this.sfxVolume * this.masterVolume;
            audioElement.loop = options.loop || sound.loop;
            
            // Apply fade in if specified
            if (options.fadeIn || sound.fadeIn) {
                audioElement.volume = 0;
                const targetVolume = (options.volume || sound.volume) * this.sfxVolume * this.masterVolume;
                const fadeInDuration = options.fadeIn || sound.fadeIn;
                const fadeInSteps = 20;
                const fadeInStep = targetVolume / fadeInSteps;
                
                let currentStep = 0;
                const fadeInInterval = setInterval(() => {
                    currentStep++;
                    audioElement.volume = Math.min(targetVolume, currentStep * fadeInStep);
                    
                    if (currentStep >= fadeInSteps) {
                        clearInterval(fadeInInterval);
                    }
                }, fadeInDuration / fadeInSteps);
            }
            
            // Play the sound
            const playPromise = audioElement.play();
            
            // Handle play promise (if supported)
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    handleError(error, 'audioPlay');
                });
            }
            
            // Track active sound
            this.activeSounds.push({
                element: audioElement,
                id: soundId,
                startTime: Date.now()
            });
            
            // Remove from active sounds when finished
            audioElement.addEventListener('ended', () => {
                const index = this.activeSounds.findIndex(s => s.element === audioElement);
                if (index !== -1) {
                    this.activeSounds.splice(index, 1);
                }
            });
            
            return true;
        } catch (error) {
            handleError(error, 'playSound');
            return false;
        }
    }
    
    /**
     * Stop a sound effect
     * @param {string} soundId - Sound ID to stop
     * @param {boolean} fadeOut - Whether to fade out
     */
    stopSound(soundId, fadeOut = false) {
        const activeSound = this.activeSounds.find(s => s.id === soundId);
        if (!activeSound) {
            return;
        }
        
        const { element } = activeSound;
        
        if (fadeOut) {
            // Fade out the sound
            const initialVolume = element.volume;
            const fadeOutDuration = 500; // 500ms
            const fadeOutSteps = 20;
            const fadeOutStep = initialVolume / fadeOutSteps;
            
            let currentStep = 0;
            const fadeOutInterval = setInterval(() => {
                currentStep++;
                element.volume = Math.max(0, initialVolume - currentStep * fadeOutStep);
                
                if (currentStep >= fadeOutSteps || element.volume <= 0) {
                    clearInterval(fadeOutInterval);
                    element.pause();
                    element.currentTime = 0;
                }
            }, fadeOutDuration / fadeOutSteps);
        } else {
            // Stop immediately
            element.pause();
            element.currentTime = 0;
        }
        
        // Remove from active sounds
        const index = this.activeSounds.indexOf(activeSound);
        if (index !== -1) {
            this.activeSounds.splice(index, 1);
        }
    }
    
    /**
     * Stop all sound effects
     * @param {boolean} fadeOut - Whether to fade out sounds
     */
    stopAllSounds(fadeOut = false) {
        for (const activeSound of this.activeSounds) {
            if (fadeOut) {
                this.stopSound(activeSound.id, true);
            } else {
                this.stopSound(activeSound.id, false);
            }
        }
    }
    
    /**
     * Toggle mute state
     * @returns {boolean} New mute state
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.saveMutedStatus();
        
        // Apply mute state to all active sounds
        for (const activeSound of this.activeSounds) {
            activeSound.element.muted = this.isMuted;
        }
        
        return this.isMuted;
    }
    
    /**
     * Set master volume
     * @param {number} volume - Volume level (0-1)
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.saveMasterVolume();
        
        // Apply volume to all active sounds
        for (const activeSound of this.activeSounds) {
            const sound = this.soundEffects.get(activeSound.id);
            if (sound) {
                activeSound.element.volume = sound.volume * this.sfxVolume * this.masterVolume;
            }
        }
    }
    
    /**
     * Set sound effects volume
     * @param {number} volume - Volume level (0-1)
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.saveSfxVolume();
        
        // Apply volume to all active sounds
        for (const activeSound of this.activeSounds) {
            const sound = this.soundEffects.get(activeSound.id);
            if (sound) {
                activeSound.element.volume = sound.volume * this.sfxVolume * this.masterVolume;
            }
        }
    }
    
    /**
     * Handle visibility change events
     * @private
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Page hidden, pause all sounds
            for (const activeSound of this.activeSounds) {
                activeSound.element.pause();
            }
        } else {
            // Page visible, resume all sounds
            for (const activeSound of this.activeSounds) {
                activeSound.element.play().catch(error => {
                    handleError(error, 'audioResume');
                });
            }
        }
    }
    
    /**
     * Get muted status from localStorage
     * @returns {boolean} Muted status
     * @private
     */
    getMutedStatus() {
        const status = localStorage.getItem('cyberWitchesAudioMuted');
        return status === 'true';
    }
    
    /**
     * Save muted status to localStorage
     * @private
     */
    saveMutedStatus() {
        localStorage.setItem('cyberWitchesAudioMuted', this.isMuted.toString());
    }
    
    /**
     * Get master volume from localStorage
     * @returns {number} Master volume (0-1)
     * @private
     */
    getMasterVolume() {
        const volume = localStorage.getItem('cyberWitchesMasterVolume');
        return volume !== null ? parseFloat(volume) : 1.0;
    }
    
    /**
     * Save master volume to localStorage
     * @private
     */
    saveMasterVolume() {
        localStorage.setItem('cyberWitchesMasterVolume', this.masterVolume.toString());
    }
    
    /**
     * Get sound effects volume from localStorage
     * @returns {number} SFX volume (0-1)
     * @private
     */
    getSfxVolume() {
        const volume = localStorage.getItem('cyberWitchesSfxVolume');
        return volume !== null ? parseFloat(volume) : 0.5;
    }
    
    /**
     * Save sound effects volume to localStorage
     * @private
     */
    saveSfxVolume() {
        localStorage.setItem('cyberWitchesSfxVolume', this.sfxVolume.toString());
    }
    
    /**
     * Get music volume from localStorage
     * @returns {number} Music volume (0-1)
     * @private
     */
    getMusicVolume() {
        const volume = localStorage.getItem('cyberWitchesMusicVolume');
        return volume !== null ? parseFloat(volume) : 0.3;
    }
    
    /**
     * Save music volume to localStorage
     * @private
     */
    saveMusicVolume() {
        localStorage.setItem('cyberWitchesMusicVolume', this.musicVolume.toString());
    }
    
    /**
     * Get audio system statistics
     * @returns {Object} Audio system statistics
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            isAudioSupported: this.isAudioSupported,
            isMuted: this.isMuted,
            masterVolume: this.masterVolume,
            sfxVolume: this.sfxVolume,
            musicVolume: this.musicVolume,
            activeSounds: this.activeSounds.length,
            maxConcurrentSounds: this.maxConcurrentSounds,
            loadedSounds: this.soundEffects.size,
            audioUnlockRequired: this.audioUnlockRequired
        };
    }
}

// Create global audio system instance
export const audioSystem = new AudioSystem();