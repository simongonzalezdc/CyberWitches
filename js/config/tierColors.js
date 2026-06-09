/**
 * Tier Color Constants
 * Single source of truth for tier styling used by UI helpers and design tier system.
 * Branch B maps progression colors onto the Kyanite token palette.
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
        color: '#FF2F6D',
        glow: 'rgba(255, 47, 109, 0.4)',
        gradient: 'linear-gradient(135deg, #FF2F6D 0%, #B314FF 100%)',
        borderGlow: 'rgba(255, 47, 109, 0.8)'
    },
    2: {
        symbol: '◈',
        color: '#F5D35C',
        glow: 'rgba(245, 211, 92, 0.4)',
        gradient: 'linear-gradient(135deg, #F5D35C 0%, #26E6FF 100%)',
        borderGlow: 'rgba(245, 211, 92, 0.9)'
    },
    3: {
        symbol: '✧',
        color: '#33FF99',
        glow: 'rgba(51, 255, 153, 0.4)',
        gradient: 'linear-gradient(135deg, #33FF99 0%, #26E6FF 100%)',
        borderGlow: 'rgba(51, 255, 153, 0.6)'
    },
    4: {
        symbol: '✦',
        color: '#26E6FF',
        glow: 'rgba(38, 230, 255, 0.4)',
        gradient: 'linear-gradient(135deg, #26E6FF 0%, #087DCC 100%)',
        borderGlow: 'rgba(38, 230, 255, 0.7)'
    },
    5: {
        symbol: '✪',
        color: '#087DCC',
        glow: 'rgba(8, 125, 204, 0.6)',
        gradient: 'linear-gradient(135deg, #087DCC 0%, #26E6FF 100%)',
        borderGlow: 'rgba(8, 125, 204, 0.9)'
    }
};
