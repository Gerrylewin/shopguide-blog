import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const h = fs.readFileSync(path.join(root, '.footer-dump.html'), 'utf8')
const marker = '<span class="visually-hidden">Payment methods</span>'
const start = h.indexOf(marker)
if (start < 0) throw new Error('marker not found')
const end = h.indexOf('</ul>', start) + 5
const block = h.slice(start, end)
const out = path.join(root, 'components', 'footer-payment-inner.html')
fs.writeFileSync(out, block)
console.log('wrote', out, block.length)
