const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

function load(file, globals = {}, mocks = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  })
  const exports = {}
  vm.runInNewContext(outputText, {
    exports, require: (name) => {
      if (!(name in mocks)) throw new Error(`Unexpected dependency: ${name}`)
      return mocks[name]
    }, Headers, URL, ...globals,
  }, { filename: file })
  return exports
}

const media = { '@/lib/local-media': {} }

test('catalog follows every page through the same-origin proxy', async () => {
  const calls = []
  const api = load('lib/catalog-api.ts', { fetch: async (url) => {
    calls.push(url)
    return { ok: true, json: async () => ({
      results: [{ film_id: calls.length }], next: calls.length < 3 ? 'http://backend/movies/?page=2' : null,
    }) }
  } }, media)
  const result = await api.fetchCatalog()
  assert.deepEqual(calls, ['/api/catalog?page=1', '/api/catalog?page=2', '/api/catalog?page=3'])
  assert.equal(result.length, 3)
})

test('catalog reports a failed later page instead of returning incomplete results', async () => {
  let page = 0
  const api = load('lib/catalog-api.ts', { fetch: async () => ++page === 1
    ? { ok: true, json: async () => ({ results: [], next: 'next' }) }
    : { ok: false, status: 502 },
  }, media)
  await assert.rejects(api.fetchCatalog(), /502/)
})

test('PIN verification stores a server grant and sends it on subsequent profile requests', async () => {
  const storage = new Map()
  const requests = []
  const api = load('lib/subscriptions-api.ts', {
    window: {
      localStorage: { getItem: () => '7' },
      sessionStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    },
    fetch: async (url, init) => {
      requests.push({ url, init })
      return { ok: true, status: 200, json: async () => url.includes('verify-pin')
        ? { verified: true, access_token: 'signed-grant' } : { results: [] } }
    },
  }, { '@/lib/auth-api': { refreshAccessToken: async () => null },
       '@/lib/auth-tokens': { getAccessToken: () => 'jwt' } })
  assert.equal(await api.verifyProfilePin(7, '1234'), true)
  await api.listMyListItems()
  assert.equal(requests[1].init.headers.get('X-Profile-Access'), 'signed-grant')
  assert.equal(requests[0].init.headers.get('authorization'), 'Bearer jwt')
  assert.equal(JSON.parse(requests[0].init.body).pin, '1234')
})

test('personal history includes later pages', async () => {
  const urls = []
  const api = load('lib/subscriptions-api.ts', {
    window: { localStorage: { getItem: () => null } },
    fetch: async (url) => {
      urls.push(url)
      return { ok: true, status: 200, json: async () => ({
        results: [{ id: urls.length }], next: urls.length === 1 ? 'next' : null,
      }) }
    },
  }, { '@/lib/auth-api': {}, '@/lib/auth-tokens': { getAccessToken: () => 'jwt' } })
  assert.equal((await api.listWatchHistory()).length, 2)
  assert.deepEqual(urls, ['/api/backend/subscriptions/history/?page=1', '/api/backend/subscriptions/history/?page=2'])
})

test('catalog proxy forwards pagination and search without changing the backend origin', async () => {
  let target
  const route = load('app/api/catalog/route.ts', {
    process: { env: { API_BASE_URL: 'http://backend/api/' } },
    fetch: async (url) => {
      target = String(url)
      return { status: 200, text: async () => '{}' }
    },
  }, { 'next/server': { NextResponse: class { constructor(body, options) { this.status = options.status } } } })
  const response = await route.GET({ url: 'http://frontend/api/catalog?page=3&search=film' })
  assert.equal(response.status, 200)
  assert.equal(target, 'http://backend/api/movies/?page=3&search=film')
})

const browseMovies = [
  { id: '1', title: 'Zebra', description: 'A journey through space', rating: 'PG', duration: '80m', year: '2001' },
  { id: '2', title: 'Alpha', description: 'Adventure', rating: 'R', duration: '110m', year: '2010' },
  { id: '3', title: 'Beta', description: 'Space adventure', rating: 'PG', duration: '140m', year: '2020' },
  { id: '4', title: 'Unknown', rating: 'PG', duration: 'N/A', year: 'N/A' },
]
const defaultFilters = { query: '', rating: 'all', duration: 'all', sort: 'catalog' }

