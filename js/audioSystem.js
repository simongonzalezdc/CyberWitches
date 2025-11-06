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
        this.soundEffectsEnabled = false; // Sound effects disabled by default (Tier 0-1)
        this.musicEnabled = false; // Music disabled by default (Tier 0-3)
        
        // Music state
        this.musicNodes = []; // Store active music oscillator nodes
        this.musicGainNodes = []; // Store gain nodes for music layers
        this.currentMusicMode = 'normal'; // 'normal' or 'meditation'
        this.musicTierMonitor = null; // Interval for monitoring tier
        
        // Performance settings
        this.maxConcurrentSounds = 8;
        this.activeSounds = [];
        
        // Initialize audio system
        this.initializeAudio();
        
        // Load default sounds
        this.loadDefaultSounds();
        
        // Start tier monitoring to ensure tiers 0-3 NEVER have music
        this.startTierMonitoring();
        
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
                volume: 0.3, // Increased overall volume
                loop: false
            },
            {
                id: 'cast',
                name: 'Spell Cast',
                url: this.generateCastSound(),
                volume: 0.4, // Increased overall volume
                loop: false
            },
            {
                id: 'achievement',
                name: 'Achievement',
                url: this.generateAchievementSound(),
                volume: 0.5, // Increased overall volume
                loop: false
            },
            {
                id: 'level_up',
                name: 'Level Up',
                url: this.generateLevelUpSound(),
                volume: 0.6, // Increased overall volume
                loop: false
            },
            {
                id: 'purchase',
                name: 'Purchase',
                url: this.generatePurchaseSound(),
                volume: 0.4, // Increased overall volume
                loop: false
            },
            {
                id: 'error',
                name: 'Error',
                url: this.generateErrorSound(),
                volume: 0.3, // Increased overall volume
                loop: false
            },
            {
                id: 'notification',
                name: 'Notification',
                url: this.generateNotificationSound(),
                volume: 0.4, // Increased overall volume
                loop: false
            },
            {
                id: 'ritual_complete',
                name: 'Ritual Complete',
                url: this.generateRitualSound(),
                volume: 0.5, // Increased overall volume
                loop: false
            },
            {
                id: 'craft',
                name: 'Craft',
                url: this.generateCraftSound(),
                volume: 0.4, // Increased overall volume
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
        const duration = 0.1; // 100ms - within acceptable range
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate drum-like percussive click - like a hi-hat or snare
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            // Very sharp percussive envelope: instant attack, extremely quick decay
            const envelope = Math.exp(-t * 150) * (1 - Math.exp(-t * 800));
            
            // Strong noise transient at start (like drum hit)
            const noise = i < 8 ? (Math.random() * 2 - 1) * 0.5 * (1 - t * 8) : 0;
            
            // Percussive character (G3 to C5 range)
            const freq1 = 196.00; // G3 (minimum)
            const freq2 = 392.00; // G4 (octave)
            
            const sample = (
                Math.sin(2 * Math.PI * freq1 * t) * 0.3 +
                Math.sin(2 * Math.PI * freq2 * t) * 0.15 +
                noise
            ) * envelope;
            
            channelData[i] = sample;
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
        const duration = 0.4; // 400ms - longer for more satisfaction
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate drum-like percussive cast - like a tom or kick with tone
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            // Sharp percussive envelope: instant attack, very quick decay
            const envelope = Math.exp(-t * 12) * (1 - Math.exp(-t * 200));
            
            // Strong noise transient at start (drum hit character)
            const noise = i < 25 ? (Math.random() * 2 - 1) * 0.4 * (1 - t * 25) : 0;
            
            // Use discrete pentatonic notes: G3, A3, C4, D4 (no sweep, no dissonance, G3-C5 range)
            const pentatonicNotes = [196.00, 220.00, 261.63, 293.66]; // G3, A3, C4, D4
            const noteIndex = Math.min(Math.floor(t * 8), pentatonicNotes.length - 1);
            const freq1 = pentatonicNotes[noteIndex];
            const freq2 = Math.min(freq1 * 2, 523.25); // Octave, capped at C5
            
            const sample = (
                Math.sin(2 * Math.PI * freq1 * t) * 0.35 +
                Math.sin(2 * Math.PI * freq2 * t) * 0.15 +
                noise
            ) * envelope;
            
            channelData[i] = sample;
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
        const duration = 0.8; // 800ms - within acceptable range
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate SUPER CUTE and DOPAMINERGIC achievement sound
        // Multiple ascending notes creating a satisfying "victory fanfare"
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            
            // Very sharp percussive envelope: instant attack, very quick decay
            const envelope = Math.exp(-t * 8) * (1 - Math.exp(-t * 150));
            
            // Strong noise transient at start (drum hit character)
            const noise = i < 40 ? (Math.random() * 2 - 1) * 0.4 * (1 - t * 40) : 0;
            
            // Percussive drum-like hits with ascending tones
            let sample = 0;
            
            // First hit: G3 (196Hz) - like a low tom
            if (t < 0.15) {
                const freq1 = 196.00; // G3
                const octave1 = Math.min(freq1 * 2, 523.25); // G4, capped at C5
                sample += Math.sin(2 * Math.PI * freq1 * t) * 0.3;
                sample += Math.sin(2 * Math.PI * octave1 * t) * 0.1;
            }
            
            // Second hit: A3 (220Hz) - mid tom
            if (t >= 0.08 && t < 0.25) {
                const freq2 = 220.00; // A3
                const octave2 = Math.min(freq2 * 2, 523.25); // A4, capped at C5
                sample += Math.sin(2 * Math.PI * freq2 * (t - 0.08)) * 0.3;
                sample += Math.sin(2 * Math.PI * octave2 * (t - 0.08)) * 0.1;
            }
            
            // Third hit: C4 (261.63Hz) - higher tom
            if (t >= 0.15 && t < 0.35) {
                const freq3 = 261.63; // C4
                const octave3 = Math.min(freq3 * 2, 523.25); // C5, capped at C5
                sample += Math.sin(2 * Math.PI * freq3 * (t - 0.15)) * 0.3;
                sample += Math.sin(2 * Math.PI * octave3 * (t - 0.15)) * 0.1;
            }
            
            // Final hit: C5 (523.25Hz) - highest
            if (t >= 0.25) {
                const freq4 = 523.25; // C5
                const localT = t - 0.25;
                sample += Math.sin(2 * Math.PI * freq4 * localT) * 0.35;
                // No octave for C5 (would exceed range)
            }
            
            sample += noise;
            
            channelData[i] = sample * envelope;
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
        const duration = 0.8; // 800ms - within acceptable range
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate SUPER CUTE level up sound (fast ascending arpeggio with sparkle)
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            
            // Very sharp percussive envelope: instant attack, very quick decay
            const envelope = Math.exp(-t * 10) * (1 - Math.exp(-t * 200));
            
            // Strong noise transient at start (drum hit character)
            const noise = i < 40 ? (Math.random() * 2 - 1) * 0.4 * (1 - t * 40) : 0;
            
            // Fast percussive drum hits using pentatonic scale: G3, A3, C4, D4, E4 (G3-C5 range)
            const noteIndex = Math.floor(t * 12) % 5;
            const frequencies = [
                196.00,   // G3 - like a low kick
                220.00,   // A3
                261.63,   // C4
                293.66,   // D4
                329.63    // E4 - highest
            ];
            
            const frequency = frequencies[noteIndex];
            const localT = t - (noteIndex / 12);
            const octaveFreq = Math.min(frequency * 2, 523.25); // Octave, capped at C5
            
            // Percussive drum-like hits
            let sample = (
                Math.sin(2 * Math.PI * frequency * localT) * 0.35 +
                Math.sin(2 * Math.PI * octaveFreq * localT) * 0.15
            );
            
            sample += noise;
            
            channelData[i] = sample * envelope;
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
        const duration = 0.25; // 250ms - slightly longer
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate drum-like percussive purchase - like a snare or rim shot
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            
            // Very sharp percussive envelope: instant attack, very quick decay
            const envelope = Math.exp(-t * 20) * (1 - Math.exp(-t * 250));
            
            // Strong noise transient at start (drum hit character)
            const noise = i < 12 ? (Math.random() * 2 - 1) * 0.5 * (1 - t * 12) : 0;
            
            // Use discrete pentatonic notes: G3, A3, C4 (no sweep, no dissonance, G3-C5 range)
            const pentatonicNotes = [196.00, 220.00, 261.63]; // G3, A3, C4
            const noteIndex = Math.min(Math.floor(t * 12), pentatonicNotes.length - 1);
            const freq1 = pentatonicNotes[noteIndex];
            const freq2 = Math.min(freq1 * 2, 523.25); // Octave, capped at C5
            
            // Percussive drum-like sound
            const sample = (
                Math.sin(2 * Math.PI * freq1 * t) * 0.3 +
                Math.sin(2 * Math.PI * freq2 * t) * 0.15 +
                noise
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
        
        // Generate drum-like percussive error - like a low tom or kick
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            // Very sharp percussive envelope: instant attack, very quick decay
            const envelope = Math.exp(-t * 10) * (1 - Math.exp(-t * 150));
            
            // Strong noise transient at start (drum hit character)
            const noise = i < 20 ? (Math.random() * 2 - 1) * 0.4 * (1 - t * 20) : 0;
            
            // Use pentatonic notes descending: E4, D4, C4 (no dissonance, G3-C5 range)
            const pentatonicNotes = [329.63, 293.66, 261.63]; // E4, D4, C4
            const noteIndex = Math.min(Math.floor(t * 10), pentatonicNotes.length - 1);
            const frequency = pentatonicNotes[noteIndex];
            const sample = (
                Math.sin(2 * Math.PI * frequency * t) * 0.3 +
                noise
            ) * envelope;
            
            channelData[i] = sample;
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
        const duration = 0.2; // 200ms - slightly longer for cuteness
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate drum-like percussive notification - like a hi-hat or cymbal
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            
            // Very sharp percussive envelope: instant attack, very quick decay
            const envelope = Math.exp(-t * 25) * (1 - Math.exp(-t * 300));
            
            // Strong noise transient at start (drum hit character)
            const noise = i < 8 ? (Math.random() * 2 - 1) * 0.5 * (1 - t * 8) : 0;
            
            // G4 (392 Hz) - mid pitched like tom
            const freq1 = 392.00; // G4
            const freq2 = 523.25; // C5 (octave/higher note)
            
            // Percussive drum-like sound
            const sample = (
                Math.sin(2 * Math.PI * freq1 * t) * 0.3 +
                Math.sin(2 * Math.PI * freq2 * t) * 0.15 +
                noise
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
        const duration = 0.7; // 700ms - longer for satisfaction
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate drum-like percussive ritual - like a tom with sweep
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            
            // Very sharp percussive envelope: instant attack, very quick decay
            const envelope = Math.exp(-t * 8) * (1 - Math.exp(-t * 180));
            
            // Strong noise transient at start (drum hit character)
            const noise = i < 50 ? (Math.random() * 2 - 1) * 0.35 * (1 - t * 50) : 0;
            
            // Use pentatonic notes ascending: G3, A3, C4, D4 (no sweep, no dissonance, G3-C5 range)
            const pentatonicNotes = [196.00, 220.00, 261.63, 293.66]; // G3, A3, C4, D4
            const noteIndex = Math.min(Math.floor(t * 6), pentatonicNotes.length - 1);
            const baseFreq = pentatonicNotes[noteIndex];
            const freq2 = Math.min(baseFreq * 2, 523.25); // Octave, capped at C5
            
            // Percussive drum-like sound
            const sample = (
                Math.sin(2 * Math.PI * baseFreq * t) * 0.35 +
                Math.sin(2 * Math.PI * freq2 * t) * 0.15 +
                noise
            ) * envelope;
            
            channelData[i] = sample;
        }
        
        return this.bufferToDataUrl(buffer);
    }
    
    /**
     * Generate a craft sound using Web Audio API
     * @returns {string} Data URL for craft sound
     * @private
     */
    generateCraftSound() {
        if (!this.isInitialized) {
            return '';
        }
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.3; // 300ms - satisfying crafting sound
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate drum-like percussive craft - like a tom or kick with tone
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            
            // Very sharp percussive envelope: instant attack, very quick decay
            const envelope = Math.exp(-t * 15) * (1 - Math.exp(-t * 200));
            
            // Strong noise transient at start (drum hit character)
            const noise = i < 20 ? (Math.random() * 2 - 1) * 0.4 * (1 - t * 20) : 0;
            
            // Use discrete pentatonic notes: G3, A3, C4, D4 (no sweep, no dissonance, G3-C5 range)
            const pentatonicNotes = [196.00, 220.00, 261.63, 293.66]; // G3, A3, C4, D4
            const noteIndex = Math.min(Math.floor(t * 10), pentatonicNotes.length - 1);
            const baseFreq = pentatonicNotes[noteIndex];
            const freq2 = Math.min(baseFreq * 2, 523.25); // Octave, capped at C5
            
            // Percussive drum-like sound
            const sample = (
                Math.sin(2 * Math.PI * baseFreq * t) * 0.35 +
                Math.sin(2 * Math.PI * freq2 * t) * 0.15 +
                noise
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
        // Check if sound effects are enabled (Tier 2+)
        // First check the design tier
        const currentTier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
        if (currentTier < 2) {
            // Sound effects are only available from Tier 2 onwards
            return false;
        }
        
        // Also check the soundEffectsEnabled flag
        if (!this.soundEffectsEnabled) {
            return false;
        }
        
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
            let useWebAudio = false;
            
            // Check if music is playing - if so, use Web Audio API for better integration
            const musicIsPlaying = this.musicEnabled && this.musicNodes.length > 0;
            
            // Calculate base volume first
            let baseVolume = (options.volume || sound.volume) * this.sfxVolume * this.masterVolume;
            if (musicIsPlaying) {
                // Reduce sound effect volume when music is playing to blend better, but keep them audible
                baseVolume *= 0.35; // 35% volume when music is active - louder than before
            }
            
            // Quantize to rhythm when music is playing
            if (musicIsPlaying && typeof Tone !== 'undefined' && Tone.Transport.state === 'started') {
                // Calculate quantized time - align to nearest 16th note (16n) for percussive feel
                const now = Tone.Transport.seconds;
                const subdivision = '16n'; // 16th note subdivision for tight rhythm
                const subdivisionTime = Tone.Time(subdivision).toSeconds();
                
                // Calculate next quantized beat
                const currentBeat = Math.floor(now / subdivisionTime);
                const nextBeat = (currentBeat + 1) * subdivisionTime;
                const quantizedDelay = Math.max(0, nextBeat - now);
                
                // Schedule the sound to play at the quantized time
                Tone.Transport.schedule((time) => {
                    this.playQuantizedSound(sound, soundId, options, baseVolume);
                }, `+${quantizedDelay}`);
                
                return true; // Sound will be handled by scheduling
            }
            
            if (sound.audio) {
                audioElement = sound.audio.cloneNode();
            } else if (sound.url && this.audioContext) {
                // Use Web Audio API when music is playing for better mixing
                if (musicIsPlaying && this.audioContext) {
                    useWebAudio = true;
                    // Create AudioBufferSourceNode for better integration with music
                    this.createHarmoniousSoundEffect(sound, soundId, options);
                    return true; // Sound will be handled by createHarmoniousSoundEffect
                } else {
                    // Use regular Audio element when no music
                    audioElement = new Audio(sound.url);
                }
            } else {
                return false;
            }
            
            // Set audio properties
            audioElement.volume = baseVolume;
            audioElement.loop = options.loop || sound.loop;
            
            // Apply fade in if specified
            if (options.fadeIn || sound.fadeIn) {
                audioElement.volume = 0;
                const targetVolume = baseVolume; // Use adjusted volume (already accounts for music)
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
     * Play a quantized sound effect (scheduled to rhythm)
     * @param {Object} sound - Sound object
     * @param {string} soundId - Sound ID
     * @param {Object} options - Playback options
     * @param {number} baseVolume - Base volume level
     * @private
     */
    playQuantizedSound(sound, soundId, options = {}, baseVolume) {
        if (!this.isAudioSupported || this.isMuted) {
            return false;
        }
        
        try {
            // Use Web Audio API for rhythmically aligned sounds
            if (this.audioContext && sound.url) {
                this.createHarmoniousSoundEffect(sound, soundId, options);
                return true;
            }
            
            // Fallback to regular Audio element
            const audioElement = sound.audio ? sound.audio.cloneNode() : new Audio(sound.url);
            audioElement.volume = baseVolume;
            audioElement.loop = options.loop || sound.loop;
            
            const playPromise = audioElement.play();
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
            handleError(error, 'playQuantizedSound');
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
     * Start tier monitoring to ensure tiers 0-3 NEVER have music
     * @private
     */
    startTierMonitoring() {
        // Clear any existing monitor
        if (this.musicTierMonitor) {
            clearInterval(this.musicTierMonitor);
        }
        
        // Check every second to ensure music is disabled for tiers 0-3
        this.musicTierMonitor = setInterval(() => {
            const currentTier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
            
            // STRICT: Tiers 0-3 must NEVER have music
            if (currentTier < 4) {
                if (this.musicEnabled) {
                    console.warn('Tier', currentTier, 'detected with music enabled - forcing disable');
                    this.musicEnabled = false;
                    this.stopMusic();
                }
                
                // Double-check: if music nodes exist, stop them
                if (this.musicNodes.length > 0 || this.musicGainNodes.length > 0) {
                    console.warn('Tier', currentTier, 'detected with music nodes active - stopping music');
                    this.stopMusic();
                }
            }
        }, 1000); // Check every second
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
     * Enable sound effects (for design tier system)
     * This ensures sound effects are enabled when Tier 2 is unlocked
     */
    enableSoundEffects() {
        this.soundEffectsEnabled = true;
        // Unlock audio if needed (required for browser autoplay policies)
        if (this.audioUnlockRequired) {
            this.unlockAudio();
        }
        // Ensure we're not muted
        if (this.isMuted) {
            this.isMuted = false;
            this.saveMutedStatus();
        }
        // Ensure SFX volume is set
        if (this.sfxVolume === 0) {
            this.sfxVolume = 0.5;
            this.saveSfxVolume();
        }
        console.log('Sound effects enabled');
    }
    
    /**
     * Disable sound effects (for design tier system)
     * This disables sound effects when Tier 0 or Tier 1 is active
     */
    disableSoundEffects() {
        this.soundEffectsEnabled = false;
        console.log('Sound effects disabled');
    }
    
    /**
     * Enable music (for design tier system)
     * This ensures music is enabled when Tier 4 is unlocked
     * ONLY works at Tier 4 - tiers 0-3 must NEVER have music
     */
    async enableMusic() {
        // STRICT CHECK: Only enable music at Tier 4
        const currentTier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
        if (currentTier < 4) {
            console.warn('enableMusic called but tier is', currentTier, '- music only available at Tier 4');
            this.musicEnabled = false;
            this.stopMusic(); // Ensure music is stopped
            return;
        }
        
        this.musicEnabled = true;
        console.log('enableMusic called - unlocking audio and starting music');
        
        // Unlock audio if needed (required for browser autoplay policies)
        if (this.audioUnlockRequired) {
            await this.unlockAudio();
        }
        
        // Ensure audio context is running
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log('Audio context resumed in enableMusic');
            } catch (error) {
                console.error('Failed to resume audio context in enableMusic:', error);
            }
        }
        
        // Ensure we're not muted
        if (this.isMuted) {
            this.isMuted = false;
            this.saveMutedStatus();
        }
        // Ensure music volume is set (minimum 0.3 for audible music)
        if (this.musicVolume === 0) {
            this.musicVolume = 0.3;
            this.saveMusicVolume();
        }
        
        // Ensure master volume is set (minimum 0.5 for audible music)
        if (this.masterVolume === 0) {
            this.masterVolume = 0.5;
            this.saveMasterVolume();
        }
        
        console.log('Music volume settings:', {
            musicVolume: this.musicVolume,
            masterVolume: this.masterVolume,
            finalVolume: this.musicVolume * this.masterVolume
        });
        
        // Start playing ambient music
        await this.startMusic();
        console.log('Music enabled and startMusic called');
    }
    
    /**
     * Disable music (for design tier system)
     * This disables music when Tier 0-3 is active
     */
    disableMusic() {
        console.log('disableMusic called - disabling music');
        console.trace('disableMusic call stack:'); // Debug: show where disableMusic was called from
        this.musicEnabled = false;
        this.stopMusic();
        console.log('Music disabled');
    }
    
    /**
     * Start playing procedural ambient music
     * Creates layered ambient loops using Web Audio API
     * STRICT: Only works at Tier 4 - tiers 0-3 must NEVER have music
     */
    async startMusic() {
        console.log('🎵 startMusic called');
        console.log('🎵 Current tier:', window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0);
        console.log('🎵 Music enabled:', this.musicEnabled);
        console.log('🎵 Music nodes length:', this.musicNodes.length);
        console.log('🎵 Is initialized:', this.isInitialized);
        console.log('🎵 Audio context:', !!this.audioContext);
        console.log('🎵 Audio context state:', this.audioContext ? this.audioContext.state : 'no context');
        console.log('🎵 Is muted:', this.isMuted);
        console.log('🎵 Current music mode:', this.currentMusicMode);
        console.log('🎵 Music volume:', this.musicVolume);
        console.log('🎵 Master volume:', this.masterVolume);
        
        // STRICT CHECK: Only allow music at Tier 4
        const currentTier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
        if (currentTier < 4) {
            console.log('❌ Music not starting - tier:', currentTier, '(music only available at Tier 4)');
            this.musicEnabled = false; // Force disable if tier < 4
            this.stopMusic(); // Ensure any playing music is stopped
            return;
        }
        
        if (!this.musicEnabled) {
            console.log('Music not starting - music disabled. Attempting to enable...');
            // Try to enable music if at Tier 4
            if (currentTier >= 4) {
                await this.enableMusic();
                if (!this.musicEnabled) {
                    console.log('Failed to enable music');
                    return;
                }
            } else {
                this.stopMusic(); // Ensure any playing music is stopped
                return;
            }
        }
        
        // Don't start if already playing (but allow mode switching)
        if (this.musicNodes.length > 0 && this.currentMusicMode === 'meditation') {
            console.log('Meditation music already playing');
            return;
        }
        
        if (!this.isInitialized || !this.audioContext || this.isMuted) {
            console.log('Music not starting - initialized:', this.isInitialized, 'context:', !!this.audioContext, 'muted:', this.isMuted);
            return;
        }
        
        // Check audio context state and resume if suspended
        if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log('Audio context resumed for music');
            } catch (error) {
                console.error('Failed to resume audio context:', error);
                handleError(error, 'resumeAudioContext');
            }
        }
        
        try {
            // Check if meditation tab is active OR meditation session is active for mellow music mode (only at Tier 4)
            const currentTier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
            const meditationTab = document.getElementById('meditation-tab');
            const isMeditationTabActive = meditationTab && meditationTab.classList.contains('active');
            const isMeditationSessionActive = window.meditationState && window.meditationState.activeSession;
            
            // Only use meditation music if at Tier 4 and (meditation tab is active OR meditation session is active)
            if (currentTier >= 4 && (isMeditationTabActive || isMeditationSessionActive)) {
                this.currentMusicMode = 'meditation';
                this.createMeditationMusic();
                console.log('Meditation music started successfully (tab active:', isMeditationTabActive, 'session active:', isMeditationSessionActive, ')');
            } else {
                this.currentMusicMode = 'normal';
                this.createAmbientMusic();
                console.log('Normal music started successfully');
            }
        } catch (error) {
            console.error('Error starting music:', error);
            handleError(error, 'startMusic');
        }
    }
    
    /**
     * Stop playing music
     * STRICT: Also checks tier and ensures tiers 0-3 NEVER have music
     */
    stopMusic() {
        // STRICT CHECK: If tier < 4, always ensure music is disabled
        const currentTier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
        if (currentTier < 4) {
            this.musicEnabled = false; // Force disable
        }
        
        console.log('stopMusic called - stopping all music nodes');
        console.trace('stopMusic call stack:'); // Debug: show where stopMusic was called from
        
        // Cancel any pending stop timeout
        if (this.stopMusicTimeout) {
            clearTimeout(this.stopMusicTimeout);
            this.stopMusicTimeout = null;
        }
        
        // Clear intervals
        if (this.sparkleInterval) {
            clearInterval(this.sparkleInterval);
            this.sparkleInterval = null;
        }
        if (this.rhythmInterval) {
            clearInterval(this.rhythmInterval);
            this.rhythmInterval = null;
        }
        if (this.musicCheckInterval) {
            clearInterval(this.musicCheckInterval);
            this.musicCheckInterval = null;
        }
        
        // Stop Tone.js music if it exists
        if (this.toneMusic) {
            try {
                // Stop all Tone.js components
                // Stop loops
                if (this.toneMusic.bassLoop) this.toneMusic.bassLoop.stop();
                if (this.toneMusic.midLoop) this.toneMusic.midLoop.stop();
                if (this.toneMusic.sparkleLoop) this.toneMusic.sparkleLoop.stop();
                if (this.toneMusic.typingLoop) this.toneMusic.typingLoop.stop();
                if (this.toneMusic.meditationBassLoop) this.toneMusic.meditationBassLoop.stop();
                if (this.toneMusic.softPadLoop) this.toneMusic.softPadLoop.stop();
                
                // Stop LFOs
                if (this.toneMusic.bassLFO) this.toneMusic.bassLFO.stop();
                
                // Release all notes from synths (PolySynth and MonoSynth have releaseAll)
                if (this.toneMusic.bassPad && typeof this.toneMusic.bassPad.releaseAll === 'function') {
                    this.toneMusic.bassPad.releaseAll();
                }
                if (this.toneMusic.midPad && typeof this.toneMusic.midPad.releaseAll === 'function') {
                    this.toneMusic.midPad.releaseAll();
                }
                // Note: typingBeat is a MonoSynth, not a PolySynth, so it might not have releaseAll
                // Just try to stop it if it exists
                if (this.toneMusic.typingBeat) {
                    if (typeof this.toneMusic.typingBeat.releaseAll === 'function') {
                        this.toneMusic.typingBeat.releaseAll();
                    } else {
                        // If it's a MonoSynth, try to release any active notes manually
                        try {
                            this.toneMusic.typingBeat.triggerRelease();
                        } catch (e) {
                            // Ignore if it doesn't work
                        }
                    }
                }
                
                // Dispose effects
                if (this.toneMusic.delay) this.toneMusic.delay.dispose();
                if (this.toneMusic.reverb) this.toneMusic.reverb.dispose();
                if (this.toneMusic.masterVol) this.toneMusic.masterVol.dispose();
                
                // Dispose synths
                if (this.toneMusic.bassPad) this.toneMusic.bassPad.dispose();
                if (this.toneMusic.midPad) this.toneMusic.midPad.dispose();
                if (this.toneMusic.softPad) this.toneMusic.softPad.dispose();
                if (this.toneMusic.typingBeat) this.toneMusic.typingBeat.dispose();
                
                this.toneMusic = null;
                console.log('Tone.js music stopped');
            } catch (error) {
                console.error('Error stopping Tone.js music:', error);
            }
        }
        
        // Only fade out if we have nodes to fade out
        if (this.musicNodes.length === 0 || this.musicGainNodes.length === 0) {
            console.log('No music nodes to stop');
            return;
        }
        
        // Fade out Web Audio API music gracefully
        const now = this.audioContext ? this.audioContext.currentTime : 0;
        this.musicGainNodes.forEach(gainNode => {
            try {
                if (gainNode && gainNode.gain) {
                    gainNode.gain.cancelScheduledValues(now);
                    const currentValue = gainNode.gain.value;
                    gainNode.gain.setValueAtTime(currentValue, now);
                    gainNode.gain.linearRampToValueAtTime(0, now + 2); // Fade out over 2 seconds
                    console.log('Fading out gain node from', currentValue, 'to 0');
                }
            } catch (error) {
                console.error('Error fading out gain node:', error);
            }
        });
        
        // Stop all music nodes after fade out
        const stopTimeout = setTimeout(() => {
            console.log('Stopping all music nodes after fade out...');
            this.musicNodes.forEach(node => {
                try {
                    if (node && node.stop) {
                        node.stop();
                    }
                    if (node && node.disconnect) {
                        node.disconnect();
                    }
                } catch (error) {
                    console.error('Error stopping music node:', error);
                }
            });
            
            this.musicGainNodes.forEach(node => {
                try {
                    if (node && node.disconnect) {
                        node.disconnect();
                    }
                } catch (error) {
                    console.error('Error disconnecting gain node:', error);
                }
            });
            
            // Clear arrays
            this.musicNodes = [];
            this.musicGainNodes = [];
            console.log('Music nodes cleared');
        }, 2000); // Wait for fade out to complete
        
        // Store timeout for potential cancellation
        this.stopMusicTimeout = stopTimeout;
    }
    
    /**
     * Create ambient music using Tone.js for better sound quality
     * @private
     */
    createAmbientMusic() {
        // Check if Tone.js is available
        if (typeof Tone === 'undefined') {
            console.warn('Tone.js not available, falling back to basic Web Audio API');
            this.createAmbientMusicBasic();
            return;
        }
        
        try {
            // Use Tone.js for better ambient music
            this.createAmbientMusicWithTone();
        } catch (error) {
            console.error('Error creating ambient music with Tone.js:', error);
            // Fallback to basic Web Audio API
            this.createAmbientMusicBasic();
        }
    }
    
    /**
     * Create ambient music using Tone.js (better quality)
     * @private
     */
    createAmbientMusicWithTone() {
        // Double-check tier before creating music (Tier 4 only)
        const currentTier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
        if (currentTier < 4 || !this.musicEnabled) {
            console.log('createAmbientMusic: tier check failed', currentTier, this.musicEnabled);
            return;
        }
        
        // Ensure musicVolume and masterVolume are not zero BEFORE calculating
        if (this.musicVolume === 0) {
            console.warn('musicVolume is 0! Setting to 0.5...');
            this.musicVolume = 0.5;
        }
        if (this.masterVolume === 0) {
            console.warn('masterVolume is 0! Setting to 0.5...');
            this.masterVolume = 0.5;
        }
        
        const musicVolume = this.musicVolume * this.masterVolume;
        
        console.log('Creating ambient music with Tone.js, volume:', musicVolume);
        
        // Final check - if still zero, something is wrong
        if (musicVolume === 0) {
            console.error('Music volume is still 0 after adjustments! Aborting music creation.');
            return;
        }
        
        // Start Tone.js if not already started
        if (Tone.context.state !== 'running') {
            Tone.start();
        }
        
        // Create a master volume control first
        const masterVol = new Tone.Volume(musicVolume * 20 - 20).toDestination(); // Convert 0-1 to dB
        
        // Create a reverb for ambient atmosphere
        const reverb = new Tone.Reverb({
            roomSize: 0.7, // Reduced from 0.9 for less reverb
            dampening: 2000 // Reduced from 3000ms for shorter decay
        }).connect(masterVol);
        
        // Generate reverb (async, but we'll start it)
        reverb.generate().then(() => {
            console.log('Reverb generated');
        });
        
        // Create a delay for atmosphere
        const delay = new Tone.FeedbackDelay({
            delayTime: '4n',
            feedback: 0.3
        }).connect(reverb);
        
        // Layer 1: Bass pad using PolySynth for chord progression (not just a drone)
        const bassPad = new Tone.PolySynth(Tone.FMSynth, {
            maxPolyphony: 3, // Only one chord at a time (3 notes per chord)
            oscillator: {
                type: 'sine'
            },
            envelope: {
                attack: 0.3, // Slightly longer attack for smoother bass
                decay: 0.5,
                sustain: 0.6, // Higher sustain for longer notes
                release: 1.2 // Longer release for sustained bass notes
            },
            modulationIndex: 1,
            modulation: {
                type: 'sine'
            }
        }).connect(delay);
        
        // Layer 2: Mid pad using PolySynth for evolving chord changes
        const midPad = new Tone.PolySynth(Tone.AMSynth, {
            maxPolyphony: 3, // Only one chord at a time (3 notes per chord)
            oscillator: {
                type: 'sine'
            },
            envelope: {
                attack: 0.2, // Very short attack
                decay: 0.4,
                sustain: 0.2, // Very low sustain for clear gaps
                release: 0.4 // Shorter release to prevent overlap
            }
        }).connect(delay);
        
        // Layer 3: Sparkle using MonoSynth with melodic pattern
        const sparkle = new Tone.MonoSynth({
            oscillator: {
                type: 'triangle'
            },
            envelope: {
                attack: 0.1,
                decay: 0.3,
                sustain: 0.2,
                release: 1
            },
            filterEnvelope: {
                attack: 0.1,
                decay: 0.3,
                sustain: 0.5,
                release: 1,
                baseFrequency: 2000,
                octaves: 2
            }
        }).connect(delay);
        
        // Layer 4: Typing/clicky beat using a simple click sound
        const typingBeat = new Tone.MonoSynth({
            oscillator: {
                type: 'square' // Square wave for clicky sound
            },
            envelope: {
                attack: 0.001, // Instant attack for sharp click
                decay: 0.01, // Very quick decay for percussive hit
                sustain: 0,
                release: 0.01 // Very short release for percussive character
            },
            filter: {
                type: 'highpass',
                frequency: 1500, // Higher frequency for more clicky/percussive sound
                Q: 3 // Sharper filter for more definition
            }
        }).connect(delay);
        
        // Helper function to shuffle arrays (Fisher-Yates algorithm)
        const shuffleArray = (array) => {
            const shuffled = [...array]; // Create a copy
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        };
        
        // Create multiple musical chord progressions using only pentatonic notes (C, D, E, G, A)
        // All chords use only pentatonic notes for zero dissonance
        // Convert to power chords (root + 5th only) for bass
        const chordProgressions = [
            // Progression 1: C, Dsus4, Esus4, C (all pentatonic)
            [
                ['C2', 'G2'],  // C power chord (C, G)
                ['D2', 'A2'],  // D power chord (D, A) - from D sus4
                ['E2', 'C3'],  // E power chord (E, C) - from E sus4
                ['C2', 'G2']   // C power chord
            ],
            // Progression 2: C, Gsus4, Am, C (all pentatonic)
            [
                ['C2', 'G2'],  // C power chord
                ['G2', 'D3'],  // G power chord (G, D) - from G sus4
                ['A2', 'E3'],  // A power chord (A, E) - from A minor
                ['C2', 'G2']   // C power chord
            ],
            // Progression 3: C, Am, C, Gsus4 (all pentatonic)
            [
                ['C2', 'G2'],  // C power chord
                ['A2', 'E3'],  // A power chord
                ['C2', 'G2'],  // C power chord
                ['G2', 'D3']   // G power chord
            ],
            // Progression 4: C, Gsus4, Am, C (all pentatonic)
            [
                ['C2', 'G2'],  // C power chord
                ['G2', 'D3'],  // G power chord
                ['A2', 'E3'],  // A power chord
                ['C2', 'G2']   // C power chord
            ],
            // Progression 5: Am, C, Gsus4, C (all pentatonic)
            [
                ['A2', 'E3'],  // A power chord
                ['C2', 'G2'],  // C power chord
                ['G2', 'D3'],  // G power chord
                ['C2', 'G2']   // C power chord
            ],
            // Progression 6: C, Gsus4, C, C (all pentatonic)
            [
                ['C2', 'G2'],  // C power chord
                ['G2', 'D3'],  // G power chord
                ['C2', 'G2'],  // C power chord
                ['C2', 'G2']   // C power chord
            ],
            // Progression 7: C, Esus4, Am, C (all pentatonic)
            [
                ['C2', 'G2'],  // C power chord
                ['E2', 'C3'],  // E power chord (E, C) - from E sus4
                ['A2', 'E3'],  // A power chord
                ['C2', 'G2']   // C power chord
            ],
            // Progression 8: Am, Gsus4, C, Am (all pentatonic)
            [
                ['A2', 'E3'],  // A power chord
                ['G2', 'D3'],  // G power chord
                ['C2', 'G2'],  // C power chord
                ['A2', 'E3']   // A power chord
            ],
            // Progression 9: C, Dsus4, Gsus4, C (all pentatonic)
            [
                ['C2', 'G2'],  // C power chord
                ['D2', 'A2'],  // D power chord
                ['G2', 'D3'],  // G power chord
                ['C2', 'G2']   // C power chord
            ],
            // Progression 10: Am, Esus4, C, Gsus4 (all pentatonic)
            [
                ['A2', 'E3'],  // A power chord
                ['E2', 'C3'],  // E power chord
                ['C2', 'G2'],  // C power chord
                ['G2', 'D3']   // G power chord
            ],
            // Progression 11: Gsus4, C, Am, Gsus4 (all pentatonic)
            [
                ['G2', 'D3'],  // G power chord
                ['C2', 'G2'],  // C power chord
                ['A2', 'E3'],  // A power chord
                ['G2', 'D3']   // G power chord
            ],
            // Progression 12: C, Am, Gsus4, Am (all pentatonic)
            [
                ['C2', 'G2'],  // C power chord
                ['A2', 'E3'],  // A power chord
                ['G2', 'D3'],  // G power chord
                ['A2', 'E3']   // A power chord
            ]
        ];
        
        // Track which progression to use and when to change
        let currentProgressionIndex = 0;
        let progressionChangeCounter = 0;
        const progressionsPerChange = 16; // Change progression every 16 cycles (4 bars)
        
        // Create a sequence for bass pad chord changes
        // Use Tone.Loop with a custom callback to handle chord arrays properly
        let chordIndex = 0;
        let loopIteration = 0; // Track loop iterations separately from chord index
        const bassLoop = new Tone.Loop((time) => {
            const currentProgression = chordProgressions[currentProgressionIndex];
            // Only play every other loop iteration to create rhythm breaks
            if (loopIteration % 2 === 0) {
                const chord = currentProgression[chordIndex % currentProgression.length];
                console.log('Bass loop playing chord:', chord, 'from progression', currentProgressionIndex, 'at time:', time);
                bassPad.triggerAttackRelease(chord, '4n', time); // Longer duration: quarter note for sustained bass
                
                // Only advance chord index when we actually play
                chordIndex++;
                // Check if we've completed a full cycle
                if (chordIndex % currentProgression.length === 0) {
                    progressionChangeCounter++;
                    // Change progression every N cycles
                    if (progressionChangeCounter >= progressionsPerChange) {
                        progressionChangeCounter = 0;
                        currentProgressionIndex = (currentProgressionIndex + 1) % chordProgressions.length;
                        console.log('Switching to progression', currentProgressionIndex);
                    }
                }
            }
            
            loopIteration++;
        }, '2n'); // Slower interval: half note (slower rhythm) for bass
        // Don't start yet - will be scheduled after Transport starts
        
        // Create a loop for mid pad (higher octave, different timing, different progression offset)
        // Add rhythm breaks - play on odd positions to offset from bass
        let midChordIndex = 0;
        let midLoopIteration = 0; // Track loop iterations separately from chord index
        let midProgressionIndex = 2; // Start with a different progression for variety
        let midProgressionChangeCounter = 0;
        const midLoop = new Tone.Loop((time) => {
            const currentProgression = chordProgressions[midProgressionIndex];
            // Only play on odd loop iterations to offset from bass and create rhythm breaks
            if (midLoopIteration % 2 === 1) {
                const chord = currentProgression[midChordIndex % currentProgression.length];
                const higherChord = chord.map(note => {
                    const match = note.match(/([A-G])(\d)/);
                    if (match) {
                        return match[1] + (parseInt(match[2]) + 2);
                    }
                    return note;
                });
                console.log('Mid loop playing chord:', higherChord, 'from progression', midProgressionIndex, 'at time:', time);
                midPad.triggerAttackRelease(higherChord, '16n', time); // Very short duration: 16th note to reduce overlap
                
                // Only advance chord index when we actually play
                midChordIndex++;
                // Check if we've completed a full cycle
                if (midChordIndex % currentProgression.length === 0) {
                    midProgressionChangeCounter++;
                    // Change progression every N cycles (slightly different timing for variety)
                    if (midProgressionChangeCounter >= progressionsPerChange + 4) {
                        midProgressionChangeCounter = 0;
                        midProgressionIndex = (midProgressionIndex + 1) % chordProgressions.length;
                        console.log('Mid pad switching to progression', midProgressionIndex);
                    }
                }
            }
            
            midLoopIteration++;
        }, '8n'); // Longer interval: 8th note to create more gaps
        // Don't start yet - will be scheduled after Transport starts
        
        // Create multiple melodic patterns for sparkle using pentatonic scale: C, D, E, G, A (no dissonance)
        // Using 16th note granularity (16 slots per beat) for finer quantization
        // More interesting and varied patterns with rhythmic complexity
        const sparkleMelodies = [
            // Pattern 1: Ascending arpeggio with rhythmic variation
            [null, null, 'C6', null, null, 'D6', null, 'E6', null, null, null, 'G6', null, 'A6', null, null, 'C7', null, null, 'G6', null, 'E6', null, null, 'D6', null, 'C6', null, null, null, null, null],
            // Pattern 2: Descending melody with syncopation
            [null, 'C7', null, null, 'A6', null, 'G6', null, null, null, 'E6', null, null, 'D6', null, 'C6', null, null, null, null, 'E6', null, 'G6', null, null, 'A6', null, null, 'C6', null, null, null],
            // Pattern 3: Jumping pattern with wide intervals
            [null, null, null, 'C6', null, null, null, null, 'G6', null, null, 'C6', null, null, 'E6', null, null, null, null, 'C7', null, null, null, 'G6', null, null, 'E6', null, null, 'C6', null, null],
            // Pattern 4: Rhythmic clusters with fast runs
            [null, 'C6', null, 'D6', null, 'E6', null, 'G6', null, null, null, 'A6', null, 'C7', null, null, null, null, 'G6', null, 'E6', null, 'D6', null, 'C6', null, null, null, null, null, null, null],
            // Pattern 5: Sparse high notes with melodic leaps
            [null, null, null, null, 'C7', null, null, null, null, null, null, null, 'A6', null, null, 'G6', null, null, null, null, 'C7', null, null, null, null, 'E6', null, null, null, null, null, null],
            // Pattern 6: Cascading pattern (new)
            ['C6', null, 'D6', null, 'E6', null, null, 'G6', null, 'A6', null, null, 'C7', null, null, null, null, 'G6', null, 'E6', null, 'D6', null, 'C6', null, null, null, null, null, null, null, null],
            // Pattern 7: Rhythmic staccato bursts (new)
            [null, null, null, 'C6', null, null, 'E6', null, null, null, 'G6', null, null, null, null, null, 'A6', null, 'C7', null, null, null, null, 'G6', null, null, 'E6', null, null, 'C6', null, null],
            // Pattern 8: Melodic phrase with syncopation (new)
            [null, null, 'C6', null, null, null, 'D6', null, 'E6', null, null, 'G6', null, null, null, null, 'C7', null, null, null, 'G6', null, 'E6', null, null, 'D6', null, null, 'C6', null, null, null]
        ];
        
        // Shuffle sparkle melodies for different combinations each time
        const shuffledSparkleMelodies = shuffleArray(sparkleMelodies);
        
        // Randomize starting sparkle melody pattern
        let sparkleMelodyIndex = Math.floor(Math.random() * shuffledSparkleMelodies.length);
        let sparkleCycleCount = 0;
        // Randomize starting position in sparkle pattern
        const startSparkleMelody = shuffledSparkleMelodies[sparkleMelodyIndex];
        let sparkleNoteIndex = Math.floor(Math.random() * startSparkleMelody.length);
        
        // Convert to Loop for proper quantization with finer granularity (16th note)
        const sparkleLoop = new Tone.Loop((time) => {
            const currentMelody = shuffledSparkleMelodies[sparkleMelodyIndex];
            const note = currentMelody[sparkleNoteIndex % currentMelody.length];
            
            if (note !== null) {
                console.log('Sparkle playing note:', note, 'from pattern', sparkleMelodyIndex, 'at time:', time);
                sparkle.triggerAttackRelease(note, '32n', time); // Shorter duration: 32nd note for crisper sparkle
            }
            
            sparkleNoteIndex++;
            
            // Change pattern every 4 cycles for variety
            if (sparkleNoteIndex % currentMelody.length === 0) {
                sparkleCycleCount++;
                if (sparkleCycleCount >= 4) {
                    sparkleCycleCount = 0;
                    sparkleMelodyIndex = (sparkleMelodyIndex + 1) % shuffledSparkleMelodies.length;
                    console.log('Sparkle switching to pattern', sparkleMelodyIndex);
                }
            }
        }, '16n'); // Finer granularity: 16th note (1/16 beat) for more precise quantization
        
        // Don't start yet - will be scheduled after Transport starts
        
        // Create multiple typing/clicky beat patterns - light rhythmic clicks like typing
        // Use pentatonic notes in G3-C5 range for harmony, rotate patterns for variety
        const typingPatterns = [
            // Pattern 1: Regular typing
            ['G4', 'A4', 'C5', 'G4', null, 'A4', 'C5', null],
            // Pattern 2: Faster typing
            ['G4', 'A4', null, 'C5', 'G4', null, 'A4', 'C5'],
            // Pattern 3: Sparse typing
            ['G4', null, null, 'A4', null, 'C5', null, null],
            // Pattern 4: Double-tap pattern
            ['G4', 'G4', null, 'A4', 'C5', null, 'G4', null],
            // Pattern 5: Ascending typing
            ['G4', null, 'A4', null, 'C5', null, null, null],
            // Pattern 6: Rhythmic clusters
            ['G4', 'A4', 'C5', null, null, null, 'G4', 'A4']
        ];
        let typingPatternIndex = 0;
        let typingIndex = 0;
        let typingCycleCount = 0;
        const typingLoop = new Tone.Loop((time) => {
            const currentPattern = typingPatterns[typingPatternIndex];
            const note = currentPattern[typingIndex % currentPattern.length];
            if (note !== null) {
                console.log('Typing beat playing note:', note, 'from pattern', typingPatternIndex, 'at time:', time);
                typingBeat.triggerAttackRelease(note, '64n', time); // Even shorter click for more percussive sound
            }
            typingIndex++;
            // Change pattern every 8 cycles for variety
            typingCycleCount++;
            if (typingCycleCount >= 8) {
                typingCycleCount = 0;
                typingPatternIndex = (typingPatternIndex + 1) % typingPatterns.length;
                typingIndex = 0; // Reset index when changing patterns
                console.log('Typing beat switching to pattern', typingPatternIndex);
            }
        }, '8n'); // Every 8th note
        // Don't start yet - will be scheduled after Transport starts
        
        // Set initial volumes to very low for fade-in effect
        // Target volumes (will be reached after fade-in)
        const targetVolumes = {
            bassPad: 2,      // Bass pad target
            midPad: -2,      // Mid pad target
            sparkle: -20,    // Sparkle target
            typingBeat: -12  // Typing beat target
        };
        
        // Start all volumes at very low (-60 dB) for smooth fade-in
        bassPad.volume.value = -60;
        midPad.volume.value = -60;
        sparkle.volume.value = -60;
        typingBeat.volume.value = -60;
        
        // Get current Transport time for scheduling fades
        const now = Tone.Transport.now();
        const fadeInDuration = 3; // 3 seconds for fade-in
        
        // Schedule smooth fade-ins for each layer with staggered timing
        // Bass pad fades in first (0 seconds)
        bassPad.volume.setValueAtTime(-60, now);
        bassPad.volume.linearRampToValueAtTime(targetVolumes.bassPad, now + fadeInDuration);
        
        // Mid pad fades in after 1 second
        midPad.volume.setValueAtTime(-60, now);
        midPad.volume.linearRampToValueAtTime(-60, now + 1);
        midPad.volume.linearRampToValueAtTime(targetVolumes.midPad, now + 1 + fadeInDuration);
        
        // Sparkle fades in after 2 seconds
        sparkle.volume.setValueAtTime(-60, now);
        sparkle.volume.linearRampToValueAtTime(-60, now + 2);
        sparkle.volume.linearRampToValueAtTime(targetVolumes.sparkle, now + 2 + fadeInDuration);
        
        // Typing beat fades in after 1.5 seconds
        typingBeat.volume.setValueAtTime(-60, now);
        typingBeat.volume.linearRampToValueAtTime(-60, now + 1.5);
        typingBeat.volume.linearRampToValueAtTime(targetVolumes.typingBeat, now + 1.5 + fadeInDuration);
        
        console.log('Volume fade-ins scheduled:', {
            bassPad: '0s → 3s',
            midPad: '1s → 4s',
            sparkle: '2s → 5s',
            typingBeat: '1.5s → 4.5s'
        });
        
        // Add slow LFO for movement on the bass pad
        // LFO modulates around the target volume (2 dB) with ±1 dB variation
        // The LFO outputs values that are added to the base volume
        // Start LFO after fade-in completes (3 seconds) to avoid interference
        const bassLFO = new Tone.LFO({
            frequency: 0.1,
            min: -1,  // Relative to target: oscillates 2±1 dB (1-3 dB range)
            max: 1
        }).connect(bassPad.volume);
        // Delay LFO start until after fade-in completes
        setTimeout(() => {
            bassLFO.start();
            console.log('Bass LFO started after fade-in');
        }, 3000); // Start after 3 seconds (when fade-in completes)
        
        // Set tempo to 110 BPM (10 BPM lower than default 120)
        Tone.Transport.bpm.value = 110;
        console.log('Tone Transport BPM set to:', Tone.Transport.bpm.value);
        
        // Stop and reset Transport to ensure clean start timing
        if (Tone.Transport.state === 'started') {
            Tone.Transport.stop();
            Tone.Transport.cancel();
            console.log('Transport stopped and cancelled');
        }
        
        // Reset Transport position to 0 for clean start
        Tone.Transport.position = 0;
        
        // Start Transport to play sequences (REQUIRED for Tone.Sequence to work!)
        Tone.Transport.start();
        console.log('Tone Transport started at position 0');
        
        // Schedule all loops to start at their staggered times
        // Using time strings makes them relative to Transport position
        // Since Transport position is reset to 0, these will be relative to beat 0
        bassLoop.start('0'); // Start immediately at beat 0
        console.log('Bass loop scheduled to start at beat 0');
        
        midLoop.start('4n'); // Start at beat 4 (4 beats after bass)
        console.log('Mid loop scheduled to start at beat 4');
        
        typingLoop.start('8n'); // Start at beat 8 (4 beats after mid, 8 beats after bass)
        console.log('Typing loop scheduled to start at beat 8');
        
        sparkleLoop.start('12n'); // Start at beat 12 (4 beats after typing, 12 beats after bass)
        console.log('Sparkle loop scheduled to start at beat 12');
        
        // Note: Loops will start playing at their scheduled times but volumes are set to -60 dB
        // and will fade in gradually over 3-5 seconds, creating a smooth entrance
        // Bass pad fades in first (0-3s), then typing (1.5-4.5s), mid (1-4s), sparkle (2-5s)
        
        // Store Tone.js objects for cleanup
        this.toneMusic = {
            reverb,
            masterVol,
            delay,
            bassPad,
            midPad,
            sparkle,
            typingBeat,
            bassLoop,
            midLoop,
            sparkleLoop,  // Changed from sparklePattern
            typingLoop,
            bassLFO
        };
        
        // Store references for cleanup
        this.musicNodes = [bassPad, midPad, sparkle, typingBeat, bassLFO];
        this.musicGainNodes = [masterVol];
        
        console.log('Ambient music created with Tone.js - chord progression and melodies');
        console.log('Music volume:', musicVolume, 'Master volume dB:', musicVolume * 20 - 20);
        console.log('Tone context state:', Tone.context.state);
        console.log('Transport state:', Tone.Transport.state);
    }
    
    /**
     * Create mellow meditation music (slower, softer, more ambient)
     * @private
     */
    createMeditationMusic() {
        console.log('createMeditationMusic called');
        console.log('Tone.js available:', typeof Tone !== 'undefined');
        console.log('Current tier:', window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0);
        console.log('Music enabled:', this.musicEnabled);
        console.log('Audio context state:', this.audioContext ? this.audioContext.state : 'no context');
        console.log('Is muted:', this.isMuted);
        console.log('Music volume:', this.musicVolume);
        console.log('Master volume:', this.masterVolume);
        
        // Check if Tone.js is available
        if (typeof Tone === 'undefined') {
            console.warn('Tone.js not available, falling back to normal music');
            this.createAmbientMusic();
            return;
        }
        
        try {
            this.createMeditationMusicWithTone();
        } catch (error) {
            console.error('Error creating meditation music with Tone.js:', error);
            console.error('Error stack:', error.stack);
            // Fallback to normal music
            this.createAmbientMusic();
        }
    }
    
    /**
     * Create mellow meditation music using Tone.js
     * @private
     */
    createMeditationMusicWithTone() {
        // Double-check tier before creating music (Tier 4 only)
        const currentTier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
        if (currentTier < 4 || !this.musicEnabled) {
            console.log('createMeditationMusic: tier check failed', currentTier, this.musicEnabled);
            return;
        }
        
        // Ensure musicVolume and masterVolume are not zero BEFORE calculating
        if (this.musicVolume === 0) {
            console.warn('musicVolume is 0! Setting to 0.5...');
            this.musicVolume = 0.5;
        }
        if (this.masterVolume === 0) {
            console.warn('masterVolume is 0! Setting to 0.5...');
            this.masterVolume = 0.5;
        }
        
        const musicVolume = this.musicVolume * this.masterVolume;
        
        console.log('Creating mellow meditation music with Tone.js, volume:', musicVolume);
        
        // Final check - if still zero, something is wrong
        if (musicVolume === 0) {
            console.error('Music volume is still 0 after adjustments! Aborting music creation.');
            return;
        }
        
        // Start Tone.js if not already started
        if (Tone.context.state !== 'running') {
            Tone.start();
        }
        
        // Create a master volume control first
        const masterVol = new Tone.Volume(musicVolume * 20 - 20).toDestination();
        
        // Create extra reverb for meditation (more spacious and ambient)
        const reverb = new Tone.Reverb({
            roomSize: 0.95, // Larger room for more spaciousness
            dampening: 5000 // More dampening for smoother decay
        }).connect(masterVol);
        
        // Generate reverb (async)
        reverb.generate().then(() => {
            console.log('Meditation reverb generated');
        });
        
        // Create a longer delay for more ambient atmosphere
        const delay = new Tone.FeedbackDelay({
            delayTime: '8n', // Longer delay for meditation
            feedback: 0.4 // More feedback for more ambient wash
        }).connect(reverb);
        
        // Layer 1: Soft bass pad - very slow, sustained
        const bassPad = new Tone.PolySynth(Tone.FMSynth, {
            maxPolyphony: 3,
            oscillator: {
                type: 'sine' // Softer sine wave
            },
            envelope: {
                attack: 1.0, // Very slow attack for smoothness
                decay: 1.0,
                sustain: 0.8, // Higher sustain for longer notes
                release: 2.0 // Longer release for ambient fade
            },
            modulationIndex: 0.5, // Less modulation for softer sound
            modulation: {
                type: 'sine'
            }
        }).connect(delay);
        
        // Layer 2: Soft pad - very minimal, sparse
        const softPad = new Tone.PolySynth(Tone.AMSynth, {
            maxPolyphony: 2, // Fewer notes for simplicity
            oscillator: {
                type: 'sine'
            },
            envelope: {
                attack: 2.0, // Very slow attack
                decay: 1.5,
                sustain: 0.6,
                release: 3.0 // Very long release
            }
        }).connect(delay);
        
        // Simple, slow chord progressions for meditation (only 3 very gentle progressions)
        let meditationChords = [
            // Progression 1: Very gentle C, Am
            [
                ['C2', 'G2'],
                ['A2', 'E3']
            ],
            // Progression 2: C, G
            [
                ['C2', 'G2'],
                ['G2', 'D3']
            ],
            // Progression 3: Am, C
            [
                ['A2', 'E3'],
                ['C2', 'G2']
            ]
        ];
        
        // Shuffle for variety
        const shuffleArray = (array) => {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        };
        
        meditationChords = shuffleArray(meditationChords);
        
        // Very slow bass pad - change chord every 8 beats (2 bars at slow tempo)
        let currentMeditationProgression = 0;
        let meditationChordIndex = 0;
        let meditationLoopIteration = 0;
        
        const meditationBassLoop = new Tone.Loop((time) => {
            const currentProgression = meditationChords[currentMeditationProgression];
            // Play every 2nd iteration for sparse but audible rhythm
            if (meditationLoopIteration % 2 === 0) {
                const chord = currentProgression[meditationChordIndex % currentProgression.length];
                console.log('Meditation bass playing chord:', chord, 'at time:', time);
                bassPad.triggerAttackRelease(chord, '2n', time); // Half note for sustained chords
                
                meditationChordIndex++;
                if (meditationChordIndex % currentProgression.length === 0) {
                    currentMeditationProgression = (currentMeditationProgression + 1) % meditationChords.length;
                }
            }
            meditationLoopIteration++;
        }, '2n'); // Every half note, but only plays every 2nd iteration
        
        // Very sparse soft pad - plays even less frequently
        let softPadProgression = 0;
        let softPadChordIndex = 0;
        let softPadIteration = 0;
        
        const softPadLoop = new Tone.Loop((time) => {
            const currentProgression = meditationChords[softPadProgression];
            // Play every 4th iteration for sparse but audible rhythm
            if (softPadIteration % 4 === 0) {
                const chord = currentProgression[softPadChordIndex % currentProgression.length];
                const higherChord = chord.map(note => {
                    const match = note.match(/([A-G])(\d)/);
                    if (match) {
                        return match[1] + (parseInt(match[2]) + 3); // Higher octave
                    }
                    return note;
                });
                console.log('Meditation soft pad playing chord:', higherChord, 'at time:', time);
                softPad.triggerAttackRelease(higherChord, '2n', time); // Half note for sustained sound
                
                softPadChordIndex++;
                if (softPadChordIndex % currentProgression.length === 0) {
                    softPadProgression = (softPadProgression + 1) % meditationChords.length;
                }
            }
            softPadIteration++;
        }, '2n'); // Every half note, but only plays every 4th iteration
        
        // Set volume levels - quieter than normal but still audible for meditation
        bassPad.volume.value = 8; // Quiet but audible bass
        softPad.volume.value = 4; // Quiet but audible pad
        
        // Set tempo to 80 BPM for meditation (much slower, more mellow)
        Tone.Transport.bpm.value = 80;
        console.log('Meditation music BPM set to:', Tone.Transport.bpm.value);
        
        // Start Transport
        if (Tone.Transport.state !== 'started') {
            Tone.Transport.start();
            console.log('Tone Transport started for meditation');
        } else {
            console.log('Tone Transport already started');
        }
        
        // Start loops immediately (or with small offset for slight variation)
        const bassOffset = Math.random() * 0.5; // Small random offset
        const softPadOffset = 1 + Math.random() * 0.5; // Small offset after bass
        
        // Start loops immediately (they will wait for Transport to start)
        meditationBassLoop.start(0); // Start immediately
        softPadLoop.start(0); // Start immediately
        
        console.log('Meditation loops started, bass offset:', bassOffset, 'soft pad offset:', softPadOffset);
        
        // Also trigger first chord immediately so music starts right away
        const firstProgression = meditationChords[0];
        const firstChord = firstProgression[0];
        
        // Trigger first chord immediately (will work once Transport starts)
        const triggerFirstChord = () => {
            try {
                bassPad.triggerAttackRelease(firstChord, '2n', Tone.now());
                console.log('Meditation music: First chord triggered, chord:', firstChord);
            } catch (error) {
                console.error('Error triggering first meditation chord:', error);
                // Try again after a short delay
                setTimeout(triggerFirstChord, 100);
            }
        };
        
        // Trigger immediately and also after Transport starts
        triggerFirstChord();
        setTimeout(triggerFirstChord, 200);
        setTimeout(triggerFirstChord, 500);
        
        // Store Tone.js objects for cleanup
        this.toneMusic = {
            reverb,
            masterVol,
            delay,
            bassPad,
            softPad,
            meditationBassLoop,
            softPadLoop
        };
        
        // Store references for cleanup
        this.musicNodes = [bassPad, softPad];
        this.musicGainNodes = [masterVol];
        
        console.log('Mellow meditation music created with Tone.js');
        console.log('Meditation music volume:', musicVolume, 'BPM:', Tone.Transport.bpm.value);
    }
    
    /**
     * Fallback: Create basic ambient music using Web Audio API
     * @private
     */
    createAmbientMusicBasic() {
        // This is the old method - keep it as fallback but don't use it
        console.log('Using basic Web Audio API fallback (not recommended)');
        // For now, just log - we can implement this later if needed
    }
    
    /**
     * Create a harmonious sound effect that integrates with ambient music
     * Uses Web Audio API for better frequency mixing and filtering
     * @private
     */
    createHarmoniousSoundEffect(sound, soundId, options = {}) {
        if (!this.audioContext || !sound.url) return;
        
        try {
            // Create audio element and decode to AudioBuffer
            const audioElement = new Audio(sound.url);
            const source = this.audioContext.createMediaElementSource(audioElement);
            
            // Create gain node for volume control
            const gainNode = this.audioContext.createGain();
            
            // Create filter to blend with music frequencies
            // Use a gentle highpass to avoid clashing with low music frequencies
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 400; // Cut frequencies below 400 Hz (where music drone/pad are)
            filter.Q.value = 0.5; // Gentle slope
            
            // Calculate volume (reduced when music is playing, but louder than before)
            const baseVolume = (options.volume || sound.volume) * this.sfxVolume * this.masterVolume;
            const harmoniousVolume = baseVolume * 0.35; // 35% volume to blend with music - louder than before
            
            gainNode.gain.value = harmoniousVolume;
            
            // Connect: source -> filter -> gain -> master
            source.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.masterGainNode);
            
            // Play the sound
            audioElement.play().catch(error => {
                console.error('Error playing harmonious sound effect:', error);
            });
            
            // Track active sound
            this.activeSounds.push({
                element: audioElement,
                id: soundId,
                startTime: Date.now(),
                gainNode: gainNode,
                filter: filter,
                source: source
            });
            
            // Remove from active sounds when finished
            audioElement.addEventListener('ended', () => {
                const index = this.activeSounds.findIndex(s => s.element === audioElement);
                if (index !== -1) {
                    try {
                        // Clean up Web Audio nodes
                        if (this.activeSounds[index].source) {
                            this.activeSounds[index].source.disconnect();
                        }
                        if (this.activeSounds[index].filter) {
                            this.activeSounds[index].filter.disconnect();
                        }
                        if (this.activeSounds[index].gainNode) {
                            this.activeSounds[index].gainNode.disconnect();
                        }
                    } catch (e) {
                        // Ignore cleanup errors
                    }
                    this.activeSounds.splice(index, 1);
                }
            });
            
        } catch (error) {
            // Fallback to regular audio if Web Audio API fails
            console.warn('Could not create harmonious sound effect, using fallback:', error);
            const audioElement = new Audio(sound.url);
            const baseVolume = (options.volume || sound.volume) * this.sfxVolume * this.masterVolume * 0.7;
            audioElement.volume = baseVolume;
            audioElement.play().catch(e => console.error('Error playing fallback sound:', e));
            
            this.activeSounds.push({
                element: audioElement,
                id: soundId,
                startTime: Date.now()
            });
            
            audioElement.addEventListener('ended', () => {
                const index = this.activeSounds.findIndex(s => s.element === audioElement);
                if (index !== -1) {
                    this.activeSounds.splice(index, 1);
                }
            });
        }
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