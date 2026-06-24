const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const brandDir = path.join(__dirname, '../public/brand');
const backupDir = path.join(brandDir, '.backups');

async function generateOgImage() {
  console.log('Iniciando geração da nova imagem OpenGraph...');

  const logoLightBackup = path.join(backupDir, 'logo-light.png');
  const ogImageDest = path.join(brandDir, 'og-image.png');

  if (!fs.existsSync(logoLightBackup)) {
    console.error('Erro: Arquivo logo-light.png original de backup não encontrado!');
    process.exit(1);
  }

  // 1. Criar o SVG de fundo com o gradiente radial "glow" premium
  const svgBackground = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.18" />
          <stop offset="50%" stop-color="#8b5cf6" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#09090b" stop-opacity="1" />
        </radialGradient>
      </defs>
      <!-- Fundo Sólido Zinc-950 -->
      <rect width="1200" height="630" fill="#09090b" />
      <!-- Glow centralizado -->
      <rect width="1200" height="630" fill="url(#glow)" />
    </svg>
  `;

  // 2. Redimensionar o logo de alta resolução para 380x380 (perfeito para a área de corte 1:1)
  console.log('Redimensionando o logo para o overlay...');
  const logoResized = await sharp(logoLightBackup)
    .resize(380, 380, { fit: 'inside' })
    .toBuffer();

  // 3. Compor o logo no centro do fundo SVG
  console.log('Compondo imagens e gerando og-image.png...');
  await sharp(Buffer.from(svgBackground))
    .composite([
      {
        input: logoResized,
        top: Math.round((630 - 380) / 2),   // Centralizado verticalmente (125px)
        left: Math.round((1200 - 380) / 2)  // Centralizado horizontalmente (410px)
      }
    ])
    .png({ compressionLevel: 9, quality: 80, palette: true }) // compressão forte com quantização
    .toFile(ogImageDest + '.tmp');

  fs.renameSync(ogImageDest + '.tmp', ogImageDest);

  const stats = fs.statSync(ogImageDest);
  console.log(`\n✓ Nova og-image.png gerada com sucesso!`);
  console.log(`Tamanho final: ${(stats.size / 1024).toFixed(2)} KB`);
}

generateOgImage().catch(err => {
  console.error('Erro na geração da imagem OpenGraph:', err);
  process.exit(1);
});
