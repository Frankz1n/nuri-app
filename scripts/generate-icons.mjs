// Gera os ícones PNG do Nuri sem dependências: fundo creme + "한" em verde-escuro.
// Uso: npm run icons
import { mkdirSync, writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUTPUT_DIRECTORY = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')

const CREAM = [251, 246, 234]
const DARK_GREEN = [31, 77, 58]
const SUPERSAMPLING = 3
const STROKE_WIDTH = 0.058

// Geometria do glifo em um quadrado unitário (0-1): ㅎ (topo-esquerda), ㅏ (topo-direita), ㄴ (base).
const SEGMENTS = [
  [0.3, 0.17, 0.46, 0.17],
  [0.2, 0.27, 0.54, 0.27],
  [0.65, 0.16, 0.65, 0.5],
  [0.65, 0.33, 0.79, 0.33],
  [0.28, 0.6, 0.28, 0.8],
  [0.28, 0.8, 0.72, 0.8],
]
const RINGS = [{ centerX: 0.37, centerY: 0.395, radius: 0.075 }]

const distanceToSegment = (px, py, [x1, y1, x2, y2]) => {
  const dx = x2 - x1
  const dy = y2 - y1
  const lengthSquared = dx * dx + dy * dy
  const ratio = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared))
  return Math.hypot(px - (x1 + ratio * dx), py - (y1 + ratio * dy))
}

const isInsideGlyph = (x, y) => {
  const halfWidth = STROKE_WIDTH / 2
  const isOnSegment = SEGMENTS.some((segment) => distanceToSegment(x, y, segment) <= halfWidth)
  if (isOnSegment) return true
  return RINGS.some(({ centerX, centerY, radius }) => Math.abs(Math.hypot(x - centerX, y - centerY) - radius) <= halfWidth)
}

/** `glyphScale` < 1 deixa o glifo dentro da zona segura de ícones maskable. */
const renderPixels = (size, glyphScale) => {
  const pixels = Buffer.alloc(size * size * 3)
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      let coverage = 0
      for (let subY = 0; subY < SUPERSAMPLING; subY += 1) {
        for (let subX = 0; subX < SUPERSAMPLING; subX += 1) {
          const unitX = (column + (subX + 0.5) / SUPERSAMPLING) / size
          const unitY = (row + (subY + 0.5) / SUPERSAMPLING) / size
          const glyphX = (unitX - 0.5) / glyphScale + 0.5
          const glyphY = (unitY - 0.5) / glyphScale + 0.5
          if (isInsideGlyph(glyphX, glyphY)) coverage += 1
        }
      }
      const ratio = coverage / (SUPERSAMPLING * SUPERSAMPLING)
      const offset = (row * size + column) * 3
      for (let channel = 0; channel < 3; channel += 1) {
        pixels[offset + channel] = Math.round(CREAM[channel] + (DARK_GREEN[channel] - CREAM[channel]) * ratio)
      }
    }
  }
  return pixels
}

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
  return value >>> 0
})

const crc32 = (buffer) => {
  let crc = 0xffffffff
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

const createChunk = (type, data) => {
  const typeBuffer = Buffer.from(type, 'ascii')
  const lengthBuffer = Buffer.alloc(4)
  lengthBuffer.writeUInt32BE(data.length)
  const crcBuffer = Buffer.alloc(4)
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])))
  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer])
}

const encodePng = (size, rgbPixels) => {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header[8] = 8 // profundidade de bits
  header[9] = 2 // RGB
  const stride = size * 3
  const scanlines = Buffer.alloc((stride + 1) * size)
  for (let row = 0; row < size; row += 1) {
    scanlines[row * (stride + 1)] = 0 // filtro "None"
    rgbPixels.copy(scanlines, row * (stride + 1) + 1, row * stride, (row + 1) * stride)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    createChunk('IHDR', header),
    createChunk('IDAT', deflateSync(scanlines, { level: 9 })),
    createChunk('IEND', Buffer.alloc(0)),
  ])
}

const ICONS = [
  { fileName: 'icon-192.png', size: 192, glyphScale: 1 },
  { fileName: 'icon-512.png', size: 512, glyphScale: 1 },
  { fileName: 'icon-maskable-512.png', size: 512, glyphScale: 0.68 },
  { fileName: 'apple-touch-icon.png', size: 180, glyphScale: 0.86 },
]

mkdirSync(OUTPUT_DIRECTORY, { recursive: true })
for (const { fileName, size, glyphScale } of ICONS) {
  writeFileSync(join(OUTPUT_DIRECTORY, fileName), encodePng(size, renderPixels(size, glyphScale)))
  console.log(`Ícone gerado: public/icons/${fileName} (${size}x${size})`)
}
