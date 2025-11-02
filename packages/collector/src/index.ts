import 'dotenv/config'
import { insertActivity } from '@daygraph/db/queries'

// 네이티브 의존성은 개발 편의상 optional로 두고, 실패 시 목업으로 대체
async function getActiveWindow() {
  try {
    const mod = await import('active-win')
    const res = await (mod.default as any)()
    return {
      app: res.owner?.name ?? 'Unknown',
      title: res.title ?? 'Unknown',
      bounds: res.bounds as { x: number; y: number; width: number; height: number } | undefined,
    }
  } catch {
    // 목업: 간단 라운드 로빈 앱 이름
    const apps = ['VSCode', 'Chrome', 'Terminal']
    const i = Math.floor(Date.now() / 5000) % apps.length
    return { app: apps[i], title: `${apps[i]} — Mock`, bounds: { x: 0, y: 0, width: 100, height: 100 } }
  }
}

// 클릭/키보드 카운터 (iohook 실패 시 window 이벤트 없음 → 목업 증가 X)
let clicks = 0
let keypress = 0

async function setupInputHooks() {
  try {
    const iohook = await import('iohook')
    iohook.default.on('mouseclick', () => clicks++)
    iohook.default.on('keydown', () => keypress++)
    iohook.default.start()
  } catch {
    // 목업 모드: 아무 것도 하지 않음
  }
}

function calcDisplayId(bounds?: { x: number; y: number; width: number; height: number } | undefined) {
  // 간단히 좌표 기준으로 가짜 디스플레이 ID 추정 (0 또는 1)
  if (!bounds) return null
  return bounds.x < 1920 ? 0 : 1
}

async function tick() {
  const win = await getActiveWindow()
  const now = new Date().toISOString()
  await insertActivity({
    timestamp: now,
    app_name: win.app,
    window_title: win.title,
    display_id: calcDisplayId(win.bounds),
    is_active: true,
    clicks,
    keypress,
  })
  // 1초마다 집계 저장 후 초기화
  clicks = 0
  keypress = 0
}

async function main() {
  await setupInputHooks()
  // 루프 ≤ 5ms/틱 유지: 실제 작업은 DB insert 1초/회
  setInterval(() => { void tick() }, 1000)
  // 프로세스 유지
  // eslint-disable-next-line
  console.log('[collector] started')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
