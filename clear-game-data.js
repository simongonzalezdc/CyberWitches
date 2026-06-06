// Simple script to clear game data
// Run this with: node clear-game-data.js

console.info('Game data reset script');
console.info('Note: This script cannot directly clear browser localStorage.');
console.info('');
console.info('To reset your game data, please use one of these methods:');
console.info('');
console.info('Method 1: Browser Console');
console.info('  1. Open your game in the browser');
console.info('  2. Press F12 (or Cmd+Option+I on Mac) to open Developer Tools');
console.info('  3. Go to the Console tab');
console.info('  4. Type: localStorage.clear(); location.reload();');
console.info('  5. Press Enter');
console.info('');
console.info('Method 2: Use reset-game.html');
console.info('  1. Open reset-game.html in your browser');
console.info('  2. It will automatically clear data and redirect');
console.info('');
console.info('Method 3: Manual deletion');
console.info('  - Open Developer Tools > Application > Storage > Local Storage');
console.info('  - Right-click and "Clear All"');
console.info('');
