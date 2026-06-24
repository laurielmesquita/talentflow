const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const brandDir = path.join(__dirname, '../public/brand');

async function optimizeImages() {
  console.log('Iniciando otimização de imagens...');

  const logoDarkSrc = path.join(brandDir, 'logo-dark.png');
  const logoLightSrc = path.join(brandDir, 'logo-light.png');
  const ogImageSrc = path.join(brandDir, 'og-image.png');

  // Criar backups se os originais em alta resolução forem necessários no futuro
  const backupDir = path.join(brandDir, '.backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Backup das originais de alta se ainda não existirem backups
  if (fs.existsSync(logoDarkSrc) && !fs.existsSync(path.join(backupDir, 'logo-dark.png'))) {
    fs.copyFileSync(logoDarkSrc, path.join(backupDir, 'logo-dark.png'));
    console.log('Backup criado para logo-dark.png');
  }
  if (fs.existsSync(logoLightSrc) && !fs.existsSync(path.join(backupDir, 'logo-light.png'))) {
    fs.copyFileSync(logoLightSrc, path.join(backupDir, 'logo-light.png'));
    console.log('Backup criado para logo-light.png');
  }
  if (fs.existsSync(ogImageSrc) && !fs.existsSync(path.join(backupDir, 'og-image.png'))) {
    fs.copyFileSync(ogImageSrc, path.join(backupDir, 'og-image.png'));
    console.log('Backup criado para og-image.png');
  }

  const logoDarkBackup = path.join(backupDir, 'logo-dark.png');
  const logoLightBackup = path.join(backupDir, 'logo-light.png');
  const ogImageBackup = path.join(backupDir, 'og-image.png');

  // 1. Processar Logo Dark (Usado em Light Mode)
  console.log('Processando logo-dark...');
  await sharp(logoDarkBackup)
    .resize(256, 256, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 90 })
    .toFile(path.join(brandDir, 'logo-dark.webp'));
  console.log('Gerado logo-dark.webp');

  await sharp(logoDarkBackup)
    .resize(256, 256, { fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, quality: 85 })
    .toFile(logoDarkSrc + '.tmp');
  fs.renameSync(logoDarkSrc + '.tmp', logoDarkSrc);
  console.log('Substituído logo-dark.png por versão otimizada de 256x256');

  // 2. Processar Logo Light (Usado em Dark Mode)
  console.log('Processando logo-light...');
  await sharp(logoLightBackup)
    .resize(256, 256, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 90 })
    .toFile(path.join(brandDir, 'logo-light.webp'));
  console.log('Gerado logo-light.webp');

  await sharp(logoLightBackup)
    .resize(256, 256, { fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, quality: 85 })
    .toFile(logoLightSrc + '.tmp');
  fs.renameSync(logoLightSrc + '.tmp', logoLightSrc);
  console.log('Substituído logo-light.png por versão otimizada de 256x256');

  // 3. Processar OG Image (Manter 1200x630, mas aplicar quantização de paleta e compressão extrema)
  console.log('Processando og-image...');
  await sharp(ogImageBackup)
    .png({ compressionLevel: 9, quality: 80, palette: true })
    .toFile(ogImageSrc + '.tmp');
  fs.renameSync(ogImageSrc + '.tmp', ogImageSrc);
  console.log('Substituído og-image.png por versão otimizada');

  // Mostrar tamanhos finais
  const files = ['logo-dark.webp', 'logo-dark.png', 'logo-light.webp', 'logo-light.png', 'og-image.png'];
  console.log('\nTamanhos Finais:');
  files.forEach(file => {
    const fPath = path.join(brandDir, file);
    if (fs.existsSync(fPath)) {
      const stats = fs.statSync(fPath);
      console.log(`- ${file}: ${(stats.size / 1024).toFixed(2)} KB`);
    } else {
      console.log(`- ${file}: NÃO ENCONTRADO`);
    }
  });
}

optimizeImages().catch(err => {
  console.error('Erro na otimização de imagens:', err);
  process.exit(1);
});
