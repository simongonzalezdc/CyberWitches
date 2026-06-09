/**
 * Tier Color Constants
 * Single source of truth for tier styling used by UI helpers and design tier system.
 * Branch A keeps legacy values; Branch B will repoint to Kyanite hex constants.
 */

export const TIER_STYLES = {
    0: {
        symbol: '◉',
        color: '#FFFFFF',
        glow: 'rgba(255, 255, 255, 0.4)',
        gradient: 'linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 100%)',
        borderGlow: 'rgba(255, 255, 255, 0.6)'
    },
    1: {
        symbol: '◆',
        color: '#FF10F0',
        glow: 'rgba(255, 16, 240, 0.4)',
        gradient: 'linear-gradient(135deg, #FF10F0 0%, #FF2DAA 100%)',
        borderGlow: 'rgba(255, 16, 240, 0.8)'
    },
    2: {
        symbol: '◈',
        color: '#FFFF00',
        glow: 'rgba(255, 255, 0, 0.4)',
        gradient: 'linear-gradient(135deg, #FFFF00 0%, #FFD700 100%)',
        borderGlow: 'rgba(255, 255, 0, 0.9)'
    },
    3: {
        symbol: '✧',
        color: '#39FF14',
        glow: 'rgba(57, 255, 20, 0.4)',
        gradient: 'linear-gradient(135deg, #39FF14 0%, #00FF00 100%)',
        borderGlow: 'rgba(57, 255, 20, 0.6)'
    },
    4: {
        symbol: '✦',
        color: '#00FFFF',
        glow: 'rgba(0, 255, 255, 0.4)',
        gradient: 'linear-gradient(135deg, #00FFFF 0%, #00CED1 100%)',
        borderGlow: 'rgba(0, 255, 255, 0.7)'
    },
    5: {
        symbol: '✪',
        color: '#FF6B00',
        glow: 'rgba(255, 107, 0, 0.6)',
        gradient: 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)',
        borderGlow: 'rgba(255, 107, 0, 0.9)'
    }
};
