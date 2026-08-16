const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PUBLIC_DIR = path.resolve(__dirname, 'public');
const SCRATCH_DIR = path.resolve(__dirname, 'scratch_render');
const AI_IMAGE_PATH = "C:\\Users\\Heni\\.gemini\\antigravity-ide\\brain\\ff48e7e8-dd18-4ff2-986a-c83f03619202\\kids_pwa_icon_1786907878334.jpg";

if (!fs.existsSync(SCRATCH_DIR)) {
  fs.mkdirSync(SCRATCH_DIR, { recursive: true });
}

fs.copyFileSync(AI_IMAGE_PATH, path.join(SCRATCH_DIR, 'source.jpg'));

const targets = [
  { name: 'pwa-512x512.png', width: 512, height: 512 },
  { name: 'pwa-192x192.png', width: 192, height: 192 },
  { name: 'apple-touch-icon.png', width: 180, height: 180 },
  { name: 'favicon.png', width: 64, height: 64 },
  { name: 'favicon-32x32.png', width: 32, height: 32 }
];

for (const target of targets) {
  // Create an HTML file tailored specifically to this resolution
  const renderHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; }
    html, body { width: ${target.width}px; height: ${target.height}px; overflow: hidden; background: #047857; }
    canvas { width: ${target.width}px; height: ${target.height}px; display: block; image-rendering: -webkit-optimize-contrast; }
  </style>
</head>
<body>
  <canvas id="c" width="${target.width}" height="${target.height}"></canvas>
  <script>
    const img = new Image();
    img.onload = () => {
      const c = document.getElementById('c');
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 1. Draw rich emerald radial background
      const grad = ctx.createRadialGradient(${target.width / 2}, ${target.height * 0.35}, ${target.width * 0.05}, ${target.width / 2}, ${target.height / 2}, ${target.width * 0.65});
      grad.addColorStop(0, '#10b981');
      grad.addColorStop(0.3, '#059669');
      grad.addColorStop(0.7, '#047857');
      grad.addColorStop(1, '#064e3b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, ${target.width}, ${target.height});

      // 2. Crop inner icon (sx=198, sy=198, w=628, h=628) and scale to target dimensions
      const sx = 198, sy = 198, sWidth = 628, sHeight = 628;
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, ${target.width}, ${target.height});
    };
    img.src = 'source.jpg';
  </script>
</body>
</html>`;

  const renderFile = path.join(SCRATCH_DIR, `render_${target.width}x${target.height}.html`);
  fs.writeFileSync(renderFile, renderHtml);

  const outputPath = path.join(PUBLIC_DIR, target.name);
  const fileUrl = 'file:///' + renderFile.replace(/\\/g, '/');
  const cmd = `"${CHROME_PATH}" --headless --disable-gpu --force-device-scale-factor=1 --window-size=${target.width},${target.height} --screenshot="${outputPath}" "${fileUrl}"`;
  console.log(`Generating ${target.name} (${target.width}x${target.height})...`);
  execSync(cmd, { stdio: 'inherit' });
}

// 2. High-performance matching SVG favicon for browser tabs
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="tabBg" cx="50%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="35%" stop-color="#059669"/>
      <stop offset="70%" stop-color="#047857"/>
      <stop offset="100%" stop-color="#064e3b"/>
    </radialGradient>
    <linearGradient id="goldLight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#fef08a"/>
      <stop offset="70%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <filter id="svgGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#022c22" flood-opacity="0.6"/>
      <feDropShadow dx="0" dy="1" stdDeviation="3" flood-color="#fde047" flood-opacity="0.4"/>
    </filter>
  </defs>
  
  <rect width="512" height="512" rx="128" fill="url(#tabBg)"/>
  
  <!-- Glowing Cross & Sparkle -->
  <g filter="url(#svgGlow)">
    <g transform="translate(256, 120)">
      <rect x="-8" y="-45" width="16" height="60" rx="6" fill="url(#goldLight)" stroke="#ffffff" stroke-width="2"/>
      <rect x="-26" y="-32" width="52" height="16" rx="6" fill="url(#goldLight)" stroke="#ffffff" stroke-width="2"/>
      <!-- Star Sparkle -->
      <path d="M 28 -40 Q 28 -26 42 -26 Q 28 -26 28 -12 Q 28 -26 14 -26 Q 28 -26 28 -40 Z" fill="#ffffff"/>
    </g>

    <!-- Joyful Child with Raised Arms -->
    <g transform="translate(256, 320)">
      <!-- Raised Arms -->
      <path d="M -40 -20 C -75 -50, -115 -85, -132 -102 C -140 -110, -150 -100, -142 -90 C -122 -70, -88 -30, -56 12 Z" 
            fill="url(#goldLight)" stroke="#ffffff" stroke-width="3"/>
      <circle cx="-132" cy="-102" r="14" fill="#fef08a" stroke="#ffffff" stroke-width="2"/>

      <path d="M 40 -20 C 75 -50, 115 -85, 132 -102 C 140 -110, 150 -100, 142 -90 C 122 -70, 88 -30, 56 12 Z" 
            fill="url(#goldLight)" stroke="#ffffff" stroke-width="3"/>
      <circle cx="132" cy="-102" r="14" fill="#fef08a" stroke="#ffffff" stroke-width="2"/>

      <!-- Torso -->
      <path d="M -56 24 C -30 16, 30 16, 56 24 L 72 110 C 24 122, -24 122, -72 110 Z" 
            fill="url(#goldLight)" stroke="#ffffff" stroke-width="3.5"/>
      <path d="M -28 26 C -14 44, 14 44, 28 26" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>

      <!-- Head & Smile -->
      <circle cx="0" cy="-56" r="56" fill="#fffbeb" stroke="#ffffff" stroke-width="3.5"/>
      <path d="M -56 -56 C -56 -100, -28 -116, 0 -116 C 28 -116, 56 -100, 56 -56 C 48 -74, 34 -88, 0 -88 C -34 -88, -48 -74, -56 -56 Z" 
            fill="#d97706" stroke="#ffffff" stroke-width="2.5"/>
      
      <!-- Smiling Eyes -->
      <path d="M -28 -54 C -24 -68, -12 -68, -8 -54" fill="none" stroke="#064e3b" stroke-width="6" stroke-linecap="round"/>
      <path d="M 8 -54 C 12 -68, 24 -68, 28 -54" fill="none" stroke="#064e3b" stroke-width="6" stroke-linecap="round"/>

      <!-- Joyful Open Smile -->
      <path d="M -24 -38 C -24 -10, 24 -10, 24 -38 Z" fill="#064e3b"/>
      <path d="M -20 -37 C -20 -28, 20 -28, 20 -37 Z" fill="#ffffff"/>
      <path d="M -12 -26 C -12 -12, 12 -12, 12 -26 Z" fill="#fb7185"/>
    </g>
  </g>
</svg>`;

fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.svg'), faviconSvg);
fs.writeFileSync(path.join(PUBLIC_DIR, 'mask-icon.svg'), faviconSvg);

console.log('✅ All PWA Icons Generated and Synchronized Successfully!');
