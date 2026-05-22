import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const svgPath = resolve(__dirname, '../public/favicon.svg')
const pngPath = resolve(__dirname, '../buildResources/icon.png')
const icoPath = resolve(__dirname, '../buildResources/icon.ico')

async function generateIcons() {
  const svgBuffer = readFileSync(svgPath)

  const pngBuffer = await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toBuffer()

  writeFileSync(pngPath, pngBuffer)
  console.log('✓ PNG icon generated: buildResources/icon.png (512x512)')

  const sizes = [16, 32, 48, 64, 128, 256]
  const icoBuffers = []

  for (const size of sizes) {
    const resized = await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toBuffer()
    icoBuffers.push({ size, buffer: resized })
  }

  const icoHeader = Buffer.alloc(6)
  icoHeader.writeUInt16LE(0, 0) // reserved
  icoHeader.writeUInt16LE(1, 2) // ICO type
  icoHeader.writeUInt16LE(sizes.length, 4) // number of images

  const icoFileParts = [icoHeader]
  let offset = 6 + sizes.length * 16

  for (const { size, buffer } of icoBuffers) {
    const dirEntry = Buffer.alloc(16)
    dirEntry.writeUInt8(size === 256 ? 0 : size, 0) // width
    dirEntry.writeUInt8(size === 256 ? 0 : size, 1) // height
    dirEntry.writeUInt8(0, 2) // colors
    dirEntry.writeUInt8(0, 3) // reserved
    dirEntry.writeUInt16LE(1, 4) // planes
    dirEntry.writeUInt16LE(32, 6) // bpp
    dirEntry.writeUInt32LE(buffer.length, 8) // size
    dirEntry.writeUInt32LE(offset, 12) // offset
    icoFileParts.push(dirEntry)
    offset += buffer.length
  }

  for (const { buffer } of icoBuffers) {
    icoFileParts.push(buffer)
  }

  writeFileSync(icoPath, Buffer.concat(icoFileParts))
  console.log('✓ ICO icon generated: buildResources/icon.ico (16x16 to 256x256)')
}

generateIcons().catch(console.error)
