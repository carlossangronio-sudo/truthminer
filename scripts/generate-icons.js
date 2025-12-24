/**
 * Script pour générer les icônes manquantes (favicon.ico, apple-touch-icon.png)
 * 
 * Usage: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

let canvas;
try {
  canvas = require('canvas');
} catch (e) {
  console.log('⚠️  Le module "canvas" n\'est pas installé.');
  console.log('💡 Installez-le avec: npm install canvas');
  process.exit(1);
}

// Fonction pour créer une icône avec le logo TruthMiner
function createIcon(size, outputPath) {
  const canvasInstance = canvas.createCanvas(size, size);
  const ctx = canvasInstance.getContext('2d');

  // Fond bleu TruthMiner
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, '#2563eb');
  gradient.addColorStop(1, '#1e40af');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Dessiner le logo (cristal + loupe)
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = Math.max(2, size / 16);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const centerX = size / 2;
  const centerY = size / 2;
  const scale = size / 32;

  // Cristal / diamant principal
  ctx.beginPath();
  ctx.moveTo(centerX, 3 * scale);
  ctx.lineTo(centerX + 10.5 * scale, centerY);
  ctx.lineTo(centerX, size - 3 * scale);
  ctx.lineTo(centerX - 10.5 * scale, centerY);
  ctx.closePath();
  ctx.stroke();

  // Facette intérieure
  ctx.beginPath();
  ctx.moveTo(centerX, 7 * scale);
  ctx.lineTo(centerX + 6.5 * scale, centerY);
  ctx.lineTo(centerX, size - 7 * scale);
  ctx.lineTo(centerX - 6.5 * scale, centerY);
  ctx.closePath();
  ctx.stroke();

  // Loupe (cercle)
  const loupeX = centerX + 3 * scale;
  const loupeY = centerY + 3 * scale;
  const loupeRadius = 4.2 * scale;
  ctx.beginPath();
  ctx.arc(loupeX, loupeY, loupeRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Manche de la loupe
  ctx.beginPath();
  ctx.moveTo(loupeX + loupeRadius * 0.66, loupeY + loupeRadius * 0.66);
  ctx.lineTo(loupeX + loupeRadius * 1.5, loupeY + loupeRadius * 1.5);
  ctx.stroke();

  // Sauvegarder
  const buffer = canvasInstance.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Créé: ${outputPath} (${size}x${size}px)`);
}

// Fonction pour créer favicon.ico (format ICO simple)
function createFavicon(size, outputPath) {
  // Pour simplifier, on crée un PNG et on le renomme en .ico
  // Les navigateurs modernes acceptent les PNG comme favicon
  const canvasInstance = canvas.createCanvas(size, size);
  const ctx = canvasInstance.getContext('2d');

  // Fond bleu TruthMiner
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, '#2563eb');
  gradient.addColorStop(1, '#1e40af');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Dessiner le logo simplifié (plus simple pour une petite icône)
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = Math.max(1.5, size / 20);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const centerX = size / 2;
  const centerY = size / 2;
  const scale = size / 32;

  // Cristal principal
  ctx.beginPath();
  ctx.moveTo(centerX, 3 * scale);
  ctx.lineTo(centerX + 10.5 * scale, centerY);
  ctx.lineTo(centerX, size - 3 * scale);
  ctx.lineTo(centerX - 10.5 * scale, centerY);
  ctx.closePath();
  ctx.stroke();

  // Loupe simplifiée
  const loupeX = centerX + 3 * scale;
  const loupeY = centerY + 3 * scale;
  const loupeRadius = 4.2 * scale;
  ctx.beginPath();
  ctx.arc(loupeX, loupeY, loupeRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Sauvegarder comme PNG (les navigateurs modernes l'acceptent comme favicon)
  const buffer = canvasInstance.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Créé: ${outputPath} (${size}x${size}px)`);
}

// Créer les icônes
const publicDir = path.join(__dirname, '..', 'public');

console.log('🎨 Génération des icônes TruthMiner...\n');

// Favicon (32x32)
createFavicon(32, path.join(publicDir, 'favicon.ico'));

// Apple Touch Icon (180x180)
createIcon(180, path.join(publicDir, 'apple-touch-icon.png'));

// Apple Touch Icon Precomposed (même chose)
createIcon(180, path.join(publicDir, 'apple-touch-icon-precomposed.png'));

console.log('\n✨ Toutes les icônes ont été créées avec succès !');

