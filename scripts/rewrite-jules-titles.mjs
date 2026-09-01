const fs = require('fs')
const path = require('path')

const ROOT = path.join(process.cwd(), 'data/blog')

const NEW = {
  '3d-printing-nozzle-filament-high-sku-shopify-online-shopping-guides.mdx':
    'How 3D Printing Stores Guide Buyers Through Nozzle and Filament Compatibility',
  'agricultural-machinery-high-sku-shopify-online-shopping-guides.mdx':
    'Finding the Right Hydraulic and PTO Parts on a Large Farm Equipment Catalog',
  'botanical-maze-high-sku-tea-herbal-online-shopping-guides.mdx':
    'Guided Shopping for Tea and Herbal Stores with Overlapping Botanical Catalogs',
  'bulk-pantry-trap-high-sku-natural-food-shopify-online-shopping-guides.mdx':
    'Why Bulk Natural Food Catalogs Lose Shoppers in the Pantry Aisle',
  'commercial-refrigeration-hvac-high-sku-shopify-agentic-shopping.mdx':
    'How HVAC Technicians Find Compressors and Refrigerant-Compatible Parts Online',
  'dimension-dilemma-high-sku-home-organization-guided-shopping.mdx':
    'When Home Organization Shoppers Need Measurements, Not Another Filter Grid',
  'electronic-components-high-sku-shopify-online-shopping-guides.mdx':
    'Guided Shopping for Electronic Components When Voltage and Pinouts Matter',
  'fastener-thread-pitch-high-sku-shopify-guided-shopping.mdx':
    'How Fastener Stores Stop Losing Sales to Thread Pitch Confusion',
  'flavor-profile-bottleneck-high-sku-beverage-shopping-guide-website.mdx':
    'Helping Specialty Beverage Shoppers Pick by Taste Instead of SKU Codes',
  'gardening-seed-high-sku-shopify-agentic-shopping.mdx':
    'Guided Shopping for Seed and Garden Catalogs When Zone and Season Matter',
  'hydraulics-pneumatics-high-sku-shopify-guided-shopping.mdx':
    'How Hydraulics and Pneumatics Buyers Get Past PSI and Thread Dead Ends',
  'industrial-automation-plc-high-sku-shopify-shopping-guide-website.mdx':
    'Guided Shopping for PLC and I/O Catalogs on Large Industrial Shopify Stores',
  'industrial-mro-high-sku-shopify-shopping-guide-website.mdx':
    'Why MRO Buyers Bounce When Compatible Replacements Stay Buried',
  'industrial-safety-ppe-high-sku-shopify-guided-shopping.mdx':
    'How PPE and Safety Catalogs Help Buyers Match Compliance Specs Faster',
  'lab-scientific-equipment-high-sku-shopify-guided-shopping.mdx':
    'Guided Shopping for Lab Equipment When Reagent and Thread Specs Block Search',
  'marine-boating-high-sku-shopify-shopping-guide-website.mdx':
    'Finding Propeller Pitch and Fitment on Large Marine Parts Catalogs',
  'medical-supplies-high-sku-shopify-shopping-guide-website.mdx':
    'Guided Shopping for Medical and Wellness Supplies with Tight Spec Requirements',
  'music-gear-instrument-high-sku-shopify-shopping-guide-website.mdx':
    'How Music Gear Stores Guide Buyers Through Tone and Compatibility Choices',
  'plumbing-hvac-high-sku-shopify-shopping-guide-website.mdx':
    'Why Plumbing and HVAC Catalogs Need Fitment Help, Not More Dropdowns',
  'power-transmission-bearings-high-sku-shopify-ai-product-recommendations.mdx':
    'Helping Power Transmission Buyers Match Shaft Bore and Load Ratings',
  'powersports-oem-fitment-high-sku-shopify-shopping-guide-website.mdx':
    'How Powersports Stores Solve OEM Fitment Without a Spreadsheet Maze',
  'precision-tooling-cnc-high-sku-shopify-guided-shopping.mdx':
    'Guided Shopping for CNC Tooling When Arbor and Flute Specs Have to Match',
  'restaurant-commercial-kitchen-high-sku-shopify-shopping-guide-website.mdx':
    'How Commercial Kitchen Stores Guide Buyers Through Utility Fitment',
  'scent-profile-maze-high-sku-fragrance-shopping-guide-website.mdx':
    'Guided Shopping for Perfume Catalogs When Notes Matter More Than Brand Names',
  'socket-spec-crisis-high-sku-lighting-online-shopping-guides.mdx':
    'Why Lighting Shoppers Bounce When Socket Specs Do Not Match the Search Bar',
  'solar-off-grid-high-sku-shopify-online-shopping-guides.mdx':
    'Guided Shopping for Solar and Off-Grid Kits Across Voltage and Inverter Specs',
  'tabletop-board-game-high-sku-shopify-online-shopping-guides.mdx':
    'Helping Tabletop Shoppers Find Expansions Without Getting Lost in the Catalog',
  'tactical-gear-high-sku-shopify-online-shopping-guides.mdx':
    'Guided Shopping for Tactical Gear When Pouch and MOLLE Compatibility Matters',
  'taste-profile-dilemma-high-sku-coffee-shopify-agentic-shopping.mdx':
    'How Coffee Stores Guide Buyers by Taste Profile Instead of Roast Codes',
  'the-bundle-builder-breakdown-high-sku-shopify-active-shop-guide.mdx':
    'Why Rigid Bundle Apps Fall Apart on High-SKU Shopify Stores',
  'the-cold-start-solution-high-sku-shopify-new-product-discovery.mdx':
    'How New Arrivals Get Found on Large Shopify Catalogs Without Review History',
  'the-discovery-deficit-high-sku-shopify-active-shop-guide.mdx':
    'The Discovery Deficit: Most of a Large Catalog Never Gets Seen',
  'the-filter-wall-crisis-high-sku-shopify-active-shop-guide.mdx':
    'Why Filter Walls Stop Working Once a Shopify Catalog Gets Big',
  'the-safety-spec-wall-high-sku-baby-kids-shopify-active-shop-guide.mdx':
    'Guided Shopping for Baby and Kids Products When Safety Specs Block Checkout',
  'the-vibe-search-revolution-high-sku-apparel-agentic-shopping.mdx':
    'How Apparel Shoppers Search by Vibe When Filters Cannot Hear Them',
  'woodworking-cabinetry-hardware-high-sku-shopify-online-shopping-guides.mdx':
    'Finding Bore Distance and Overlay on Huge Cabinetry Hardware Catalogs',
  'zero-click-answer-engine-high-sku-shopify.mdx':
    'How Large Shopify Catalogs Show Up When Shoppers Never Click Through',
}

const titleBlock = /^title:\s*(?:>-\s*\n(?:[ \t]+.+\n)+|'[^']*'|"[^"]*"|.+\n)/m

let changed = 0
for (const [file, title] of Object.entries(NEW)) {
  const p = path.join(ROOT, file)
  if (!fs.existsSync(p)) {
    console.error('missing', file)
    process.exitCode = 1
    continue
  }
  let raw = fs.readFileSync(p, 'utf8')
  const quoted = title.includes("'") ? `"${title}"` : `'${title}'`
  if (!titleBlock.test(raw)) {
    console.error('no title match', file)
    process.exitCode = 1
    continue
  }
  raw = raw.replace(titleBlock, `title: ${quoted}\n`)
  raw = raw.replace(/^lastmod:\s*.+$/m, "lastmod: '2026-09-01'")
  fs.writeFileSync(p, raw)
  changed += 1
  console.log('updated', file)
}
console.log('changed', changed)
