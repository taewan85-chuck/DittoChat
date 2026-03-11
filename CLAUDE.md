# DittoChat — Claude Code 프로젝트 가이드

## 프로젝트 개요

**디토챗(DittoChat)**은 MBTI + 생년월일 + 성격 데이터 기반 AI 아바타(디토)가 다른 아바타와 대화하는 것을 사용자가 관전·학습시키는 AI 페르소나 소셜 플랫폼이다.

- **슬로건:** "나보다 더 나다운 분신, 디토와의 대화 관찰기"
- **모토:** "말 걸기 어려운 당신을 위해, 디토가 먼저 건넨다."
- **현재 버전:** v1.1 (PoC 단계)

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프론트엔드 | HTML / CSS / Vanilla JS (MVP) |
| 백엔드 | Node.js + Express |
| AI | Google Gemini API (gemini-2.5-flash) → 추후 OpenAI GPT-4o 전환 검토 |
| 실시간 통신 | SSE (Server-Sent Events) → WebSocket 전환 예정 |
| 환경변수 | .env (GEMINI_API_KEY) |
| 포트 | 3000 |

## 파일 구조

```
DittoChat/
├── CLAUDE.md              # 이 파일 (Claude Code 가이드)
├── index.html             # 프론트엔드 (온보딩 + 채팅 뷰어)
├── server.js              # 백엔드 (Express + SSE + Gemini API)
├── package.json
├── .env                   # GEMINI_API_KEY (git 제외)
├── DittoChat_기획서.md    # 서비스 기획서 v1.1
└── DittoChat_Master_Prompt.md
```

## 현재 구현 상태 (PoC)

- [x] MBTI 16종 페르소나 정의 (`PERSONAS` 객체)
- [x] 생년월일 → 나이 + 세대 태그 자동 계산
- [x] MBTI 궁합 리스트 기반 랜덤 자동 매칭 (`COMPATIBILITY`)
- [x] 4단계 온보딩 UI (MBTI → 내 프로필 → 상대 프로필 → 오늘 기분)
- [x] SSE 기반 실시간 스트리밍 채팅 뷰어
- [x] 타이핑 애니메이션 + 말풍선 UI
- [ ] 온보딩 6단계로 확장 (직업 카드형 / 카카오톡 업로드 / 아바타 이름)
- [ ] 피드백 기능 (👍👎 버튼, 빙의하기)
- [ ] 방 시스템 (주제별 방 목록)

## 핵심 로직 요약

### 페르소나 빌더 (`buildPrompt`)
- MBTI 성격 + 인구통계(나이, 지역, 직업) + 취미 + 성격 스타일 + 세대 특성 + 오늘 기분을 조합해 시스템 프롬프트 생성
- 응답은 반드시 한 문장, 한국어 구어체, MBTI/이름 언급 금지

### 궁합 매칭
- 사용자가 상대 MBTI를 직접 선택하지 않음
- 내 MBTI 입력 시 `COMPATIBILITY` 테이블에서 랜덤 1개 자동 매칭

### SSE 흐름
- GET `/api/stream?mbti1=ENFP&mbti2=INFJ&...`
- Bot A와 Bot B가 번갈아 5라운드 대화
- 각 메시지는 `{ mbti, text }` JSON으로 스트리밍

## 개발 원칙

1. **MVP 우선** — 기능을 최소로 유지하고 작동하는 것을 먼저 만든다
2. **고르는 UX** — 타이핑 입력을 최소화하고 선택형 UI를 사용한다
3. **단일 파일 원칙** — PoC 단계에서는 `index.html` + `server.js` 2파일 체계 유지
4. **한국어 출력** — 모든 AI 응답은 자연스러운 한국어 구어체

## 다음 개발 목표 (Phase 0 완료 기준)

1. 온보딩 6단계 UI 완성 (기획서 STEP 1~6 참고)
2. 카카오톡 txt 파일 업로드 & 말투 분석 기능
3. 피드백 버튼 (👍👎) + 동기화율 % 표시
4. GitHub 최신 코드 푸시

## 주의사항

- `.env` 파일은 절대 커밋하지 않는다
- API 키는 반드시 환경변수로만 사용한다
- 현재 AI 모델: `gemini-2.5-flash` (server.js 120~121번 줄)
