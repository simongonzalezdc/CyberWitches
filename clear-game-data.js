// Simple script to clear game data
// Run this with: node clear-game-data.js

const fs = require('fs');
const path = require('path');

console.log('Game data reset script');
console.log('Note: This script cannot directly clear browser localStorage.');
console.log('');
console.log('To reset your game data, please use one of these methods:');
console.log('');
console.log('Method 1: Browser Console');
console.log('  1. Open your game in the browser');
console.log('  2. Press F12 (or Cmd+Option+I on Mac) to open Developer Tools');
console.log('  3. Go to the Console tab');
console.log('  4. Type: localStorage.clear(); location.reload();');
console.log('  5. Press Enter');
console.log('');
console.log('Method 2: Use reset-game.html');
console.log('  1. Open reset-game.html in your browser');
console.log('  2. It will automatically clear data and redirect');
console.log('');
console.log('Method 3: Manual deletion');
console.log('  - Open Developer Tools > Application > Storage > Local Storage');
console.log('  - Right-click and "Clear All"');
console.log('');
