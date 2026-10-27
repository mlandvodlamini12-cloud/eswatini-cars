// Test script: simulate the broken localStorage that was causing
// "r.filter is not a function" on the user's device.
//
// We launch the live (or local) page with various poisoned localStorage
// values for `cachedListings`, `savedCars`, `dismissedBroadcasts`,
// `recentlyViewed`, and confirm the page renders without throwing.

const { execSync } = require('child_process')
const fs = require('fs')

const TARGET = process.argv[2] || 'https://eswatini-cars.vercel.app'

const POISON_VALUES = [
  ['null', 'null'],
  ['object', '{"listings":[]}', 'WRONG — should be just the array, not wrapped'],
  ['string', '"hello world"'],
  ['number', '42'],
  ['empty-object', '{}'],
  ['array-of-strings', '["not","a","listing"]'],
  ['broken-json', '{"broken'],
]

console.log(`Testing target: ${TARGET}\n`)

// First load the page so we're on the right origin for localStorage writes
console.log('=== Step 1: Open page (warm up service worker) ===')
execSync('agent-browser close 2>&1', { stdio: 'inherit' })
execSync(`agent-browser open "${TARGET}"`, { stdio: 'inherit' })
execSync('sleep 3', { stdio: 'inherit' })

console.log('\n=== Step 2: Poison localStorage with various bad shapes ===')
for (const [name, value, comment] of POISON_VALUES) {
  console.log(`\n--- cachedListings = ${name} (${value}) ---`)
  if (comment) console.log(`    Comment: ${comment}`)
  execSync(`agent-browser eval "localStorage.setItem('cachedListings', ${JSON.stringify(value)})"`, { stdio: 'inherit' })
  // Also poison the other localStorage-backed keys so we test all paths
  execSync(`agent-browser eval "localStorage.setItem('savedCars', ${JSON.stringify(value)})"`, { stdio: 'inherit' })
  execSync(`agent-browser eval "localStorage.setItem('dismissedBroadcasts', ${JSON.stringify(value)})"`, { stdio: 'inherit' })
  execSync(`agent-browser eval "localStorage.setItem('recentlyViewed', ${JSON.stringify(value)})"`, { stdio: 'inherit' })

  // Reload — if the page errors out, agent-browser will show it
  console.log('    Reloading...')
  execSync('agent-browser reload', { stdio: 'inherit' })
  execSync('sleep 4', { stdio: 'inherit' })

  const title = execSync('agent-browser get title', { encoding: 'utf-8' }).trim()
  const errors = execSync('agent-browser errors', { encoding: 'utf-8' }).trim()
  const consoleOut = execSync('agent-browser console', { encoding: 'utf-8' }).trim()

  const ok = title.includes('ESWATINI CARS') && !errors.includes('Error') && !title.includes('Something went wrong')
  console.log(`    → Title: ${title}`)
  if (errors) console.log(`    → Errors: ${errors.split('\n').slice(0,3).join(' | ')}`)
  if (consoleOut) console.log(`    → Console: ${consoleOut.split('\n').slice(0,3).join(' | ')}`)
  console.log(`    → ${ok ? '✅ PASS' : '❌ FAIL'}`)
}

console.log('\n=== Step 3: Restore clean state ===')
execSync('agent-browser eval "localStorage.clear()"', { stdio: 'inherit' })
execSync('agent-browser reload', { stdio: 'inherit' })
execSync('sleep 3', { stdio: 'inherit' })

const title = execSync('agent-browser get title', { encoding: 'utf-8' }).trim()
console.log(`Final title after clear: ${title}`)
console.log(`\n✅ Test complete. If all rows say PASS, the fix works.`)

execSync('agent-browser close', { stdio: 'inherit' })
