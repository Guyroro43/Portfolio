// Capture d'écran d'une page, pour vérifier le rendu sans rien installer (Chrome ou Edge du PC).
// Usage : node scripts/capture.mjs <adresse> <sortie.png> [largeur=1440] [--mobile] [--reduce-motion]
// --mobile simule un téléphone (écran tactile, densité 2). La capture prend toute la hauteur de la page.

import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const [url, output, widthArg] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const mobile = process.argv.includes('--mobile')
const reduceMotion = process.argv.includes('--reduce-motion')
const width = Number(widthArg ?? (mobile ? 390 : 1440))

if (!url || !output) {
  console.error('Usage : node scripts/capture.mjs <adresse> <sortie.png> [largeur] [--mobile] [--reduce-motion]')
  process.exit(1)
}

const browsers = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].filter(Boolean)
const browserPath = browsers.find((p) => existsSync(p))
if (!browserPath) {
  console.error('Chrome ou Edge introuvable. Indique son chemin dans CHROME_PATH.')
  process.exit(1)
}

const port = 9333
const profile = mkdtempSync(join(tmpdir(), 'capture-'))
const browser = spawn(browserPath, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--no-first-run',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  'about:blank',
])

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function pageSocketUrl() {
  for (let i = 0; i < 50; i++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
      const page = targets.find((t) => t.type === 'page')
      if (page) return page.webSocketDebuggerUrl
    } catch {}
    await sleep(200)
  }
  throw new Error('Le navigateur ne répond pas')
}

try {
  const ws = new WebSocket(await pageSocketUrl())
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = reject
  })

  let nextId = 1
  const pending = new Map()
  const listeners = new Map()
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)
    } else if (msg.method && listeners.has(msg.method)) {
      listeners.get(msg.method)(msg.params)
    }
  }
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = nextId++
      pending.set(id, { resolve, reject })
      ws.send(JSON.stringify({ id, method, params }))
    })
  const once = (method) => new Promise((resolve) => listeners.set(method, resolve))

  const metrics = { width, height: mobile ? 844 : 900, deviceScaleFactor: mobile ? 2 : 1, mobile }
  await send('Page.enable')
  await send('Emulation.setDeviceMetricsOverride', metrics)
  if (mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })
  if (reduceMotion) {
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  }

  const loaded = once('Page.loadEventFired')
  await send('Page.navigate', { url })
  await loaded
  await sleep(2500) // polices et animations d'entrée

  const { result } = await send('Runtime.evaluate', {
    expression:
      'JSON.stringify({ h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth, vw: innerWidth })',
    returnByValue: true,
  })
  const size = JSON.parse(result.value)
  if (size.w > size.vw) console.warn(`Attention : la page déborde en largeur (${size.w} px pour ${size.vw} px).`)

  await send('Emulation.setDeviceMetricsOverride', { ...metrics, height: Math.min(size.h, 16000) })
  await sleep(300)
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
  writeFileSync(output, Buffer.from(shot.data, 'base64'))
  console.log(`${output} (${width} x ${size.h} px${mobile ? ', téléphone' : ''})`)
  ws.close()
} finally {
  browser.kill()
  await sleep(300)
  try {
    rmSync(profile, { recursive: true, force: true })
  } catch {}
}
