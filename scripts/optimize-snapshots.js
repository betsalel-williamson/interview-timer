#!/usr/bin/env node

import sharp from 'sharp';
import { glob } from 'node:fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { stat } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

async function optimizeSnapshots() {
  console.log('🖼️ Optimizing PNG snapshots...');

  try {
    // Find all PNG files in test snapshots directories using native Node.js glob
    const pngFilesIterator = glob('tests/e2e/**/*.png', {
      cwd: projectRoot,
      absolute: true,
    });
    const pngFiles = await Array.fromAsync(pngFilesIterator);

    if (pngFiles.length === 0) {
      console.log('ℹ️ No PNG snapshots found to optimize.');
      return;
    }

    console.log(`📁 Found ${pngFiles.length} PNG files to optimize...`);

    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;

    for (const filePath of pngFiles) {
      try {
        const originalSize = (await stat(filePath)).size;
        totalOriginalSize += originalSize;

        console.log(`🔧 Optimizing: ${filePath.replace(projectRoot, '')}`);

        // Use sharp to optimize PNG with maximum compression
        const optimizedBuffer = await sharp(filePath)
          .png({
            compressionLevel: 9, // Maximum compression
            adaptiveFiltering: true,
            palette: true,
            quality: 100,
          })
          .toBuffer();

        const optimizedSize = optimizedBuffer.length;
        totalOptimizedSize += optimizedSize;

        // Write optimized image back to file
        await import('fs').then((fs) =>
          fs.promises.writeFile(filePath, optimizedBuffer)
        );

        const savings = originalSize - optimizedSize;
        const savingsPercent = ((savings / originalSize) * 100).toFixed(1);

        console.log(
          `✅ Optimized: ${(originalSize / 1024).toFixed(1)}KB → ${(optimizedSize / 1024).toFixed(1)}KB (${savingsPercent}% saved)`
        );
      } catch (error) {
        console.error(`❌ Failed to optimize ${filePath}:`, error.message);
        throw error;
      }
    }

    const totalSavings = totalOriginalSize - totalOptimizedSize;
    const totalSavingsPercent = (
      (totalSavings / totalOriginalSize) *
      100
    ).toFixed(1);

    console.log(`\n📊 Optimization Summary:`);
    console.log(`   Original size: ${(totalOriginalSize / 1024).toFixed(1)}KB`);
    console.log(
      `   Optimized size: ${(totalOptimizedSize / 1024).toFixed(1)}KB`
    );
    console.log(
      `   Total savings: ${(totalSavings / 1024).toFixed(1)}KB (${totalSavingsPercent}%)`
    );
  } catch (error) {
    console.error('❌ Optimization failed:', error.message);
    process.exit(1);
  }
}

// Run optimization
optimizeSnapshots().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
