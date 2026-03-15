# DayGraph

**DayGraph는 하루 동안의 작업 흐름을 ‘타임라인’으로 시각화하는 로컬 생산성 분석 앱입니다.**  
활성 창, 앱 사용 시간, 클릭·키 입력, 듀얼 모니터 사용 패턴 등을 초 단위로 기록하여  
“오늘 실제로 무엇에 집중했는지”를 명확하게 보여줍니다.

모든 데이터는 로컬 SQLite DB에만 저장되며 외부로 전송되지 않습니다.

---

## ✨ 주요 기능

### ✅ Activity Timeline (핵심 기능)

- 초 단위(1초) 활동 기록
- 활성 앱 / 창 제목 / 실행 경로 저장
- 클릭·키 입력 기반 집중도 분석
- 앱 전환 흐름 추적
- 창 좌표 기반 디스플레이 ID(듀얼 모니터) 구분

### ✅ Daily & Weekly Summary

- 앱별 사용 시간
- 클릭·키 입력 합산
- 집중 구간 / 산만 구간 분석
- 상위 사용 앱 TOP 5

### ✅ 100% Local-First

- SQLite + Drizzle ORM
- 로컬 파일('./data/dev-activity.sqlite')에만 저장
- 개인정보 유출 위험 0%

### ✅ Lightweight Architecture

- Collector는 독립 Node 프로세스로 분리
- Renderer는 React + Vite 기반
- 전체 메모리 사용량 80~140MB 목표

---

## 🏗 기술 스택

### Core

- Electron
- electron-vite
- pnpm workspace

### Renderer(UI)

- React 18
- TailwindCSS
- Zustand
- Recharts

### Collector (Activity Worker)

- active-win (활성 창 감지)
- iohook (전역 클릭/키 입력)
- node-window-manager (창 좌표 & 모니터 ID)
- Drizzle ORM + SQLite

### 기타 유틸

- zod
- date-fns
- clsx

---

## 📁 Monorepo 구조

root/
apps/
electron/ # Electron main, preload, builder config
renderer/ # React UI (Vite)
packages/
collector/ # Activity collector (Node Worker)
db/ # drizzle + sqlite + queries
shared/ # ipc types, schema, utils
data/ # sqlite 파일 저장 폴더

---

## 🚀 시작하기

### 0) 권장 실행 환경

- Node.js 22.x (22.20.0에서 검증)
- pnpm 9.15.1
- `better-sqlite3` 네이티브 모듈은 Node 22 계열에서 설치/실행하는 것을 권장

### 1) 패키지 설치

pnpm install

### 2) 개발 모드 실행

pnpm dev

### 3) 빌드

pnpm build

### 4) Collector 단독 실행 (선택)

pnpm collector

---

## 🗄 데이터베이스 스키마 (요약)

activity_log 테이블 구조:

- id: PK
- timestamp: string
- app_name: string
- window_title: string
- display_id: number | null
- is_active: boolean
- clicks: number
- keypress: number
- created_at: string

---

## 📊 스크린샷 (추가 예정)

- Daily Timeline
- App Summary
- Focus Heatmap
- Settings 페이지

---

## ✅ 로드맵

- [ ] Weekly 분석 페이지
- [ ] 파일·탭 단위 상세 분석
- [ ] 집중 점수 알고리즘
- [ ] AI 기반 하루 회고 자동 생성
- [ ] Git commit 연동
- [ ] 설정 페이지 고도화
- [ ] Auto-update 기능

---

## 🔒 개인정보 보호

DayGraph는 **모든 데이터를 로컬에만 저장**합니다.  
외부 서버로 어떠한 정보도 전송하지 않습니다.  
활동 데이터는 'data/dev-activity.sqlite'에 저장됩니다.

---

---

## 👤 제작자

Mandelina  
Frontend Developer  
Electron · Performance Optimization · Monorepo Architect
