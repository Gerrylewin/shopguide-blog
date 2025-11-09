import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

const sourceLogo = join(rootDir, 'public', 'static', 'images', 'shopguide-logo.png')
const faviconsDir = join(rootDir, 'public', 'static', 'favicons')

// Favicon sizes to generate
const faviconSizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-96x96.png', size: 96 },
  { name: 'mstile-150x150.png', size: 150 },
]

async function generateFavicons() {
  try {
    console.log('Generating favicons from shopguide logo...')

    // Read the source logo
    const imageBuffer = readFileSync(sourceLogo)

    // Generate each favicon size
    for (const { name, size } of faviconSizes) {
      const outputPath = join(faviconsDir, name)
      await sharp(imageBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }, // White background for non-transparent
        })
        .png()
        .toFile(outputPath)
      console.log(`âœ“ Generated ${name} (${size}x${size})`)
    }

    // Generate favicon.ico (16x16 and 32x32 combined)
    const favicon16 = await sharp(imageBuffer)
      .resize(16, 16, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toBuffer()

    const favicon32 = await sharp(imageBuffer)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toBuffer()

    // For .ico, we'll just use the 32x32 PNG as favicon.ico
    // (Most modern browsers support PNG in .ico files)
    writeFileSync(join(faviconsDir, 'favicon.ico'), favicon32)
    console.log('âœ“ Generated favicon.ico')

    console.log('âœ… All favicons generated successfully!')
  } catch (error) {
    console.error('âŒ Error generating favicons:', error)
    process.exit(1)
  }
}

generateFavicons()
