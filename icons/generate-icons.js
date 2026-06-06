/**
 * Simple icon generator for Cyber Witches PWA
 * This would normally be done with proper design tools, but for now we'll create basic placeholders
 */

// This is a placeholder script - in a real project you'd use proper icon files
// For now, we'll create a simple SVG that can be used as a base

const iconSVG = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0E0E12" />
      <stop offset="100%" style="stop-color:#1A1A24" />
    </linearGradient>
    <linearGradient id="primary" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF2DAA" />
      <stop offset="100%" style="stop-color:#FF1D9A" />
    </linearGradient>
    <linearGradient id="secondary" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#22E3FF" />
      <stop offset="100%" style="stop-color:#00B8D4" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="512" height="512" fill="url(#bg)" rx="80" ry="80"/>
  
  <!-- Cyber Witch Hat -->
  <path d="M256 100 L180 200 L332 200 Z" fill="url(#primary)" stroke="#FFDB6E" stroke-width="3"/>
  <rect x="240" y="80" width="32" height="40" fill="url(#secondary)" rx="4"/>
  
  <!-- Magic Circle -->
  <circle cx="256" cy="280" r="60" fill="none" stroke="url(#secondary)" stroke-width="4"/>
  <circle cx="256" cy="280" r="50" fill="none" stroke="url(#primary)" stroke-width="2"/>
  
  <!-- Magic Symbols -->
  <text x="256" y="290" font-family="Arial" font-size="24" fill="#FFDB6E" text-anchor="middle">⚡</text>
  
  <!-- Cyber Elements -->
  <rect x="200" y="350" width="112" height="8" fill="url(#secondary)" rx="4"/>
  <rect x="220" y="370" width="72" height="8" fill="url(#primary)" rx="4"/>
  
  <!-- Sparkles -->
  <circle cx="180" cy="150" r="4" fill="#FFDB6E"/>
  <circle cx="332" cy="150" r="4" fill="#FFDB6E"/>
  <circle cx="150" cy="280" r="3" fill="#22E3FF"/>
  <circle cx="362" cy="280" r="3" fill="#22E3FF"/>
</svg>
`;

// Create a simple HTML file to display the icon
const iconHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Cyber Witches Icon</title>
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            background: #0E0E12; 
            color: white; 
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .icon-container { 
            margin: 20px; 
            padding: 20px; 
            background: rgba(255,255,255,0.1); 
            border-radius: 10px;
            text-align: center;
        }
        .sizes { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; }
        .size-box { 
            padding: 10px; 
            background: rgba(255,45,170,0.2); 
            border-radius: 5px; 
            margin: 5px;
        }
    </style>
</head>
<body>
    <h1>Cyber Witches App Icons</h1>
    <div class="icon-container">
        ${iconSVG}
        <p>Icon Size: 512x512px</p>
    </div>
    
    <div class="sizes">
        <div class="size-box">72x72px</div>
        <div class="size-box">96x96px</div>
        <div class="size-box">128x128px</div>
        <div class="size-box">144x144px</div>
        <div class="size-box">152x152px</div>
        <div class="size-box">192x192px</div>
        <div class="size-box">384x384px</div>
        <div class="size-box">512x512px</div>
    </div>
    
    <p><strong>Note:</strong> These are placeholder icons. In a production environment, you would create actual PNG files for each size using design software.</p>
</body>
</html>
`;

// Write the HTML file
import { writeFileSync } from 'fs';
writeFileSync('icons/icon-preview.html', iconHTML);

console.info('Icon preview created at icons/icon-preview.html');
console.info('In a real project, you would generate actual PNG files for each size.');