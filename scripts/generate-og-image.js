/**
 * Script pour générer l'image Open Graph par défaut (og-image.png)
 * 
 * Usage: node scripts/generate-og-image.js
 * 
 * Nécessite: npm install canvas (ou sharp)
 * 
 * Alternative: Créez manuellement une image 1200x630px avec un design TruthMiner
 * et placez-la dans public/og-image.png
 */

const fs = require('fs');
const path = require('path');

// Vérifier si canvas est disponible
let canvas;
try {
  canvas = require('canvas');
} catch (e) {
  console.log('⚠️  Le module "canvas" n\'est pas installé.');
  console.log('📝 Instructions pour créer l\'image manuellement:');
  console.log('   1. Créez une image de 1200x630 pixels');
  console.log('   2. Ajoutez le texte "TruthMiner" et un design simple');
  console.log('   3. Sauvegardez-la dans public/og-image.png');
  console.log('');
  console.log('💡 Ou installez canvas: npm install canvas');
  process.exit(0);
}

const width = 1200;
const height = 630;

// Créer le canvas
const canvasInstance = canvas.createCanvas(width, height);
const ctx = canvasInstance.getContext('2d');

// Fond sombre (style magazine d'investigation)
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#0a0a0a');
gradient.addColorStop(0.5, '#1a1a1a');
gradient.addColorStop(1, '#0a0a0a');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// Grille subtile
ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
ctx.lineWidth = 1;
for (let x = 0; x < width; x += 40) {
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, height);
  ctx.stroke();
}
for (let y = 0; y < height; y += 40) {
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();
}

// Badge TruthMiner
ctx.fillStyle = '#2563eb';
ctx.fillRect(60, 60, 200, 60);
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 24px system-ui';
ctx.textAlign = 'left';
ctx.textBaseline = 'middle';
ctx.fillText('TruthMiner', 80, 90);

// Texte principal
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 72px system-ui';
ctx.textAlign = 'left';
ctx.textBaseline = 'top';
ctx.fillText('AI-Powered Truth Mining', 60, 200);

// Sous-titre
ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
ctx.font = '32px system-ui';
ctx.fillText('L\'avis des vrais utilisateurs Reddit', 60, 300);

// Ligne décorative
ctx.fillStyle = '#2563eb';
ctx.fillRect(60, 400, 80, 4);

// Footer
ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
ctx.font = '20px system-ui';
ctx.textAlign = 'right';
ctx.fillText('tminer.io', width - 60, height - 40);

// Sauvegarder l'image
const outputPath = path.join(__dirname, '..', 'public', 'og-image.png');
const buffer = canvasInstance.toBuffer('image/png');
fs.writeFileSync(outputPath, buffer);

console.log('✅ Image Open Graph créée avec succès: public/og-image.png');
console.log(`   Dimensions: ${width}x${height}px`);

