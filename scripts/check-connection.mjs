const publicApi = process.env.REQUIRE_PUBLIC_API === 'true'
const base = (process.argv[2] || process.env.VITE_API_BASE_URL || (publicApi ? '' : 'http://localhost:8088/api')).trim()
const origin = process.env.FRONTEND_ORIGIN || 'https://ekhan-go.github.io'

async function check() {
  if (!base) throw new Error('GitHub Actions 변수 VITE_API_BASE_URL에 HTTPS 백엔드 주소와 /api를 설정하세요.')
  const url = new URL(base)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('API 주소는 HTTP 또는 HTTPS여야 합니다.')
  if (publicApi && (url.protocol !== 'https:' || /^(localhost|127\..*|\[::1\])$/i.test(url.hostname))) {
    throw new Error('GitHub Pages에서는 외부에서 접근 가능한 HTTPS API 주소가 필요합니다.')
  }
  url.pathname = url.pathname.replace(/\/+$/, '') + '/system'
  url.search = ''
  url.hash = ''
  let response
  try {
    response = await fetch(url, { headers: publicApi ? { Origin: origin } : {}, signal: AbortSignal.timeout(20000) })
  } catch (error) {
    throw new Error(`백엔드에 접속할 수 없습니다. 서버와 cloudflared 실행 상태 및 API 주소를 확인하세요. (${error.cause?.code || error.name})`)
  }
  const text = await response.text()
  if (response.status === 530 && /1033/.test(text)) {
    throw new Error('Cloudflare 터널 연결 실패(HTTP 530 / 1033). cloudflared를 실행하고 주소가 바뀌었다면 VITE_API_BASE_URL을 변경하세요.')
  }
  let status
  try { status = JSON.parse(text) } catch {
    throw new Error(`API가 JSON 대신 다른 응답을 반환했습니다(HTTP ${response.status}). API 주소와 터널을 확인하세요.`)
  }
  if (!response.ok || status.connected !== true) {
    throw new Error(`백엔드 또는 DB 연결 실패(HTTP ${response.status}). 백엔드 로그와 DB_URL, DB_USERNAME, DB_PASSWORD를 확인하세요.`)
  }
  if (publicApi && response.headers.get('access-control-allow-origin') !== origin) {
    throw new Error(`CORS 설정이 필요합니다. 백엔드 FRONTEND_ORIGIN에 ${origin}을 포함하고 재시작하세요.`)
  }
  console.log('백엔드 및 DB 연결 성공' + (publicApi ? ' / 배포 사이트 CORS 허용 확인' : ''))
}

check().catch(error => {
  console.error(error.message)
  process.exitCode = 1
})