test('movie search combines description, age rating and duration filters', () => {
  const { filterMovies } = load('lib/movie-browser.ts')
  const results = filterMovies(browseMovies, { ...defaultFilters, query: ' SPACE ', rating: 'PG', duration: 'long' })
  assert.equal(results.length, 1)
  assert.equal(results[0].id, '3')
})

test('movie ordering keeps the original saved list unchanged', () => {
  const { filterMovies } = load('lib/movie-browser.ts')
  const results = filterMovies(browseMovies, { ...defaultFilters, sort: 'title' })
  assert.equal(results[0].title, 'Alpha')
  assert.equal(browseMovies[0].title, 'Zebra')
  const byYear = filterMovies(browseMovies, { ...defaultFilters, sort: 'year' })
  assert.equal(byYear[0].id, '3')
  assert.equal(byYear[3].id, '4')
})

test('duration filters exclude unavailable values and handle boundary durations', () => {
  const { filterMovies } = load('lib/movie-browser.ts')
  const results = filterMovies([
    { ...browseMovies[0], duration: '90m' },
    { ...browseMovies[1], duration: '120m' },
    browseMovies[3],
  ], { ...defaultFilters, duration: 'medium' })
  assert.equal(results.length, 2)
  assert.equal(filterMovies(browseMovies, { ...defaultFilters, query: 'absent' }).length, 0)
})

test('navigation preserves the home logo link and exposes Movies and My List only', () => {
  const React = require('react')
  const { renderToStaticMarkup } = require('react-dom/server')
  const brand = load('components/brand-logo.tsx', {}, {
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/link': { default: ({ children, ...props }) => React.createElement('a', props, children) },
  })
  const { Navbar } = load('components/stream/navbar.tsx', {}, {
    '@/components/ui/liquid-glass': load('components/ui/liquid-glass.tsx', {}, { 'react/jsx-runtime': require('react/jsx-runtime') }),
    '@/components/brand-logo': brand,
    react: React,
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/link': { default: ({ children, ...props }) => React.createElement('a', props, children) },
    'next/image': { default: () => null },
    'next/navigation': { usePathname: () => '/movies' },
    'lucide-react': require('lucide-react'),
    '@/lib/auth-context': { useAuth: () => ({ signOut() {} }) },
    '@/lib/video-context': { useVideo: () => ({ myList: [] }) },
    '@/lib/profile-context': {
      useProfile: () => ({ currentProfile: { id: '1', name: 'User' }, profiles: [{ id: '1' }] }),
      AVATAR_COLORS: [{ bg: 'bg-red-500' }],
    },
  })
  const html = renderToStaticMarkup(React.createElement(Navbar, { onSearchClick() {} }))
  assert.match(html, /href="\/" aria-label="StreamFlix, página principal"/)
  assert.match(html, /href="\/movies" aria-current="page"/)
  assert.match(html, /href="\/my-list"/)
  assert.doesNotMatch(html, /TV Shows|New &amp; Popular|>Home</)
})

test('profile photos are resized before saving and bitmap resources are released', async () => {
  let closed = false
  let drawing
  const canvas = {
    width: 0, height: 0,
    getContext: () => ({ fillRect() {}, drawImage: (...args) => { drawing = args } }),
    toDataURL: (type, quality) => { assert.equal(type, 'image/jpeg'); assert.equal(quality, 0.85); return 'data:image/jpeg;base64,prepared' },
  }
  const { prepareProfileAvatar } = load('lib/profile-avatar.ts', {
    createImageBitmap: async () => ({ width: 4000, height: 2000, close: () => { closed = true } }),
    document: { createElement: () => canvas },
  })
  const result = await prepareProfileAvatar({ type: 'image/png', size: 1000 })
  assert.equal(result, 'data:image/jpeg;base64,prepared')
  assert.equal(canvas.width, 256)
  assert.equal(canvas.height, 128)
  assert.equal(drawing[3], 256)
  assert.equal(closed, true)
})

test('profile photos reject unsupported formats, oversized files and unreadable images', async () => {
  const { prepareProfileAvatar } = load('lib/profile-avatar.ts', {
    createImageBitmap: async () => { throw new Error('bad image') },
  })
  await assert.rejects(prepareProfileAvatar({ type: 'image/svg+xml', size: 100 }), /JPG, PNG o WebP/)
  await assert.rejects(prepareProfileAvatar({ type: 'image/jpeg', size: 6 * 1024 * 1024 }), /5 MB/)
  await assert.rejects(prepareProfileAvatar({ type: 'image/jpeg', size: 100 }), /leer esta imagen/)
})
