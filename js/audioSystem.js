import { handleError, ErrorCategory, ErrorSeverity } from './errorHandler.js';
import { shouldAllowMusic } from './audio/musicPolicy.js';

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
        this.currentMusicMode = 'normal'; // Always uses normal tier 4 music
        this.musicTierMonitor = null; // Interval for monitoring tier
        
        // Performance settings
        this.maxConcurrentSounds = 5; // Reduced from 8 to prevent crackling
        this.activeSounds = [];
        
        // Sound throttling (prevent too many sounds of same type)
        this.soundCooldowns = new Map(); // Map of soundId -> lastPlayTime
        this.soundCooldownTimes = new Map(); // Map of soundId -> cooldown duration in ms
        
        // Lazy loading flags
        this.soundsLoaded = false;
        this.audioInitialized = false;
        this.toneLoadPromise = null;
        
        // Tone.js sound design system (unified with Tier 4 music)
        this.toneSynths = new Map(); // Reusable Tone.js synths for sound effects
        this.toneSfxReverb = null; // Reverb for sound effects (100% in meditation mode, 50% in normal mode)
        this.toneSfxDelay = null; // Delay for sound effects (meditation mode: 400ms, normal mode: 200ms)
        this.toneSfxChorus = null; // Chorus for sound effects (meditation mode only)
        this.toneSfxCompressor = null; // Compression for sound effects (normal mode only)
        this.toneSfxHighPass = null; // High-pass filter for clarity (normal mode only)
        this.toneSfxDistortion = null; // Distortion for purchases/upgrades (normal mode only)
        this.toneSfxTremolo = null; // Tremolo for achievements (normal mode only)
        this.toneSfxVibrato = null; // Vibrato for melodic sounds (normal mode only)
        this.soundDesignConfig = {
            // Pentatonic scale matching Tier 4 music: C, D, E, G, A
            pentatonicNotes: ['C', 'D', 'E', 'G', 'A'],
            // Octaves for different sound types
            octaves: {
                low: 3,    // C3, D3, E3, G3, A3 - for bass/percussive sounds
                mid: 4,    // C4, D4, E4, G4, A4 - for main sounds
                high: 5    // C5, D5, E5, G5, A5 - for sparkle/attack sounds
            },
            // Rhythmic quantization (matches music grid)
            quantization: {
                tight: '8n',   // Eighth note - for tight integration
                normal: '16n', // Sixteenth note - for normal sounds
                loose: '4n'    // Quarter note - for important sounds
            }
        };
        
        // Don't initialize audio or load sounds until needed (Tier 2+ for SFX, Tier 4+ for Music)
        // This saves ~15-25 MB of memory on startup
        
        // Start tier monitoring to ensure tiers 0-3 NEVER have music
        this.startTierMonitoring();
        
        // Listen for visibility changes to pause/resume audio
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }
    
    /**
     * Initialize audio system (lazy loading - only when needed)
     * @private
     */
    initializeAudio() {
        if (this.audioInitialized) {
            return; // Already initialized
        }
        
        try {
            // Create audio context
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.audioContext = new AudioContextClass();
                this.masterGainNode = this.audioContext.createGain();
                this.masterGainNode.connect(this.audioContext.destination);
                this.isInitialized = true;
                this.audioInitialized = true;
                console.info('Audio system initialized (lazy loaded)');
            }
        } catch (error) {
            handleError(error, 'audioInitialize');
            this.isInitialized = false;
        }
    }
    
    /**
     * Lazy load sound effects (only when Tier 2+)
     * @private
     */
    async lazyLoadSounds() {
        if (this.soundsLoaded) {
            return; // Already loaded
        }
        
        // Initialize audio if not already done
        if (!this.audioInitialized) {
            this.initializeAudio();
        }
        
        // Initialize Tone.js if available (for unified sound design)
        if (await this.ensureToneLoaded()) {
            await this.initializeToneSynths();
        }
        
        // Load default sounds (now using Tone.js)
        await this.loadDefaultSounds();
        this.soundsLoaded = true;
        console.info('Sound effects loaded (lazy loaded for Tier 2+)');
    }

    async ensureToneLoaded() {
        if (typeof Tone !== 'undefined') {
            return true;
        }

        if (this.toneLoadPromise) {
            return this.toneLoadPromise;
        }

        this.toneLoadPromise = new Promise((resolve) => {
            const existingScript = document.querySelector('script[data-tone-loader="true"]');
            if (existingScript) {
                existingScript.addEventListener('load', () => resolve(typeof Tone !== 'undefined'), { once: true });
                existingScript.addEventListener('error', () => resolve(false), { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = new URL('vendor/tone-15.1.22.js', document.baseURI).href;
            script.defer = true;
            script.dataset.toneLoader = 'true';
            script.onload = () => resolve(typeof Tone !== 'undefined');
            script.onerror = () => {
                console.warn('Tone.js failed to load from self-hosted vendor path.');
                resolve(false);
            };
            document.head.appendChild(script);
        });

        return this.toneLoadPromise;
    }
    
    /**
     * Initialize Tone.js synths for sound effects (unified with music system)
     * @private
     */
    async initializeToneSynths() {
        if (!(await this.ensureToneLoaded())) {
            return; // Tone.js not available
        }
        
        // Ensure Tone.js context is started
        if (Tone.context.state !== 'running') {
            try {
                await Tone.start();
            } catch (err) {
                console.warn('Could not start Tone.js context:', err);
                return;
            }
        }
        
        // Create master gain for sound effects (separate from music)
        // This allows unified volume control for all sound effects
        if (!this.toneSfxMaster) {
            // Convert SFX volume to dB scale to match music volume system
            // Music uses: musicVolume * masterVolume * 20 - 20 (dB)
            // SFX should use similar scale for balance
            const sfxVolumeLinear = this.sfxVolume * this.masterVolume;
            // Convert to dB: linear * 20 - 20, but reduce by 6 dB to balance with music
            const sfxVolumeDb = sfxVolumeLinear * 20 - 20 - 6; // -6 dB reduction for balance
            this.toneSfxMaster = new Tone.Gain().toDestination();
            this.toneSfxMaster.gain.value = Tone.dbToGain(sfxVolumeDb); // Convert dB to linear gain
        }
        
        // Create reusable synths for different sound types
        // These match the music system's character for cohesive sound design
        
        // Create reverb for sound effects (100% in meditation mode, 50% in normal mode)
        // Check meditation mode for reverb settings
        const isMeditationMode = window.meditationState && window.meditationState.activeSession;
        const sfxReverbRoomSize = isMeditationMode ? 1.0 : 0.5; // Reduced from 0.65 to 0.5 for normal mode
        const sfxReverbDampening = isMeditationMode ? 2000 : 5000; // Warmer (lower dampening) in meditation mode, brighter (higher dampening) in normal mode
        
        // Determine output chain based on mode
        // Meditation mode: synths -> chorus -> delay -> reverb -> master
        // Normal mode: synths -> reverb -> master
        let sfxOutput;
        
        if (isMeditationMode) {
            // Create chorus for meditation mode (thickening effect)
            if (!this.toneSfxChorus) {
                this.toneSfxChorus = new Tone.Chorus({
                    frequency: 1.5,
                    delayTime: 0.02,
                    depth: 0.3,
                    wet: 0.5 // 50% wet signal
                });
            }
            
            // Create delay for meditation mode (echo effect)
            if (!this.toneSfxDelay) {
                this.toneSfxDelay = new Tone.FeedbackDelay({
                    delayTime: 0.4, // 400ms delay
                    feedback: 0.15 // Gentle feedback
                });
            }
            
            // Create reverb for meditation mode
            if (!this.toneSfxReverb) {
                this.toneSfxReverb = new Tone.Reverb({
                    roomSize: sfxReverbRoomSize,
                    dampening: sfxReverbDampening
                });
            }
            
            // Chain: chorus -> delay -> reverb -> master
            this.toneSfxChorus.connect(this.toneSfxDelay);
            this.toneSfxDelay.connect(this.toneSfxReverb);
            this.toneSfxReverb.connect(this.toneSfxMaster);
            sfxOutput = this.toneSfxChorus;
            
            // Generate reverb (async)
            this.toneSfxReverb.generate().then(() => {
                console.info('SFX effects chain generated (meditation mode): chorus -> delay -> reverb -> master');
            }).catch(err => {
                console.error('Failed to generate SFX reverb:', err);
            });
        } else {
            // Normal mode: just reverb
            if (!this.toneSfxReverb) {
                this.toneSfxReverb = new Tone.Reverb({
                    roomSize: sfxReverbRoomSize,
                    dampening: sfxReverbDampening
                }).connect(this.toneSfxMaster);
            }
            
            sfxOutput = this.toneSfxReverb;
            
            // Generate reverb (async)
            this.toneSfxReverb.generate().then(() => {
                console.info('SFX reverb generated (normal mode - 65% reverb)');
            }).catch(err => {
                console.error('Failed to generate SFX reverb:', err);
            });
        }
        
        // Adjust envelope and filter parameters based on meditation mode
        // Meditation mode: softer attack, longer release, lower filter frequencies
        const attackTime = isMeditationMode ? 0.05 : 0.001; // Softer attack in meditation
        const releaseTimePercussive = isMeditationMode ? 2.0 : 1.4; // Longer release in meditation
        const releaseTimeMelodic = isMeditationMode ? 2.5 : 0.8; // Longer release in meditation
        const releaseTimeSparkle = isMeditationMode ? 1.5 : 0.3; // Longer release in meditation
        const releaseTimeAmbient = isMeditationMode ? 2.5 : 1.0; // Longer release in meditation
        const filterFreq = isMeditationMode ? 1200 : 2000; // Lower frequency (warmer) in meditation
        
        // Percussive sounds (click, cast, purchase, etc.) - use MembraneSynth for drum-like character
        // In normal mode, purchases/upgrades get subtle distortion
        const percussiveSynth = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 6,
            oscillator: {
                type: 'sine'
            },
            envelope: {
                attack: attackTime,
                decay: 0.4,
                sustain: 0.01,
                release: releaseTimePercussive
            }
        });
        
        // For purchases/upgrades in normal mode, add distortion
        if (!isMeditationMode) {
            // Create distortion for purchases/upgrades
            if (!this.toneSfxDistortion) {
                this.toneSfxDistortion = new Tone.Distortion({
                    distortion: 0.2, // Subtle grit
                    oversample: '2x' // Prevents aliasing
                });
                // Connect distortion to the normal mode chain
                this.toneSfxDistortion.connect(sfxOutput);
            }
            // Note: We'll need to route purchase/upgrade sounds through distortion separately
            // For now, all percussive sounds go through the main chain
        }
        
        percussiveSynth.connect(sfxOutput);
        this.toneSynths.set('percussive', percussiveSynth);
        
        // Melodic sounds (achievement, level_up, etc.) - use Synth for clean tones
        // In normal mode, add vibrato for expressiveness
        const melodicSynth = new Tone.Synth({
            oscillator: {
                type: 'sine'
            },
            envelope: {
                attack: isMeditationMode ? 0.1 : 0.1, // Keep same attack for melodic
                decay: 0.2,
                sustain: 0.5,
                release: releaseTimeMelodic
            }
        });
        
        // Add vibrato to melodic sounds in normal mode
        if (!isMeditationMode) {
            if (!this.toneSfxVibrato) {
                this.toneSfxVibrato = new Tone.Vibrato({
                    frequency: 6, // 6 Hz - moderate speed
                    depth: 0.15 // 15% depth - subtle
                });
            }
            melodicSynth.connect(this.toneSfxVibrato);
            this.toneSfxVibrato.connect(sfxOutput);
        } else {
            melodicSynth.connect(sfxOutput);
        }
        
        this.toneSynths.set('melodic', melodicSynth);
        
        // Sparkle/attack sounds (tower_attack, etc.) - use MonoSynth for bright tones
        this.toneSynths.set('sparkle', new Tone.MonoSynth({
            oscillator: {
                type: 'triangle'
            },
            envelope: {
                attack: attackTime,
                decay: 0.1,
                sustain: 0.1,
                release: releaseTimeSparkle
            },
            filter: {
                type: 'highpass',
                frequency: filterFreq, // Lower frequency in meditation mode
                Q: 2
            }
        }).connect(sfxOutput));
        
        // Ambient/placement sounds (tower_place, etc.) - use Synth with longer release
        this.toneSynths.set('ambient', new Tone.Synth({
            oscillator: {
                type: 'sine'
            },
            envelope: {
                attack: isMeditationMode ? 0.2 : 0.2, // Keep same attack for ambient
                decay: 0.3,
                sustain: 0.4,
                release: releaseTimeAmbient
            }
        }).connect(sfxOutput));
        
        // Noise-based sounds (distraction_spawn, etc.) - use Noise with filter
        this.toneSynths.set('noise', new Tone.Noise({
            type: 'pink',
            volume: -10
        }).connect(new Tone.Filter({
            type: 'bandpass',
            frequency: 1000,
            Q: 2
        }).connect(sfxOutput)));
        
        console.info('Tone.js sound effect synths initialized');
    }
    
    /**
     * Get the next quantized time for a given subdivision
     * @param {string} subdivision - Tone.js time string (e.g., '16n', '8n')
     * @returns {number} Next quantized time in seconds (from Tone.Transport start)
     */
    getNextQuantizedTime(subdivision = '16n') {
        if (typeof Tone === 'undefined' || !Tone.Transport || Tone.Transport.state !== 'started') {
            return Date.now() / 1000; // Return current time if Transport not running
        }
        
        const now = Tone.Transport.seconds;
        const subdivisionTime = Tone.Time(subdivision).toSeconds();
        const currentBeat = Math.floor(now / subdivisionTime);
        const nextBeat = (currentBeat + 1) * subdivisionTime;
        
        // Return as absolute time (seconds since Transport started)
        return nextBeat;
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
     * Load default sound effects (now using Tone.js - no need to generate buffers)
     * @private
     */
    async loadDefaultSounds() {
        // Define sound effects with Tone.js configuration
        // All sounds use pentatonic scale (C, D, E, G, A) to match Tier 4 music
        const defaultSounds = [
            {
                id: 'click',
                name: 'Click',
                synthType: 'percussive',
                note: 'C4',
                duration: '16n',
                volume: 0.3,
                quantization: 'normal'
            },
            {
                id: 'cast',
                name: 'Spell Cast',
                synthType: 'percussive',
                note: 'C3',
                duration: '8n',
                volume: 0.4,
                quantization: 'normal'
            },
            {
                id: 'craft',
                name: 'Craft',
                synthType: 'percussive',
                note: 'D3',
                duration: '8n',
                volume: 0.4,
                quantization: 'normal'
            },
            {
                id: 'purchase',
                name: 'Purchase',
                synthType: 'percussive',
                note: 'G3',
                duration: '16n',
                volume: 0.4,
                quantization: 'normal'
            },
            {
                id: 'achievement',
                name: 'Achievement',
                synthType: 'melodic',
                notes: ['C4', 'E4', 'G4'],
                duration: '4n',
                volume: 0.5,
                quantization: 'loose'
            },
            {
                id: 'level_up',
                name: 'Level Up',
                synthType: 'melodic',
                notes: ['C4', 'D4', 'E4', 'G4', 'A4'],
                duration: '4n',
                volume: 0.6,
                quantization: 'loose'
            },
            {
                id: 'daily_complete',
                name: 'Daily Complete',
                synthType: 'melodic',
                notes: ['C4', 'E4', 'G4'],
                duration: '4n',
                volume: 0.5,
                quantization: 'loose'
            },
            {
                id: 'success',
                name: 'Success',
                synthType: 'melodic',
                notes: ['C4', 'E4', 'G4'],
                duration: '8n',
                volume: 0.4,
                quantization: 'normal'
            },
            {
                id: 'notification',
                name: 'Notification',
                synthType: 'sparkle',
                note: 'C5',
                duration: '32n',
                volume: 0.4,
                quantization: 'normal'
            },
            {
                id: 'error',
                name: 'Error',
                synthType: 'noise',
                duration: '16n',
                volume: 0.3,
                quantization: 'normal'
            },
            // Meditation-specific sound effects (Tier 2+)
            {
                id: 'tower_attack',
                name: 'Tower Attack',
                synthType: 'sparkle',
                note: 'C5',
                duration: '32n',
                volume: 0.3,
                quantization: 'tight'
            },
            {
                id: 'tower_place',
                name: 'Tower Place',
                synthType: 'ambient',
                notes: ['C4', 'E4', 'G4'],
                duration: '8n',
                volume: 0.4,
                quantization: 'normal'
            },
            {
                id: 'tower_upgrade',
                name: 'Tower Upgrade',
                synthType: 'melodic',
                notes: ['C4', 'D4', 'E4', 'G4', 'A4'],
                duration: '4n',
                volume: 0.5,
                quantization: 'loose'
            },
            {
                id: 'distraction_spawn',
                name: 'Distraction Spawn',
                synthType: 'noise',
                duration: '16n',
                volume: 0.3,
                quantization: 'normal'
            },
            {
                id: 'distraction_hit',
                name: 'Distraction Hit',
                synthType: 'percussive',
                note: 'A3',
                duration: '32n',
                volume: 0.25,
                quantization: 'normal'
            },
            {
                id: 'distraction_death',
                name: 'Distraction Death',
                synthType: 'percussive',
                note: 'G3',
                duration: '16n',
                volume: 0.4,
                quantization: 'normal'
            },
            {
                id: 'wave_start',
                name: 'Wave Start',
                synthType: 'melodic',
                notes: ['C4', 'E4', 'G4', 'C5'],
                duration: '4n',
                volume: 0.5,
                quantization: 'loose'
            },
            {
                id: 'wave_complete',
                name: 'Wave Complete',
                synthType: 'melodic',
                notes: ['C4', 'E4', 'G4', 'A4', 'C5'],
                duration: '4n',
                volume: 0.5,
                quantization: 'loose'
            },
            {
                id: 'tranquility_damage',
                name: 'Tranquility Damage',
                synthType: 'noise',
                duration: '16n',
                volume: 0.3,
                quantization: 'normal'
            }
        ];
        
        // Store sound configurations (no need to generate buffers)
        defaultSounds.forEach(soundData => {
            this.soundEffects.set(soundData.id, soundData);
        });
        
        // Configure sound cooldowns to prevent crackling (especially for meditation sounds)
        this.configureSoundCooldowns();
    }
    
    /**
     * Configure sound cooldowns to prevent too many sounds playing at once
     * @private
     */
    configureSoundCooldowns() {
        // Meditation sounds that can play frequently - add cooldowns
        this.soundCooldownTimes.set('tower_attack', 100); // 100ms cooldown (max 10 per second)
        this.soundCooldownTimes.set('distraction_spawn', 200); // 200ms cooldown (max 5 per second)
        this.soundCooldownTimes.set('distraction_death', 150); // 150ms cooldown (max ~6 per second)
        this.soundCooldownTimes.set('tranquility_damage', 300); // 300ms cooldown (max ~3 per second)
        
        // Other frequent sounds
        this.soundCooldownTimes.set('cast', 50); // 50ms cooldown for cast sound
        this.soundCooldownTimes.set('click', 30); // 30ms cooldown for click sound
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
            
            // Use pentatonic scale matching tier 4 music: C, D, E, G, A
            // C4 (261.63Hz) and G4 (392Hz) for click sound
            const freq1 = 261.63; // C4 (matches tier 4 music)
            const freq2 = 392.00; // G4 (matches tier 4 music)
            
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
            
            // Use pentatonic scale matching tier 4 music: C, D, E, G, A
            // C4, D4, E4, G4 progression for cast sound
            const pentatonicNotes = [261.63, 293.66, 329.63, 392.00]; // C4, D4, E4, G4
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
            
            // Use pentatonic scale matching tier 4 music: C, D, E, G, A
            // Ascending progression: C4, D4, E4, G4, A4, C5
            // First hit: C4 (261.63Hz)
            if (t < 0.15) {
                const freq1 = 261.63; // C4
                const octave1 = Math.min(freq1 * 2, 523.25); // C5, capped at C5
                sample += Math.sin(2 * Math.PI * freq1 * t) * 0.3;
                sample += Math.sin(2 * Math.PI * octave1 * t) * 0.1;
            }
            
            // Second hit: D4 (293.66Hz)
            if (t >= 0.08 && t < 0.25) {
                const freq2 = 293.66; // D4
                const octave2 = Math.min(freq2 * 2, 523.25); // D5, capped at C5 (will cap)
                sample += Math.sin(2 * Math.PI * freq2 * (t - 0.08)) * 0.3;
                sample += Math.sin(2 * Math.PI * octave2 * (t - 0.08)) * 0.1;
            }
            
            // Third hit: E4 (329.63Hz)
            if (t >= 0.15 && t < 0.35) {
                const freq3 = 329.63; // E4
                const octave3 = 523.25; // C5 (capped)
                sample += Math.sin(2 * Math.PI * freq3 * (t - 0.15)) * 0.3;
                sample += Math.sin(2 * Math.PI * octave3 * (t - 0.15)) * 0.1;
            }
            
            // Final hit: A4 (440Hz) then C5 (523.25Hz)
            if (t >= 0.25) {
                if (t < 0.5) {
                    const freq4 = 440.00; // A4
                    const localT = t - 0.25;
                    sample += Math.sin(2 * Math.PI * freq4 * localT) * 0.3;
                } else {
                    const freq5 = 523.25; // C5
                    const localT = t - 0.5;
                    sample += Math.sin(2 * Math.PI * freq5 * localT) * 0.35;
                }
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
            
            // Use pentatonic scale matching tier 4 music: C, D, E, G, A
            // Fast percussive drum hits: C4, D4, E4, G4, A4
            const noteIndex = Math.floor(t * 12) % 5;
            const frequencies = [
                261.63,   // C4 - like a low kick
                293.66,   // D4
                329.63,   // E4
                392.00,   // G4
                440.00    // A4 - highest
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
            
            // Use pentatonic scale matching tier 4 music: C, D, E, G, A
            // C4, D4, G4 progression for purchase sound
            const pentatonicNotes = [261.63, 293.66, 392.00]; // C4, D4, G4
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
            
            // Use pentatonic scale matching tier 4 music: C, D, E, G, A
            // Descending: E4, D4, C4 for error sound
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
            
            // Use pentatonic scale matching tier 4 music: C, D, E, G, A
            // G4 (392Hz) and A4 (440Hz) for notification sound
            const freq1 = 392.00; // G4
            const freq2 = 440.00; // A4 (matches tier 4 music better)
            
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
            
            // Use pentatonic scale matching tier 4 music: C, D, E, G, A
            // C4, D4, E4, G4 progression for craft sound
            const pentatonicNotes = [261.63, 293.66, 329.63, 392.00]; // C4, D4, E4, G4
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
     * Generate a daily complete sound using Web Audio API
     * @returns {string} Data URL for daily complete sound
     * @private
     */
    generateDailyCompleteSound() {
        if (!this.isInitialized) {
            return '';
        }
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.5; // 500ms - satisfying completion sound
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate drum-like percussive daily complete - like a tom with ascending progression
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            
            // Very sharp percussive envelope: instant attack, very quick decay
            const envelope = Math.exp(-t * 10) * (1 - Math.exp(-t * 180));
            
            // Strong noise transient at start (drum hit character)
            const noise = i < 30 ? (Math.random() * 2 - 1) * 0.35 * (1 - t * 30) : 0;
            
            // Use pentatonic scale matching tier 4 music: C, D, E, G, A
            // C4, D4, E4, G4 ascending progression
            const pentatonicNotes = [261.63, 293.66, 329.63, 392.00]; // C4, D4, E4, G4
            const noteIndex = Math.min(Math.floor(t * 8), pentatonicNotes.length - 1);
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
     * Generate a success sound using Web Audio API
     * @returns {string} Data URL for success sound
     * @private
     */
    generateSuccessSound() {
        if (!this.isInitialized) {
            return '';
        }
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.35; // 350ms - quick success confirmation
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate drum-like percussive success - like a snare with ascending tone
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            
            // Very sharp percussive envelope: instant attack, very quick decay
            const envelope = Math.exp(-t * 18) * (1 - Math.exp(-t * 220));
            
            // Strong noise transient at start (drum hit character)
            const noise = i < 15 ? (Math.random() * 2 - 1) * 0.45 * (1 - t * 15) : 0;
            
            // Use pentatonic scale matching tier 4 music: C, D, E, G, A
            // C4, D4, G4 progression for success sound
            const pentatonicNotes = [261.63, 293.66, 392.00]; // C4, D4, G4
            const noteIndex = Math.min(Math.floor(t * 10), pentatonicNotes.length - 1);
            const baseFreq = pentatonicNotes[noteIndex];
            const freq2 = Math.min(baseFreq * 2, 523.25); // Octave, capped at C5
            
            // Percussive drum-like sound
            const sample = (
                Math.sin(2 * Math.PI * baseFreq * t) * 0.32 +
                Math.sin(2 * Math.PI * freq2 * t) * 0.18 +
                noise
            ) * envelope;
            
            channelData[i] = sample;
        }
        
        return this.bufferToDataUrl(buffer);
    }
    
    /**
     * Generate a tower attack sound using Web Audio API
     * @returns {string} Data URL for tower attack sound
     * @private
     */
    generateTowerAttackSound() {
        if (!this.isInitialized) {
            return '';
        }
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.15; // 150ms - quick attack sound
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate quick percussive attack - like a light zap or hit
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            
            // Sharp percussive envelope: instant attack, quick decay
            const envelope = Math.exp(-t * 25) * (1 - Math.exp(-t * 300));
            
            // Light noise transient at start
            const noise = i < 10 ? (Math.random() * 2 - 1) * 0.2 * (1 - t * 10) : 0;
            
            // Use pentatonic scale: C5, E5, G5 for attack sound
            const pentatonicNotes = [523.25, 659.25, 783.99]; // C5, E5, G5
            const noteIndex = Math.min(Math.floor(t * 15), pentatonicNotes.length - 1);
            const frequency = pentatonicNotes[noteIndex];
            
            const sample = (
                Math.sin(2 * Math.PI * frequency * t) * 0.25 +
                noise
            ) * envelope;
            
            channelData[i] = sample;
        }
        
        return this.bufferToDataUrl(buffer);
    }
    
    /**
     * Generate a tower place sound using Web Audio API
     * @returns {string} Data URL for tower place sound
     * @private
     */
    generateTowerPlaceSound() {
        if (!this.isInitialized) {
            return '';
        }
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.3; // 300ms - satisfying placement sound
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate gentle placement sound - like a soft chime
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            
            // Gentle envelope: slow attack, medium decay
            const envelope = Math.exp(-t * 8) * (1 - Math.exp(-t * 50));
            
            // Use pentatonic scale: C4, E4, G4 ascending for placement
            const pentatonicNotes = [261.63, 329.63, 392.00]; // C4, E4, G4
            const noteIndex = Math.min(Math.floor(t * 6), pentatonicNotes.length - 1);
            const baseFreq = pentatonicNotes[noteIndex];
            const freq2 = baseFreq * 2; // Octave for harmony
            
            const sample = (
                Math.sin(2 * Math.PI * baseFreq * t) * 0.3 +
                Math.sin(2 * Math.PI * freq2 * t) * 0.15
            ) * envelope;
            
            channelData[i] = sample;
        }
        
        return this.bufferToDataUrl(buffer);
    }
    
    /**
     * Generate a tower upgrade sound using Web Audio API
     * @returns {string} Data URL for tower upgrade sound
     * @private
     */
    generateTowerUpgradeSound() {
        if (!this.isInitialized) {
            return '';
        }
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.4; // 400ms - satisfying upgrade sound
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate ascending upgrade sound - like a level up
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            
            // Medium envelope: slow attack, medium decay
            const envelope = Math.exp(-t * 6) * (1 - Math.exp(-t * 40));
            
            // Use pentatonic scale: C4, D4, E4, G4, A4 ascending for upgrade
            const pentatonicNotes = [261.63, 293.66, 329.63, 392.00, 440.00]; // C4, D4, E4, G4, A4
            const noteIndex = Math.min(Math.floor(t * 8), pentatonicNotes.length - 1);
            const baseFreq = pentatonicNotes[noteIndex];
            const freq2 = baseFreq * 2; // Octave for harmony
            
            const sample = (
                Math.sin(2 * Math.PI * baseFreq * t) * 0.35 +
                Math.sin(2 * Math.PI * freq2 * t) * 0.2
            ) * envelope;
            
            channelData[i] = sample;
        }
        
        return this.bufferToDataUrl(buffer);
    }
    
    /**
     * Generate a distraction spawn sound using Web Audio API
     * @returns {string} Data URL for distraction spawn sound
     * @private
     */
    generateDistractionSpawnSound() {
        if (!this.isInitialized) {
            return '';
        }
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.2; // 200ms - quick spawn sound
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate subtle spawn sound - like a light whoosh or pop
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            
            // Quick envelope: instant attack, quick decay
            const envelope = Math.exp(-t * 20) * (1 - Math.exp(-t * 200));
            
            // Light noise transient for whoosh/pop character
            const noise = i < 15 ? (Math.random() * 2 - 1) * 0.15 * (1 - t * 15) : 0;
            
            // Use pentatonic scale: A3, C4 for spawn sound (lower, more subtle)
            const pentatonicNotes = [220.00, 261.63]; // A3, C4
            const noteIndex = Math.min(Math.floor(t * 8), pentatonicNotes.length - 1);
            const frequency = pentatonicNotes[noteIndex];
            
            const sample = (
                Math.sin(2 * Math.PI * frequency * t) * 0.2 +
                noise
            ) * envelope;
            
            channelData[i] = sample;
        }
        
        return this.bufferToDataUrl(buffer);
    }
    
    /**
     * Generate a distraction hit sound using Web Audio API
     * @returns {string} Data URL for distraction hit sound
     * @private
     */
    generateDistractionHitSound() {
        if (!this.isInitialized) {
            return '';
        }
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.1; // 100ms - very quick hit sound
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate quick hit sound - like a light tap
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            
            // Very sharp percussive envelope: instant attack, very quick decay
            const envelope = Math.exp(-t * 30) * (1 - Math.exp(-t * 400));
            
            // Light noise transient
            const noise = i < 5 ? (Math.random() * 2 - 1) * 0.15 * (1 - t * 5) : 0;
            
            // Use pentatonic scale: E4, G4 for hit sound
            const pentatonicNotes = [329.63, 392.00]; // E4, G4
            const noteIndex = Math.min(Math.floor(t * 12), pentatonicNotes.length - 1);
            const frequency = pentatonicNotes[noteIndex];
            
            const sample = (
                Math.sin(2 * Math.PI * frequency * t) * 0.2 +
                noise
            ) * envelope;
            
            channelData[i] = sample;
        }
        
        return this.bufferToDataUrl(buffer);
    }
    
    /**
     * Generate a distraction death sound using Web Audio API
     * @returns {string} Data URL for distraction death sound
     * @private
     */
    generateDistractionDeathSound() {
        if (!this.isInitialized) {
            return '';
        }
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.25; // 250ms - satisfying death sound
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate descending death sound - like a fade out
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            
            // Medium envelope: instant attack, medium decay
            const envelope = Math.exp(-t * 12) * (1 - Math.exp(-t * 150));
            
            // Use pentatonic scale: G4, E4, C4 descending for death
            const pentatonicNotes = [392.00, 329.63, 261.63]; // G4, E4, C4
            const noteIndex = Math.min(Math.floor(t * 10), pentatonicNotes.length - 1);
            const baseFreq = pentatonicNotes[noteIndex];
            
            const sample = (
                Math.sin(2 * Math.PI * baseFreq * t) * 0.3
            ) * envelope;
            
            channelData[i] = sample;
        }
        
        return this.bufferToDataUrl(buffer);
    }
    
    /**
     * Generate a wave start sound using Web Audio API
     * @returns {string} Data URL for wave start sound
     * @private
     */
    generateWaveStartSound() {
        if (!this.isInitialized) {
            return '';
        }
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.5; // 500ms - satisfying wave start
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate ascending wave start sound - like a fanfare
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            
            // Medium envelope: slow attack, medium decay
            const envelope = Math.exp(-t * 5) * (1 - Math.exp(-t * 30));
            
            // Use pentatonic scale: C4, D4, E4, G4, A4 ascending for wave start
            const pentatonicNotes = [261.63, 293.66, 329.63, 392.00, 440.00]; // C4, D4, E4, G4, A4
            const noteIndex = Math.min(Math.floor(t * 6), pentatonicNotes.length - 1);
            const baseFreq = pentatonicNotes[noteIndex];
            const freq2 = baseFreq * 2; // Octave for harmony
            
            const sample = (
                Math.sin(2 * Math.PI * baseFreq * t) * 0.4 +
                Math.sin(2 * Math.PI * freq2 * t) * 0.2
            ) * envelope;
            
            channelData[i] = sample;
        }
        
        return this.bufferToDataUrl(buffer);
    }
    
    /**
     * Generate a wave complete sound using Web Audio API
     * @returns {string} Data URL for wave complete sound
     * @private
     */
    generateWaveCompleteSound() {
        if (!this.isInitialized) {
            return '';
        }
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.6; // 600ms - satisfying completion
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate ascending completion sound - like a victory fanfare
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            
            // Medium envelope: slow attack, medium decay
            const envelope = Math.exp(-t * 4) * (1 - Math.exp(-t * 25));
            
            // Use pentatonic scale: C4, E4, G4, C5 ascending for completion
            const pentatonicNotes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
            const noteIndex = Math.min(Math.floor(t * 5), pentatonicNotes.length - 1);
            const baseFreq = pentatonicNotes[noteIndex];
            const freq2 = baseFreq * 2; // Octave for harmony
            
            const sample = (
                Math.sin(2 * Math.PI * baseFreq * t) * 0.4 +
                Math.sin(2 * Math.PI * freq2 * t) * 0.25
            ) * envelope;
            
            channelData[i] = sample;
        }
        
        return this.bufferToDataUrl(buffer);
    }
    
    /**
     * Generate a tranquility damage sound using Web Audio API
     * @returns {string} Data URL for tranquility damage sound
     * @private
     */
    generateTranquilityDamageSound() {
        if (!this.isInitialized) {
            return '';
        }
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.3; // 300ms - warning damage sound
        const numSamples = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        
        // Generate descending warning sound - like a low thud
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            
            // Medium envelope: instant attack, medium decay
            const envelope = Math.exp(-t * 10) * (1 - Math.exp(-t * 120));
            
            // Strong noise transient for impact character
            const noise = i < 20 ? (Math.random() * 2 - 1) * 0.3 * (1 - t * 20) : 0;
            
            // Use pentatonic scale: A3, G3, E3 descending for damage (lower, more ominous)
            const pentatonicNotes = [220.00, 196.00, 164.81]; // A3, G3, E3
            const noteIndex = Math.min(Math.floor(t * 8), pentatonicNotes.length - 1);
            const baseFreq = pentatonicNotes[noteIndex];
            
            const sample = (
                Math.sin(2 * Math.PI * baseFreq * t) * 0.3 +
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
            // Tone.js sounds don't need audio files - just store the configuration
            const sound = {
                id: soundData.id,
                name: soundData.name,
                synthType: soundData.synthType,
                note: soundData.note,
                notes: soundData.notes,
                duration: soundData.duration,
                volume: soundData.volume || 0.5,
                quantization: soundData.quantization || 'normal',
                loop: false,
                fadeIn: 0,
                fadeOut: 0
            };
            
            this.soundEffects.set(soundData.id, sound);
            return /** @type {any} */ (sound);
        } catch (error) {
            handleError(error, 'loadSound');
            return null;
        }
    }
    
    /**
     * Play a sound effect
     * @param {string} soundId - Sound ID to play
     * @param {Object} options - Playback options
     * @returns {Promise<boolean>} Whether sound was played successfully
     */
    async playSound(soundId, options = {}) {
        // Check if sound effects are enabled (Tier 2+)
        // First check the design tier
        const currentTier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
        if (currentTier < 2) {
            // Sound effects are only available from Tier 2 onwards
            // Silent return to prevent console spam
            return false;
        }
        
        // Also check the soundEffectsEnabled flag
        if (!this.soundEffectsEnabled) {
            console.info('playSound: Sound effects not enabled');
            return false;
        }
        
        if (!this.isAudioSupported) {
            console.info('playSound: Audio not supported');
            return false;
        }
        
        if (this.isMuted) {
            console.info('playSound: Audio is muted');
            return false;
        }
        
        // Check if quantization should be skipped (for immediate playback)
        const skipQuantization = options.skipQuantization === true;
        
        // Lazy load sounds if not already loaded
        if (!this.soundsLoaded) {
            await this.lazyLoadSounds();
        }
        
        // Ensure audio context exists and is initialized
        if (!this.audioContext) {
            console.warn('playSound: Audio context not initialized');
            this.initializeAudio();
            if (!this.audioContext) {
                return false;
            }
        }
        
        // Ensure audio context is running (try to resume if suspended)
        if (this.audioContext.state === 'suspended') {
            // Try to resume (may require user interaction)
            this.audioContext.resume().then(() => {
                console.info('Audio context resumed in playSound');
                // Retry playing the sound after resume
                setTimeout(() => {
                    this.playSound(soundId, options);
                }, 100);
            }).catch(err => {
                console.warn('Could not resume audio context:', err);
            });
            return false; // Return false for now, will retry after resume
        }
        
        try {
            const sound = this.soundEffects.get(soundId);
            if (!sound) {
                console.warn(`playSound: Sound not found: ${soundId}. Available sounds:`, Array.from(this.soundEffects.keys()));
                return false;
            }
            
            console.info(`playSound: Playing sound ${soundId}`, {
                soundFound: !!sound,
                soundType: sound.synthType,
                tier: currentTier,
                soundEffectsEnabled: this.soundEffectsEnabled,
                isMuted: this.isMuted,
                soundsLoaded: this.soundsLoaded,
                toneSynthsSize: this.toneSynths ? this.toneSynths.size : 0,
                hasSynthType: this.toneSynths ? this.toneSynths.has(sound.synthType) : false
            });
            
            // Check if we have too many concurrent sounds
            if (this.activeSounds.length >= this.maxConcurrentSounds) {
                return false;
            }
            
            // Check sound cooldown (throttle frequent sounds to prevent crackling)
            const cooldownTime = this.soundCooldownTimes.get(soundId) || 0;
            if (cooldownTime > 0) {
                const lastPlayTime = this.soundCooldowns.get(soundId) || 0;
                const now = Date.now();
                if (now - lastPlayTime < cooldownTime) {
                    // Still in cooldown, skip this sound
                    return false;
                }
                // Update last play time
                this.soundCooldowns.set(soundId, now);
            }
            
            // Clone audio element to allow overlapping sounds
            let audioElement;

            // Check if music is playing - if so, use Web Audio API for better integration
            const musicIsPlaying = this.musicEnabled && this.musicNodes.length > 0;
            const tier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
            const autoTightMode = tier >= 4 && typeof window.autoCastEnabled === 'function' && window.autoCastEnabled();
            
            // Calculate base volume first
            // SFX volume is now controlled by toneSfxMaster gain node (converted to dB scale)
            // We don't need to multiply by sfxVolume/masterVolume here since toneSfxMaster handles it
            // Just use the sound's individual volume if specified
            let baseVolume = options.volume || sound.volume || 1.0; // Default to 1.0 (full volume for this sound)
            
            // Check if we're in meditation mode
            const isMeditationMode = window.meditationState && window.meditationState.activeSession;
            
            if (musicIsPlaying) {
                // Reduce sound effect volume when music is playing to blend better
                // Use 0.7 (70%) to keep SFX audible but not overpowering music
                baseVolume *= autoTightMode ? 0.7 : 0.7; // Same reduction for both modes
                
                // In meditation mode, reduce volume even more to blend with music
                if (isMeditationMode) {
                    // Additional 50% reduction in meditation mode (0.7 * 0.5 = 0.35 total reduction)
                    // This makes meditation sound effects blend into the music better
                    baseVolume *= 0.5;
                }
            }
            
            // Use Tone.js for sound effects if available (unified with music system).
            // Thread skipQuantization through so callers that request immediate
            // playback (e.g. responsive UI clicks) actually bypass beat-grid
            // alignment — playToneSound honors it but previously never received it.
            if (typeof Tone !== 'undefined' && this.toneSynths.size > 0) {
                return this.playToneSound(sound, soundId, options, baseVolume, musicIsPlaying, autoTightMode, skipQuantization);
            }

            // Quantize to rhythm when music is playing (fallback to old system),
            // unless the caller asked for immediate playback.
            if (musicIsPlaying && typeof Tone !== 'undefined' && Tone.Transport.state === 'started' && !skipQuantization) {
                // Calculate quantized time - align to musical grid
                const now = Tone.Transport.seconds;
                const subdivision = autoTightMode ? '8n' : '16n'; // tighter (on-beat) when auto is ON
                const subdivisionTime = Tone.Time(subdivision).toSeconds();
                
                // Calculate next quantized beat
                const currentBeat = Math.floor(now / subdivisionTime);
                const nextBeat = (currentBeat + 1) * subdivisionTime;
                const quantizedDelay = Math.max(0, nextBeat - now);
                
                // Schedule the sound to play at the quantized time
                Tone.Transport.schedule((time) => {
                    this.playQuantizedSound(sound, soundId, options, baseVolume);
                    // If tightly integrated, add a light click accent on the music typingBeat to glue layers
                    try {
                        if (autoTightMode && this.toneMusic && this.toneMusic.typingBeat) {
                            const glueNote = 'C5';
                            this.toneMusic.typingBeat.triggerAttackRelease(glueNote, '64n', time);
                        }
                    } catch (_) {
                        // no-op if typingBeat not available
                    }
                }, `+${quantizedDelay}`);
                
                return true; // Sound will be handled by scheduling
            }
            
            if (sound.audio) {
                audioElement = sound.audio.cloneNode();
            } else if (sound.url && this.audioContext) {
                // Use Web Audio API when music is playing for better mixing
                if (musicIsPlaying && this.audioContext) {
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
     * Play sound using Tone.js synths (unified with music system)
     * @param {Object} sound - Sound configuration object
     * @param {string} soundId - Sound ID
     * @param {Object} options - Playback options
     * @param {number} baseVolume - Base volume level
     * @param {boolean} musicIsPlaying - Whether music is currently playing
     * @param {boolean} autoTightMode - Whether auto-cast tight integration is enabled
     * @returns {boolean} Whether sound was played successfully
     * @private
     */
    playToneSound(sound, soundId, options = {}, baseVolume, musicIsPlaying = false, autoTightMode = false, skipQuantization = false) {
        if (typeof Tone === 'undefined') {
            console.warn(`playToneSound: Tone.js not available for sound ${soundId}`);
            return false;
        }
        
        // Ensure Tone.js context is started
        if (Tone.context.state !== 'running') {
            console.warn(`playToneSound: Tone.js context not running (${Tone.context.state}), attempting to start...`);
            Tone.start().then(() => {
                console.info('Tone.js context started, retrying sound...');
                // Retry playing the sound after context starts
                setTimeout(() => {
                    this.playToneSound(sound, soundId, options, baseVolume, musicIsPlaying, autoTightMode, skipQuantization);
                }, 100);
            }).catch(err => {
                console.error('Failed to start Tone.js context:', err);
            });
            return false;
        }
        
        if (!this.toneSynths || this.toneSynths.size === 0) {
            console.warn(`playToneSound: Tone.js synths not initialized for sound ${soundId}, initializing now...`);
            // Try to initialize synths on the fly
            this.initializeToneSynths().then(() => {
                console.info('Tone.js synths initialized, retrying sound...');
                // Retry playing the sound after synths are initialized
                setTimeout(() => {
                    this.playToneSound(sound, soundId, options, baseVolume, musicIsPlaying, autoTightMode, skipQuantization);
                }, 100);
            }).catch(err => {
                console.error('Failed to initialize Tone.js synths:', err);
            });
            return false;
        }
        
        if (!this.toneSynths.has(sound.synthType)) {
            console.warn(`playToneSound: Synth type '${sound.synthType}' not found for sound ${soundId}. Available types:`, Array.from(this.toneSynths.keys()));
            return false;
        }
        
        // Ensure SFX master gain is initialized
        if (!this.toneSfxMaster) {
            console.warn('playToneSound: SFX master gain not initialized, initializing now...');
            // Create master gain on the fly
            const sfxVolumeLinear = this.sfxVolume * this.masterVolume;
            const sfxVolumeDb = sfxVolumeLinear * 20 - 20 - 6;
            this.toneSfxMaster = new Tone.Gain().toDestination();
            this.toneSfxMaster.gain.value = Tone.dbToGain(sfxVolumeDb);
            console.info('SFX master gain created with value:', this.toneSfxMaster.gain.value);
            
            // If synths exist but aren't connected, reconnect them
            if (this.toneSynths && this.toneSynths.size > 0) {
                console.info('Reconnecting synths to new master gain...');
                for (const [synthType, synth] of this.toneSynths) {
                    // Disconnect from old output and reconnect to new master
                    synth.disconnect();
                    synth.connect(this.toneSfxMaster);
                    console.info(`Reconnected ${synthType} synth to master gain`);
                }
            }
        }
        
        try {
            const synth = this.toneSynths.get(sound.synthType);
            
            // Verify synth is connected
            if (!synth.context) {
                console.warn(`playToneSound: Synth ${sound.synthType} has no context, reconnecting...`);
                synth.connect(this.toneSfxMaster);
            }
            
            // Set synth volume based on baseVolume
            // baseVolume accounts for meditation mode reduction and music blending
            // Master gain (toneSfxMaster) controls overall SFX volume via slider
            // Individual synth volume (baseVolume) controls per-sound volume for blending
            // Convert baseVolume (0-1) to dB: baseVolume * 20 - 20, but keep it in a reasonable range
            // For meditation mode, baseVolume is already reduced (0.15 * 0.7 * 0.5 = 0.0525)
            const synthVolumeDb = baseVolume > 0 ? (baseVolume * 20 - 20) : -60; // -60 dB = effectively silent
            synth.volume.value = synthVolumeDb; // Set synth volume in dB
            
            // Determine quantization based on sound config and music state
            let quantization = sound.quantization || 'normal';
            if (musicIsPlaying && sound.quantization) {
                quantization = sound.quantization;
            } else if (musicIsPlaying) {
                quantization = autoTightMode ? 'tight' : 'normal';
            }
            
            const subdivision = this.soundDesignConfig.quantization[quantization] || '16n';
            
            // Play sound with rhythmic quantization if music is playing (unless skipQuantization is true)
            if (musicIsPlaying && Tone.Transport.state === 'started' && !skipQuantization) {
                const now = Tone.Transport.seconds;
                const subdivisionTime = Tone.Time(subdivision).toSeconds();
                const currentBeat = Math.floor(now / subdivisionTime);
                const nextBeat = (currentBeat + 1) * subdivisionTime;
                const quantizedDelay = Math.max(0, nextBeat - now);
                
                // Schedule sound to play at quantized time
                Tone.Transport.schedule((time) => {
                    this.triggerToneSound(synth, sound, time);
                    
                    // If tightly integrated, add accent on music typingBeat
                    if (autoTightMode && this.toneMusic && this.toneMusic.typingBeat) {
                        try {
                            this.toneMusic.typingBeat.triggerAttackRelease('C5', '64n', time);
                        } catch (_) {
                            // no-op
                        }
                    }
                }, `+${quantizedDelay}`);
                
                return true;
            } else {
                // Play immediately (no music playing or skipQuantization is true)
                console.info(`playToneSound: Playing sound ${soundId} immediately at Tone.now():`, Tone.now());
                // Use Tone.now() for immediate playback
                const playTime = Tone.now();
                this.triggerToneSound(synth, sound, playTime);
                return true;
            }
        } catch (error) {
            console.warn('Error playing Tone.js sound:', error);
            return false;
        }
    }
    
    /**
     * Trigger a Tone.js sound (handles single notes, chords, and noise)
     * @param {any} synth - Tone.js synth to use
     * @param {Object} sound - Sound configuration
     * @param {number|string} time - Time to trigger (Tone.js time or Transport time)
     * @private
     */
    triggerToneSound(synth, sound, time) {
        try {
            // Verify synth is connected before playing
            if (!synth.context) {
                console.warn('triggerToneSound: Synth has no context, attempting to reconnect...');
                if (this.toneSfxMaster) {
                    // Determine correct output based on mode
                    const isMeditationMode = window.meditationState && window.meditationState.activeSession;
                    let output = this.toneSfxMaster;
                    
                    if (isMeditationMode && this.toneSfxChorus) {
                        output = this.toneSfxChorus;
                    } else if (!isMeditationMode && this.toneSfxHighPass) {
                        output = this.toneSfxHighPass;
                    }
                    
                    synth.connect(output);
                    console.info('Synth reconnected to', isMeditationMode ? 'effects chain' : 'normal mode chain');
                } else {
                    console.warn('triggerToneSound: Cannot reconnect synth - no master gain');
                    return;
                }
            }
            
            // Apply per-sound-type effects in normal mode
            const isMeditationMode = window.meditationState && window.meditationState.activeSession;
            if (!isMeditationMode) {
                // For purchases/upgrades: add subtle distortion
                if (sound.synthType === 'percussive' && (sound.id === 'purchase' || sound.id === 'upgrade')) {
                    if (!this.toneSfxDistortion) {
                        this.toneSfxDistortion = new Tone.Distortion({
                            distortion: 0.2, // Subtle grit
                            oversample: '2x' // Prevents aliasing
                        });
                        // Connect distortion to the normal mode chain
                        if (this.toneSfxHighPass) {
                            this.toneSfxDistortion.connect(this.toneSfxHighPass);
                        }
                    }
                    // Note: We can't easily route individual sounds through different effects
                    // without creating separate synth instances. For now, distortion is available
                    // but would need to be applied at synth creation time.
                }
                
                // For achievements: add tremolo
                if (sound.synthType === 'melodic' && (sound.id === 'achievement' || sound.id === 'level_up')) {
                    if (!this.toneSfxTremolo) {
                        this.toneSfxTremolo = new Tone.Tremolo({
                            frequency: 4, // 4 Hz - moderate speed
                            depth: 0.3 // 30% depth - subtle pulsing
                        });
                        // Connect tremolo to the normal mode chain
                        if (this.toneSfxHighPass) {
                            this.toneSfxTremolo.connect(this.toneSfxHighPass);
                        }
                    }
                    // Note: Same limitation as distortion - would need separate synth instances
                }
            }
            
            console.info(`triggerToneSound: Triggering sound at time ${time}, synthType: ${sound.synthType}`, {
                hasNote: !!sound.note,
                hasNotes: !!(sound.notes && Array.isArray(sound.notes)),
                duration: sound.duration,
                synthType: sound.synthType,
                synthConnected: synth.context ? 'yes' : 'no',
                synthVolume: synth.volume ? synth.volume.value : 'N/A'
            });
            
            if (sound.synthType === 'noise') {
                // Noise-based sounds
                console.info(`triggerToneSound: Starting noise sound, will stop at +${sound.duration || '16n'}`);
                synth.start(time);
                synth.stop(`+${sound.duration || '16n'}`);
            } else if (sound.notes && Array.isArray(sound.notes)) {
                // Chord-based sounds (play notes in sequence for arpeggio effect)
                // Calculate note duration (divide total duration by number of notes)
                const totalDuration = Tone.Time(sound.duration || '4n').toSeconds();
                const noteDuration = totalDuration / sound.notes.length;
                // Use a simple duration string for each note
                const noteDurationStr = noteDuration < 0.1 ? '32n' : noteDuration < 0.2 ? '16n' : '8n';
                
                // Track the last trigger time to ensure strictly increasing times
                let lastTriggerTime = time;
                
                sound.notes.forEach((note, index) => {
                    if (index === 0) {
                        // First note plays at the scheduled time
                        synth.triggerAttackRelease(note, noteDurationStr, time);
                        lastTriggerTime = time;
                    } else {
                        // Subsequent notes play after previous notes
                        // Calculate delay in seconds and ensure strictly increasing time
                        const delaySeconds = noteDuration * index;
                        // Ensure at least 1ms gap between notes to prevent timing errors
                        const minDelay = Math.max(delaySeconds, (/** @type {number} */ (lastTriggerTime) + 0.001) - /** @type {number} */ (time));
                        const nextTime = /** @type {number} */ (time) + minDelay;
                        
                        // Use absolute time instead of relative delay to ensure strict ordering
                        synth.triggerAttackRelease(note, noteDurationStr, nextTime);
                        lastTriggerTime = nextTime;
                    }
                });
            } else if (sound.note) {
                // Single note sounds
                synth.triggerAttackRelease(sound.note, sound.duration || '16n', time);
            }
        } catch (error) {
            console.warn('Error triggering Tone.js sound:', error);
        }
    }
    
    /**
     * Play a quantized sound effect (scheduled to rhythm) - fallback for old system
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
        
        // Update Tone.js master gain for sound effects
        if (this.toneSfxMaster) {
            // Convert SFX volume to dB scale to match music volume system
            const sfxVolumeLinear = this.sfxVolume * this.masterVolume;
            // Convert to dB: linear * 20 - 20, but reduce by 6 dB to balance with music
            const sfxVolumeDb = sfxVolumeLinear * 20 - 20 - 6; // -6 dB reduction for balance
            this.toneSfxMaster.gain.value = Tone.dbToGain(sfxVolumeDb); // Convert dB to linear gain
            console.info('SFX volume updated:', sfxVolumeDb, 'dB (linear:', sfxVolumeLinear, 'sfxVolume:', this.sfxVolume, 'masterVolume:', this.masterVolume, ')');
        }
        
        // Apply volume to all active sounds (fallback for old system)
        for (const activeSound of this.activeSounds) {
            const sound = this.soundEffects.get(activeSound.id);
            if (sound && activeSound.element) {
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
        
        // Ensure Tone.js synths are initialized if sound effects are enabled
        if (this.soundEffectsEnabled && typeof Tone !== 'undefined' && !this.toneSfxMaster) {
            // Initialize Tone.js synths if not already initialized
            this.initializeToneSynths();
        }
        
        // Update Tone.js master gain for sound effects
        if (this.toneSfxMaster) {
            // Convert SFX volume to dB scale to match music volume system
            const sfxVolumeLinear = this.sfxVolume * this.masterVolume;
            // Convert to dB: linear * 20 - 20, but reduce by 6 dB to balance with music
            const sfxVolumeDb = sfxVolumeLinear * 20 - 20 - 6; // -6 dB reduction for balance
            this.toneSfxMaster.gain.value = Tone.dbToGain(sfxVolumeDb); // Convert dB to linear gain
            console.info('SFX volume updated:', sfxVolumeDb, 'dB (linear:', sfxVolumeLinear, 'sfxVolume:', this.sfxVolume, 'masterVolume:', this.masterVolume, ')');
        }
        
        // Apply volume to all active sounds (fallback for old system)
        for (const activeSound of this.activeSounds) {
            const sound = this.soundEffects.get(activeSound.id);
            if (sound && activeSound.element) {
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
            let currentTier;
            try {
                const tierSys =
                    window.uiManager?.systems?.designTierSystem ||
                    window.designTierSystem;
                currentTier = Number(tierSys?.getCurrentTier?.() ?? 0) || 0;
            } catch {
                currentTier = 0;
            }

            // STRICT: policy seam — tiers 0-3 must NEVER have music
            if (!shouldAllowMusic(currentTier)) {
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
        return volume !== null ? parseFloat(volume) : 0.5; // Default to 0.5 (50%) to match SFX volume
    }
    
    /**
     * Save music volume to localStorage
     * @private
     */
    saveMusicVolume() {
        localStorage.setItem('cyberWitchesMusicVolume', this.musicVolume.toString());
    }
    
    /**
     * Set music volume
     * @param {number} volume - Volume level (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.saveMusicVolume();
        
        // Apply volume to currently playing music
        if (this.musicGainNodes && this.musicGainNodes.length > 0) {
            const musicVolume = this.musicVolume * this.masterVolume;
            // Update Web Audio API gain nodes if they exist
            for (const gainNode of this.musicGainNodes) {
                if (gainNode && gainNode.gain) {
                    gainNode.gain.value = musicVolume;
                }
            }
        }
        
        // Update Tone.js master volume if it exists
        if (this.toneMusic && this.toneMusic.masterVol && window.Tone) {
            const musicVolume = this.musicVolume * this.masterVolume;
            this.toneMusic.masterVol.volume.value = musicVolume * 20 - 20; // Convert 0-1 to dB
        }
        // (Removed a dead `if (this.masterVol …)` fallback: `this.masterVol` is
        // never assigned anywhere — the real handle is `this.toneMusic.masterVol`
        // above — so the block could never run.)
    }
    
    /**
     * Enable sound effects (for design tier system)
     * This ensures sound effects are enabled when Tier 2 is unlocked
     * LAZY LOADING: Only loads sounds when Tier 2+ is reached
     */
    async enableSoundEffects() {
        this.soundEffectsEnabled = true;
        console.info('enableSoundEffects called - enabling sound effects (lazy loading)');
        
        // Lazy load sounds if not already loaded
        if (!this.soundsLoaded) {
            await this.lazyLoadSounds();
        }
        
        // Ensure Tone.js synths are initialized (they should be initialized in lazyLoadSounds, but double-check)
        if ((await this.ensureToneLoaded()) && (!this.toneSynths || this.toneSynths.size === 0)) {
            console.info('enableSoundEffects: Tone.js synths not initialized, initializing now...');
            await this.initializeToneSynths();
            console.info('enableSoundEffects: Tone.js synths initialized, size:', this.toneSynths ? this.toneSynths.size : 0);
        }
        
        // Ensure audio context is resumed (required by browsers)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.info('Audio context resumed for sound effects');
            } catch (error) {
                console.error('Failed to resume audio context:', error);
                handleError(error, 'resumeAudioContextForSFX');
            }
        }
        
        // Unlock audio if needed (required for browser autoplay policies)
        if (this.audioUnlockRequired) {
            await this.unlockAudio();
        }
        
        // Ensure we're not muted
        if (this.isMuted) {
            this.isMuted = false;
            this.saveMutedStatus();
            console.info('Unmuted audio for sound effects');
        }
        
        // Ensure SFX volume is set
        if (this.sfxVolume === 0) {
            this.sfxVolume = 0.5;
            this.saveSfxVolume();
            console.info('SFX volume set to 0.5');
        }
        
        // Ensure master volume is set
        if (this.masterVolume === 0) {
            this.masterVolume = 0.5;
            this.saveMasterVolume();
            console.info('Master volume set to 0.5');
        }
        
        console.info('Sound effects enabled - state:', {
            soundEffectsEnabled: this.soundEffectsEnabled,
            isMuted: this.isMuted,
            sfxVolume: this.sfxVolume,
            masterVolume: this.masterVolume,
            audioContextState: this.audioContext ? this.audioContext.state : 'no context',
            isInitialized: this.isInitialized,
            soundsLoaded: this.soundsLoaded
        });
    }
    
    /**
     * Disable sound effects (for design tier system)
     * This disables sound effects when Tier 0 or Tier 1 is active
     */
    disableSoundEffects() {
        this.soundEffectsEnabled = false;
        console.info('Sound effects disabled');
    }
    
    /**
     * Enable music (for design tier system)
     * This ensures music is enabled when Tier 4 is unlocked
     * ONLY works at Tier 4 - tiers 0-3 must NEVER have music
     * LAZY LOADING: Only initializes audio and loads music when Tier 4+ is reached
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
        console.info('enableMusic called - unlocking audio and starting music (lazy loading)');
        
        // Lazy load sounds if not already loaded (needed for music system)
        if (!this.soundsLoaded) {
            await this.lazyLoadSounds();
        }
        
        // Unlock audio if needed (required for browser autoplay policies)
        if (this.audioUnlockRequired) {
            await this.unlockAudio();
        }
        
        // Ensure audio context is running
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.info('Audio context resumed in enableMusic');
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
        
        console.info('Music volume settings:', {
            musicVolume: this.musicVolume,
            masterVolume: this.masterVolume,
            finalVolume: this.musicVolume * this.masterVolume
        });
        
        // Start playing ambient music
        await this.startMusic();
        console.info('Music enabled and startMusic called');
    }
    
    /**
     * Disable music (for design tier system)
     * This disables music when Tier 0-3 is active
     */
    disableMusic() {
        console.info('disableMusic called - disabling music');
        this.musicEnabled = false;
        this.stopMusic();
        console.info('Music disabled');
    }
    
    /**
     * Start playing procedural ambient music
     * Creates layered ambient loops using Web Audio API
     * STRICT: Only works at Tier 4 - tiers 0-3 must NEVER have music
     */
    async startMusic() {
        console.info('🎵 startMusic called');
        console.info('🎵 Current tier:', window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0);
        console.info('🎵 Music enabled:', this.musicEnabled);
        console.info('🎵 Music nodes length:', this.musicNodes.length);
        console.info('🎵 Is initialized:', this.isInitialized);
        console.info('🎵 Audio context:', !!this.audioContext);
        console.info('🎵 Audio context state:', this.audioContext ? this.audioContext.state : 'no context');
        console.info('🎵 Is muted:', this.isMuted);
        console.info('🎵 Current music mode:', this.currentMusicMode);
        console.info('🎵 Music volume:', this.musicVolume);
        console.info('🎵 Master volume:', this.masterVolume);
        
        // STRICT CHECK: Only allow music at Tier 4
        const currentTier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
        if (currentTier < 4) {
            console.info('❌ Music not starting - tier:', currentTier, '(music only available at Tier 4)');
            this.musicEnabled = false; // Force disable if tier < 4
            this.stopMusic(); // Ensure any playing music is stopped
            return;
        }
        
        if (!this.musicEnabled) {
            console.info('Music not starting - music disabled. Attempting to enable...');
            // Try to enable music if at Tier 4
            if (currentTier >= 4) {
                await this.enableMusic();
                if (!this.musicEnabled) {
                    console.info('Failed to enable music');
                    return;
                }
            } else {
                this.stopMusic(); // Ensure any playing music is stopped
                return;
            }
        }
        
        // Don't start if already playing
        if (this.musicNodes.length > 0) {
            console.info('Music already playing');
            return;
        }
        
        if (!this.isInitialized || !this.audioContext || this.isMuted) {
            console.info('Music not starting - initialized:', this.isInitialized, 'context:', !!this.audioContext, 'muted:', this.isMuted);
            return;
        }
        
        // Check audio context state and resume if suspended
        if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.info('Audio context resumed for music');
            } catch (error) {
                console.error('Failed to resume audio context:', error);
                handleError(error, 'resumeAudioContext');
            }
        }
        
        try {
            // Always use normal tier 4 music
            this.currentMusicMode = 'normal';
            await this.createAmbientMusic();
            console.info('Music started successfully');
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
        
        console.info('stopMusic called - stopping all music nodes');
        
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
                // Stop loops first (before disposing synths)
                if (this.toneMusic.bassLoop) {
                    try {
                        this.toneMusic.bassLoop.stop();
                        this.toneMusic.bassLoop.dispose();
                    } catch (_e) {
                        // Ignore if already disposed
                    }
                }
                if (this.toneMusic.midLoop) {
                    try {
                        this.toneMusic.midLoop.stop();
                        this.toneMusic.midLoop.dispose();
                    } catch (_e) {
                        // Ignore if already disposed
                    }
                }
                if (this.toneMusic.sparkleLoop) {
                    try {
                        this.toneMusic.sparkleLoop.stop();
                        this.toneMusic.sparkleLoop.dispose();
                    } catch (_e) {
                        // Ignore if already disposed
                    }
                }
                if (this.toneMusic.typingLoop) {
                    try {
                        this.toneMusic.typingLoop.stop();
                        this.toneMusic.typingLoop.dispose();
                    } catch (_e) {
                        // Ignore if already disposed
                    }
                }
                
                // Stop LFOs
                if (this.toneMusic.bassLFO) {
                    try {
                        this.toneMusic.bassLFO.stop();
                        this.toneMusic.bassLFO.dispose();
                    } catch (_e) {
                        // Ignore if already disposed
                    }
                }
                
                // Clear any pending chord triggers
                
                // Release all notes from synths (PolySynth and MonoSynth have releaseAll)
                if (this.toneMusic.bassPad && typeof this.toneMusic.bassPad.releaseAll === 'function') {
                    try {
                        this.toneMusic.bassPad.releaseAll();
                    } catch (_e) {
                        // Ignore if already disposed
                    }
                }
                if (this.toneMusic.midPad && typeof this.toneMusic.midPad.releaseAll === 'function') {
                    try {
                        this.toneMusic.midPad.releaseAll();
                    } catch (_e) {
                        // Ignore if already disposed
                    }
                }
                if (this.toneMusic.softPad && typeof this.toneMusic.softPad.releaseAll === 'function') {
                    try {
                        this.toneMusic.softPad.releaseAll();
                    } catch (_e) {
                        // Ignore if already disposed
                    }
                }
                // Note: typingBeat is a MonoSynth, not a PolySynth, so it might not have releaseAll
                if (this.toneMusic.typingBeat) {
                    try {
                        if (typeof this.toneMusic.typingBeat.releaseAll === 'function') {
                            this.toneMusic.typingBeat.releaseAll();
                        } else {
                            this.toneMusic.typingBeat.triggerRelease();
                        }
                    } catch (_e) {
                        // Ignore if already disposed
                    }
                }
                
                // Dispose effects (with error handling)
                if (this.toneMusic.delay) {
                    try {
                        this.toneMusic.delay.dispose();
                    } catch (_e) {
                        // Ignore if already disposed
                    }
                }
                if (this.toneMusic.reverb) {
                    try {
                        this.toneMusic.reverb.dispose();
                    } catch (_e) {
                        // Ignore if already disposed
                    }
                }
                if (this.toneMusic.masterVol) {
                    try {
                        this.toneMusic.masterVol.dispose();
                    } catch (_e) {
                        // Ignore if already disposed
                    }
                }
                
                // Dispose synths (with error handling)
                if (this.toneMusic.bassPad) {
                    try {
                        this.toneMusic.bassPad.dispose();
                    } catch (_e) {
                        // Ignore if already disposed
                    }
                }
                if (this.toneMusic.midPad) {
                    try {
                        this.toneMusic.midPad.dispose();
                    } catch (_e) {
                        // Ignore if already disposed
                    }
                }
                if (this.toneMusic.softPad) {
                    try {
                        this.toneMusic.softPad.dispose();
                    } catch (_e) {
                        // Ignore if already disposed
                    }
                }
                if (this.toneMusic.typingBeat) {
                    try {
                        this.toneMusic.typingBeat.dispose();
                    } catch (_e) {
                        // Ignore if already disposed
                    }
                }
                
                this.toneMusic = null;
                console.info('Tone.js music stopped');
            } catch (error) {
                console.error('Error stopping Tone.js music:', error);
            }
        }
        
        // Only fade out if we have nodes to fade out
        if (this.musicNodes.length === 0 || this.musicGainNodes.length === 0) {
            console.info('No music nodes to stop');
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
                    console.info('Fading out gain node from', currentValue, 'to 0');
                }
            } catch (error) {
                console.error('Error fading out gain node:', error);
            }
        });
        
        // Stop all music nodes after fade out
        const stopTimeout = setTimeout(() => {
            console.info('Stopping all music nodes after fade out...');
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
            console.info('Music nodes cleared');
        }, 2000); // Wait for fade out to complete
        
        // Store timeout for potential cancellation
        this.stopMusicTimeout = stopTimeout;
    }
    
    /**
     * Create ambient music using Tone.js for better sound quality
     * @private
     */
    async createAmbientMusic() {
        // Check if Tone.js is available
        if (!(await this.ensureToneLoaded())) {
            console.warn('Tone.js not available, falling back to basic Web Audio API');
            this.createAmbientMusicBasic();
            return;
        }
        
        try {
            // Use Tone.js for better ambient music (now async in Tone.js 15+)
            await this.createAmbientMusicWithTone();
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
    async createAmbientMusicWithTone() {
        // Double-check tier before creating music (Tier 4 only)
        const currentTier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
        if (currentTier < 4 || !this.musicEnabled) {
            console.info('createAmbientMusic: tier check failed', currentTier, this.musicEnabled);
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
        
        console.info('Creating ambient music with Tone.js, volume:', musicVolume);
        
        // Final check - if still zero, something is wrong
        if (musicVolume === 0) {
            console.error('Music volume is still 0 after adjustments! Aborting music creation.');
            return;
        }
        
        // Start Tone.js if not already started (Tone.js 15+ requires await)
        if (Tone.context.state !== 'running') {
            try {
                await Tone.start();
                console.info('Tone.js context started');
            } catch (err) {
                console.warn('Tone.start() failed, audio may not work:', err);
            }
        }
        
        // Create a master volume control first
        // Music volume calculation: musicVolume * masterVolume (both 0-1)
        // Convert to dB: (0-1) * 20 - 20 = (-20 to 0 dB)
        // For better balance with SFX, we'll use a similar range
        const volumeDb = musicVolume * 20 - 20; // Convert 0-1 to dB (-20 to 0 dB)
        const masterVol = new Tone.Volume(volumeDb).toDestination();
        console.info('Music master volume created:', volumeDb, 'dB (from musicVolume:', musicVolume, 'masterVolume:', this.masterVolume, ')');
        
        // Check meditation mode for reverb settings (will be redeclared later, but needed here for reverb)
        const isMeditationModeForReverb = window.meditationState && window.meditationState.activeSession;
        
        // Create a reverb for ambient atmosphere
        // In meditation mode, use 100% reverb (roomSize: 1.0) for more atmospheric sound
        const reverbRoomSize = isMeditationModeForReverb ? 1.0 : 0.65;
        const reverbDampening = isMeditationModeForReverb ? 2000 : 5000; // Warmer (lower dampening) in meditation mode, brighter (higher dampening) in normal mode
        const reverb = new Tone.Reverb({
            roomSize: reverbRoomSize,
            dampening: reverbDampening
        }).connect(masterVol);
        
        // Generate reverb (async, but we'll start it)
        // Note: reverb will be stored in this.toneMusic object later when it's created
        reverb.generate()
            .then(() => {
                console.info('Reverb generated', isMeditationModeForReverb ? '(meditation mode - 100% reverb)' : '(normal mode - 70% reverb)');
            })
            .catch(err => {
                console.error('Failed to generate reverb for music:', err);
                handleError(err, 'AudioSystem.initializeToneMusic.reverb', false, ErrorCategory.AUDIO, ErrorSeverity.MEDIUM);
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
        let lastBassTime = 0; // Track last trigger time to prevent duplicate triggers
        const bassLoop = new Tone.Loop((time) => {
            // Ensure time is strictly greater than previous time
            if (time <= lastBassTime) {
                time = lastBassTime + 0.001; // Add small offset to ensure strict increase
            }
            lastBassTime = time;
            
            const currentProgression = chordProgressions[currentProgressionIndex];
            // Only play every other loop iteration to create rhythm breaks
            if (loopIteration % 2 === 0) {
                const chord = currentProgression[chordIndex % currentProgression.length];
                try {
                    console.info('Bass loop playing chord:', chord, 'from progression', currentProgressionIndex, 'at time:', time);
                    bassPad.triggerAttackRelease(chord, '4n', time); // Longer duration: quarter note for sustained bass
                } catch (error) {
                    console.warn('Error triggering bass pad:', error);
                }
                
                // Only advance chord index when we actually play
                chordIndex++;
                // Check if we've completed a full cycle
                if (chordIndex % currentProgression.length === 0) {
                    progressionChangeCounter++;
                    // Change progression every N cycles
                    if (progressionChangeCounter >= progressionsPerChange) {
                        progressionChangeCounter = 0;
                        currentProgressionIndex = (currentProgressionIndex + 1) % chordProgressions.length;
                        console.info('Switching to progression', currentProgressionIndex);
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
        let lastMidTime = 0; // Track last trigger time to prevent duplicate triggers
        const midLoop = new Tone.Loop((time) => {
            // Ensure time is strictly greater than previous time
            if (time <= lastMidTime) {
                time = lastMidTime + 0.001; // Add small offset to ensure strict increase
            }
            lastMidTime = time;
            
            const currentProgression = chordProgressions[midProgressionIndex];
            // Only play on odd loop iterations to offset from bass and create rhythm breaks
            if (midLoopIteration % 2 === 1) {
                const chord = currentProgression[midChordIndex % currentProgression.length];
                const higherChord = chord.map(note => {
                    const match = note.match(/([A-G])(\d)/);
                    if (match) {
                        return match[1] + (parseInt(match[2], 10) + 2);
                    }
                    return note;
                });
                try {
                    console.info('Mid loop playing chord:', higherChord, 'from progression', midProgressionIndex, 'at time:', time);
                    midPad.triggerAttackRelease(higherChord, '16n', time); // Very short duration: 16th note to reduce overlap
                } catch (error) {
                    console.warn('Error triggering mid pad:', error);
                }
                
                // Only advance chord index when we actually play
                midChordIndex++;
                // Check if we've completed a full cycle
                if (midChordIndex % currentProgression.length === 0) {
                    midProgressionChangeCounter++;
                    // Change progression every N cycles (slightly different timing for variety)
                    if (midProgressionChangeCounter >= progressionsPerChange + 4) {
                        midProgressionChangeCounter = 0;
                        midProgressionIndex = (midProgressionIndex + 1) % chordProgressions.length;
                        console.info('Mid pad switching to progression', midProgressionIndex);
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
        let lastSparkleTime = 0; // Track last trigger time to prevent duplicate triggers
        const sparkleLoop = new Tone.Loop((time) => {
            // Ensure time is strictly greater than previous time
            if (time <= lastSparkleTime) {
                time = lastSparkleTime + 0.001; // Add small offset to ensure strict increase
            }
            lastSparkleTime = time;
            
            const currentMelody = shuffledSparkleMelodies[sparkleMelodyIndex];
            const note = currentMelody[sparkleNoteIndex % currentMelody.length];
            
            if (note !== null) {
                try {
                    console.info('Sparkle playing note:', note, 'from pattern', sparkleMelodyIndex, 'at time:', time);
                    sparkle.triggerAttackRelease(note, '32n', time); // Shorter duration: 32nd note for crisper sparkle
                } catch (error) {
                    console.warn('Error triggering sparkle:', error);
                }
            }
            
            sparkleNoteIndex++;
            
            // Change pattern every 4 cycles for variety
            if (sparkleNoteIndex % currentMelody.length === 0) {
                sparkleCycleCount++;
                if (sparkleCycleCount >= 4) {
                    sparkleCycleCount = 0;
                    sparkleMelodyIndex = (sparkleMelodyIndex + 1) % shuffledSparkleMelodies.length;
                    console.info('Sparkle switching to pattern', sparkleMelodyIndex);
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
        let lastTypingTime = 0; // Track last trigger time to prevent duplicate triggers
        const typingLoop = new Tone.Loop((time) => {
            // Ensure time is strictly greater than previous time
            if (time <= lastTypingTime) {
                time = lastTypingTime + 0.001; // Add small offset to ensure strict increase
            }
            lastTypingTime = time;
            
            const currentPattern = typingPatterns[typingPatternIndex];
            const note = currentPattern[typingIndex % currentPattern.length];
            if (note !== null) {
                try {
                    console.info('Typing beat playing note:', note, 'from pattern', typingPatternIndex, 'at time:', time);
                    typingBeat.triggerAttackRelease(note, '64n', time); // Even shorter click for more percussive sound
                } catch (error) {
                    console.warn('Error triggering typing beat:', error);
                }
            }
            typingIndex++;
            // Change pattern every 8 cycles for variety
            typingCycleCount++;
            if (typingCycleCount >= 8) {
                typingCycleCount = 0;
                typingPatternIndex = (typingPatternIndex + 1) % typingPatterns.length;
                typingIndex = 0; // Reset index when changing patterns
                console.info('Typing beat switching to pattern', typingPatternIndex);
            }
        }, '8n'); // Every 8th note
        // Don't start yet - will be scheduled after Transport starts
        
        // Set initial volumes to very low for fade-in effect
        // Target volumes (will be reached after fade-in)
        // In meditation mode, mute sparkle and typing beat
        const isMeditationMode = window.meditationState && window.meditationState.activeSession;
        const targetVolumes = {
            bassPad: 2,      // Bass pad target
            midPad: -2,      // Mid pad target
            sparkle: isMeditationMode ? -60 : -20,    // Sparkle target (muted in meditation)
            typingBeat: isMeditationMode ? -60 : -12  // Typing beat target (muted in meditation)
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
        
        // Sparkle fades in after 2 seconds (or stays muted in meditation)
        sparkle.volume.setValueAtTime(-60, now);
        if (!isMeditationMode) {
            sparkle.volume.linearRampToValueAtTime(-60, now + 2);
            sparkle.volume.linearRampToValueAtTime(targetVolumes.sparkle, now + 2 + fadeInDuration);
        } else {
            // Keep muted in meditation mode
            sparkle.volume.setValueAtTime(-60, now);
        }
        
        // Typing beat fades in after 1.5 seconds (or stays muted in meditation)
        typingBeat.volume.setValueAtTime(-60, now);
        if (!isMeditationMode) {
            typingBeat.volume.linearRampToValueAtTime(-60, now + 1.5);
            typingBeat.volume.linearRampToValueAtTime(targetVolumes.typingBeat, now + 1.5 + fadeInDuration);
        } else {
            // Keep muted in meditation mode
            typingBeat.volume.setValueAtTime(-60, now);
        }
        
        console.info('Volume fade-ins scheduled:', {
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
            console.info('Bass LFO started after fade-in');
        }, 3000); // Start after 3 seconds (when fade-in completes)
        
        // Set tempo based on mode: 90 BPM for meditation (20 BPM slower), 110 BPM for normal
        // isMeditationMode already defined above
        const baseBPM = isMeditationMode ? 90 : 110;
        Tone.Transport.bpm.value = baseBPM;
        console.info('Tone Transport BPM set to:', Tone.Transport.bpm.value, isMeditationMode ? '(meditation mode)' : '(normal mode)');
        
        // Stop and reset Transport to ensure clean start timing
        if (Tone.Transport.state === 'started') {
            Tone.Transport.stop();
            Tone.Transport.cancel();
            console.info('Transport stopped and cancelled');
        }
        
        // Reset Transport position to 0 for clean start
        Tone.Transport.position = 0;
        
        // Start Transport to play sequences (REQUIRED for Tone.Sequence to work!)
        if (Tone.Transport.state !== 'started') {
            Tone.Transport.start();
            console.info('Tone Transport started at position 0');
        } else {
            console.info('Tone Transport already started');
        }
        
        // Verify Transport is actually running
        console.info('Transport state after start:', Tone.Transport.state);
        console.info('Transport BPM:', Tone.Transport.bpm.value);
        console.info('Transport position:', Tone.Transport.position);
        
        // Schedule all loops to start at their staggered times
        // Using time strings makes them relative to Transport position
        // Since Transport position is reset to 0, these will be relative to beat 0
        bassLoop.start('0'); // Start immediately at beat 0
        console.info('Bass loop scheduled to start at beat 0');
        
        midLoop.start('4n'); // Start at beat 4 (4 beats after bass)
        console.info('Mid loop scheduled to start at beat 4');
        
        typingLoop.start('8n'); // Start at beat 8 (4 beats after mid, 8 beats after bass)
        console.info('Typing loop scheduled to start at beat 8');
        
        sparkleLoop.start('12n'); // Start at beat 12 (4 beats after typing, 12 beats after bass)
        console.info('Sparkle loop scheduled to start at beat 12');
        
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
        
        console.info('Ambient music created with Tone.js - chord progression and melodies');
        console.info('Music volume:', musicVolume, 'Master volume dB:', musicVolume * 20 - 20);
        console.info('Tone context state:', Tone.context.state);
        console.info('Transport state:', Tone.Transport.state);
    }
    /**
     * Fallback: Create basic ambient music using Web Audio API
     * @private
     */
    createAmbientMusicBasic() {
        // Deliberate graceful no-op: background music is a Tone.js feature. When
        // Tone.js is unavailable (CDN blocked/offline before cache) we skip music
        // entirely rather than ship a second, lower-quality synth engine — the
        // game is fully playable without music. This is the intended degraded
        // path, not an unfinished stub.
        console.info('Tone.js unavailable — running without background music.');
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
            const tier = window.designTierSystem ? window.designTierSystem.getCurrentTier() : 0;
            const autoTightMode = tier >= 4 && typeof window.autoCastEnabled === 'function' && window.autoCastEnabled();
            filter.frequency.value = autoTightMode ? 600 : 400; // Lift cutoff a bit in tight mode for clarity
            filter.Q.value = 0.5; // Gentle slope
            
            // Calculate volume (reduced when music is playing, but louder than before)
            const baseVolume = (options.volume || sound.volume) * this.sfxVolume * this.masterVolume;
            const harmoniousVolume = baseVolume * (autoTightMode ? 0.45 : 0.35); // Slightly more forward in tight mode
            
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
                    } catch (_e) {
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
     * Update music for meditation mode
     * Adjusts tempo and stops sparkle/typing loops (saves CPU)
     */
    updateMusicForMeditation() {
        if (!this.toneMusic || !Tone.Transport) return;
        
        const isMeditationMode = window.meditationState && window.meditationState.activeSession;
        
        // Update tempo: 90 BPM for meditation (20 BPM slower), 110 BPM for normal
        const targetBPM = isMeditationMode ? 90 : 110;
        Tone.Transport.bpm.rampTo(targetBPM, 1); // Smooth transition over 1 second
        console.info('Music tempo updated to:', targetBPM, isMeditationMode ? '(meditation mode)' : '(normal mode)');
        
        // Update reverb intensity for meditation mode (100% wet) vs normal (65%).
        // Tone.Reverb's roomSize/dampening (decay character) can't change after
        // creation, but the wet/dry mix CAN — and that mix IS the "100% vs 65%
        // reverb" the design calls for. Apply it live with a smooth ramp instead
        // of waiting for the next music recreation (previously a no-op log).
        if (this.toneMusic.reverb && this.toneMusic.reverb.wet) {
            const targetWet = isMeditationMode ? 1.0 : 0.65;
            if (typeof this.toneMusic.reverb.wet.rampTo === 'function') {
                this.toneMusic.reverb.wet.rampTo(targetWet, 1);
            } else {
                this.toneMusic.reverb.wet.value = targetWet;
            }
        }
        
        if (isMeditationMode) {
            // Stop sparkle and typing beat loops in meditation (saves CPU, not RAM)
            if (this.toneMusic.sparkleLoop) {
                try {
                    this.toneMusic.sparkleLoop.stop();
                    console.info('Sparkle loop stopped (meditation mode)');
                } catch (e) {
                    console.warn('Error stopping sparkle loop:', e);
                }
            }
            if (this.toneMusic.typingLoop) {
                try {
                    this.toneMusic.typingLoop.stop();
                    console.info('Typing loop stopped (meditation mode)');
                } catch (e) {
                    console.warn('Error stopping typing loop:', e);
                }
            }
            
            // Also mute the synths to ensure no lingering notes
            const now = Tone.Transport.now();
            if (this.toneMusic.sparkle) {
                this.toneMusic.sparkle.volume.cancelScheduledValues(now);
                this.toneMusic.sparkle.volume.setValueAtTime(this.toneMusic.sparkle.volume.value, now);
                this.toneMusic.sparkle.volume.linearRampToValueAtTime(-60, now + 0.5); // Quick fade out
            }
            if (this.toneMusic.typingBeat) {
                this.toneMusic.typingBeat.volume.cancelScheduledValues(now);
                this.toneMusic.typingBeat.volume.setValueAtTime(this.toneMusic.typingBeat.volume.value, now);
                this.toneMusic.typingBeat.volume.linearRampToValueAtTime(-60, now + 0.5); // Quick fade out
            }
        } else {
            // Restore sparkle and typing beat loops in normal mode
            if (this.toneMusic.sparkleLoop) {
                try {
                    this.toneMusic.sparkleLoop.start('12n'); // Restart at original position
                    console.info('Sparkle loop restarted (normal mode)');
                } catch (e) {
                    console.warn('Error restarting sparkle loop:', e);
                }
            }
            if (this.toneMusic.typingLoop) {
                try {
                    this.toneMusic.typingLoop.start('8n'); // Restart at original position
                    console.info('Typing loop restarted (normal mode)');
                } catch (e) {
                    console.warn('Error restarting typing loop:', e);
                }
            }
            
            // Restore sparkle and typing beat volumes in normal mode
            const now = Tone.Transport.now();
            if (this.toneMusic.sparkle) {
                this.toneMusic.sparkle.volume.cancelScheduledValues(now);
                this.toneMusic.sparkle.volume.setValueAtTime(this.toneMusic.sparkle.volume.value, now);
                this.toneMusic.sparkle.volume.linearRampToValueAtTime(-20, now + 1); // Fade in over 1 second
            }
            if (this.toneMusic.typingBeat) {
                this.toneMusic.typingBeat.volume.cancelScheduledValues(now);
                this.toneMusic.typingBeat.volume.setValueAtTime(this.toneMusic.typingBeat.volume.value, now);
                this.toneMusic.typingBeat.volume.linearRampToValueAtTime(-12, now + 1); // Fade in over 1 second
            }
        }
        
        // Update SFX reverb for meditation mode (100% reverb) or normal mode (65% reverb)
        this.updateSfxReverbForMeditation();
    }
    
    /**
     * Update SFX reverb for meditation mode
     * Recreates reverb with 100% roomSize in meditation mode, 65% in normal mode
     * @private
     */
    updateSfxReverbForMeditation() {
        if (!this.toneSfxMaster || !this.toneSynths || this.toneSynths.size === 0) {
            return; // SFX system not initialized
        }
        
        const isMeditationMode = window.meditationState && window.meditationState.activeSession;
        const targetRoomSize = isMeditationMode ? 1.0 : 0.5; // Reduced from 0.65 to 0.5 for normal mode
        const targetDampening = isMeditationMode ? 2000 : 5000; // Warmer (lower dampening) in meditation mode, brighter (higher dampening) in normal mode
        
        // Dispose of old effects if they exist
        if (this.toneSfxReverb) {
            try {
                this.toneSfxReverb.dispose();
            } catch (_e) {
                // Ignore disposal errors
            }
            this.toneSfxReverb = null;
        }
        
        if (this.toneSfxDelay) {
            try {
                this.toneSfxDelay.dispose();
            } catch (_e) {
                // Ignore disposal errors
            }
            this.toneSfxDelay = null;
        }
        
        if (this.toneSfxChorus) {
            try {
                this.toneSfxChorus.dispose();
            } catch (_e) {
                // Ignore disposal errors
            }
            this.toneSfxChorus = null;
        }
        
        // Disconnect all synths from old output
        for (const [synthType, synth] of this.toneSynths) {
            try {
                synth.disconnect();
            } catch (err) {
                console.warn(`Error disconnecting ${synthType} synth:`, err);
            }
        }
        
        // Determine output chain based on mode
        let sfxOutput;
        
        if (isMeditationMode) {
            // Meditation mode: synths -> chorus -> delay -> reverb -> master
            this.toneSfxChorus = new Tone.Chorus({
                frequency: 1.5,
                delayTime: 0.02,
                depth: 0.3,
                wet: 0.5
            });
            
            this.toneSfxDelay = new Tone.FeedbackDelay({
                delayTime: 0.4,
                feedback: 0.15
            });
            
            this.toneSfxReverb = new Tone.Reverb({
                roomSize: targetRoomSize,
                dampening: targetDampening
            });
            
            // Chain: chorus -> delay -> reverb -> master
            this.toneSfxChorus.connect(this.toneSfxDelay);
            this.toneSfxDelay.connect(this.toneSfxReverb);
            this.toneSfxReverb.connect(this.toneSfxMaster);
            sfxOutput = this.toneSfxChorus;
            
            // Generate reverb (async)
            this.toneSfxReverb.generate().then(() => {
                console.info('SFX effects chain updated (meditation mode): chorus -> delay -> reverb -> master');
            }).catch(err => {
                console.error('Failed to generate SFX reverb:', err);
            });
        } else {
            // Normal mode: synths -> reverb -> master
            this.toneSfxReverb = new Tone.Reverb({
                roomSize: targetRoomSize,
                dampening: targetDampening
            }).connect(this.toneSfxMaster);
            
            sfxOutput = this.toneSfxReverb;
            
            // Generate reverb (async)
            this.toneSfxReverb.generate().then(() => {
                console.info('SFX reverb updated (normal mode - 65% reverb)');
            }).catch(err => {
                console.error('Failed to generate SFX reverb:', err);
            });
        }
        
        // Reconnect all synths to new output
        for (const [synthType, synth] of this.toneSynths) {
            try {
                synth.connect(sfxOutput);
                console.info(`Reconnected ${synthType} synth to ${isMeditationMode ? 'effects chain' : 'reverb'}`);
            } catch (err) {
                console.warn(`Error reconnecting ${synthType} synth:`, err);
            }
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
