const fs = require('fs')
const path = require('path')

const ROOT = path.join(process.cwd(), 'data/blog')

const REPLACEMENTS = {
  'https://images.unsplash.com/photo-1500382017468-9049fee747ef?w=1200&q=80':
    'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200&q=80',
  'https://images.unsplash.com/photo-1573496799652-32a26563e414?w=1200&q=80':
    'https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=1200&q=80',
  'https://images.unsplash.com/photo-1556742208-999815fcd71b?w=1200&q=80':
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80',
  'https://images.unsplash.com/photo-1507208773393-40090724dee9?w=1200&q=80':
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&q=80',
  'https://images.unsplash.com/photo-1543083505-590d57a6ab15?w=1200&q=80':
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&q=80',
  'https://images.unsplash.com/photo-1517430816045-df4b7ef11df1?w=1200&q=80':
    'https://images.unsplash.com/photo-1542744173-05336fcc7ad4?w=1200&q=80',
  'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=1200&q=80':
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&q=80',
  'https://images.unsplash.com/photo-1542744094-3a3172720249?w=1200&q=80':
    'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=1200&q=80',
  'https://images.unsplash.com/photo-1551498367-611111a4341b?w=1200&q=80':
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80',
  'https://images.unsplash.com/photo-1534452208741-8f9ed3534a27?w=1200&q=80':
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&q=80',
  'https://images.unsplash.com/photo-1542744100-84786d382218?w=1200&q=80':
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
  'https://images.unsplash.com/photo-1573496359143-34e857ef1d89?w=1200&q=80':
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&q=80',
  'https://images.unsplash.com/photo-1542744094-3a31b272c490?w=1200&q=80':
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
  'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=1200&q=80':
    'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&q=80',
  'https://images.unsplash.com/photo-1542744094-3a3172720188?w=1200&q=80':
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&q=80',
}

let filesChanged = 0
let replacements = 0
for (const file of fs.readdirSync(ROOT).filter((f) => f.endsWith('.mdx'))) {
  const p = path.join(ROOT, file)
  let raw = fs.readFileSync(p, 'utf8')
  let next = raw
  for (const [from, to] of Object.entries(REPLACEMENTS)) {
    if (next.includes(from)) {
      next = next.split(from).join(to)
      replacements += 1
    }
  }
  if (next !== raw) {
    fs.writeFileSync(p, next)
    filesChanged += 1
    console.log('updated', file)
  }
}
console.log('filesChanged', filesChanged, 'replacements', replacements)
if (filesChanged !== 15) process.exit(1)
