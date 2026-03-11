# PDCA PLAN — 온보딩 v1.1 전면 재설계
> Phase: PLAN | 작성일: 2026-02-28 | 기능: DittoChat-Onboarding-v1.1

---

## 🎯 목표

기존 4단계 온보딩을 v1.1 기획서 기준 6단계로 전면 재설계.
"쓰는 온보딩"이 아닌 "고르는 온보딩" 완성.

| 항목 | 현재 (v1.0) | 목표 (v1.1) |
|---|---|---|
| 단계 수 | 4단계 | 6단계 |
| 직업 선택 | 드롭다운 | 카드형 버튼 4개 |
| 취미 선택 | 무제한 다중 | 최대 3개 제한 |
| 카카오톡 | 없음 | txt 업로드 + 건너뛰기 |
| 아바타 | 없음 | 이름 입력 + 이미지 선택 |
| 상대방 프로필 | Step 3으로 존재 | 완전 제거 |
| 성별 | 없음 | Step 1에 추가 |

---

## 📦 재사용 vs 새로 작성 구분

### ✅ index.html — 재사용 (손대지 않음)

| 코드 위치 | 내용 | 재사용 이유 |
|---|---|---|
| CSS 전체 (`*`, `body`, `.card`, `.btn`) | 기본 레이아웃 | 그대로 사용 가능 |
| `.tag` / `.tag.on` CSS | 태그 선택 스타일 | 취미 카드에 그대로 활용 |
| `.style-tag` CSS | 단일 선택 스타일 | 직업 카드에 그대로 활용 |
| `.chat-wrap` / `.bubble` CSS | 채팅 UI | 변경 없음 |
| `COMPATIBILITY` 객체 | 궁합 테이블 | 변경 없음 |
| `MBTI_LIST` 배열 | MBTI 16종 | Step 3에서 그대로 활용 |
| `pickMatch()` 함수 | 자동 매칭 | 변경 없음 |
| `formatBirthInput()` 함수 | 생년월일 포맷 | Step 1으로 이동만 |
| `calcAgeAndGen()` 함수 | 세대 계산 | 변경 없음 |
| `sleep()` / `esc()` 유틸 | 공통 유틸 | 변경 없음 |
| `typeText()` 함수 | 타이핑 애니메이션 | 변경 없음 |
| `processQueue()` 함수 | 메시지 큐 | 변경 없음 |
| `addTypingDots()` / `removeTypingDots()` | 타이핑 점 | 변경 없음 |
| 채팅 뷰어 HTML 전체 (`#chatWrap`) | 채팅 UI | 변경 없음 |
| `restart()` 함수 | 다시 설정 | 변경 없음 |

### 🔄 index.html — 수정 필요

| 코드 위치 | 현재 | 수정 내용 |
|---|---|---|
| 스테퍼 HTML `#stepper` (182~191줄) | `sd1~sd4`, `sl1~sl3` | `sd1~sd6`, `sl1~sl5` 로 교체 |
| `go()` 함수 (516~533줄) | `i <= 4` 하드코딩 | `i <= 6` 으로 변경 |
| `STEP_LABELS` 배열 (515줄) | 4개 항목 | 6개 항목으로 확장 |
| `startChat()` 함수 (620줄~) | Step 4 버튼에서 호출 | Step 6 버튼에서 호출로 변경, 파라미터 추가 |
| `setInterval` 완료 감지 (712~718줄) | 폴링 방식 | SSE done 이벤트에 통합 후 삭제 |

### ❌ index.html — 삭제

| 코드 위치 | 내용 | 삭제 이유 |
|---|---|---|
| Step 1 HTML `#step1` (193~205줄) | MBTI 선택 카드 | 새 Step 1로 완전 교체 |
| Step 2 HTML `#step2` (207~303줄) | 나의 프로필 (통합형) | 새 Step 2~4로 분리 재설계 |
| Step 3 HTML `#step3` (305~343줄) | 상대방 프로필 | v1.1에서 완전 제거 |
| Step 4 HTML `#step4` (345~382줄) | 오늘 기분 퀴즈 | v1.1 구조에 없음, 제거 |
| `a_city` 거주지 관련 코드 | HTML + JS | v1.1 기획에 없음 |
| `b_age`, `b_job`, `b_detail` 수집 코드 | JS | 상대방 프로필 제거에 따라 삭제 |
| `toggleDetail('b')` 함수 관련 | JS | 상대방 step 제거로 불필요 |
| `answers` 객체 (q1,q2,q3) | JS | 기분 퀴즈 제거로 삭제 |
| `QUIZ_CTX` 관련 파라미터 전달 | JS | 서버 파라미터에서 제거 |

### ✅ server.js — 재사용 (손대지 않음)

| 코드 | 재사용 이유 |
|---|---|
| `PERSONAS` 객체 (10~27줄) | 변경 없음 |
| `genAI` 초기화 / `app.use` | 변경 없음 |
| SSE 헤더 설정 / `send()` 함수 | 변경 없음 |
| 5라운드 대화 루프 구조 | 변경 없음 |
| `app.listen(3000)` | 변경 없음 |

### 🔄 server.js — 수정 필요

| 코드 위치 | 현재 | 수정 내용 |
|---|---|---|
| `buildPrompt()` 파라미터 (39줄) | `city`, `convStyle`, `emotionStyle`, `tone` 포함 | `gender`, `kakaoStyle` 추가. `city` 제거 |
| `/api/stream` req.query 구조 (84~90줄) | `b_age`, `b_job`, `b_city`, `q1~q3` 포함 | 상대방 프로필 파라미터 제거, `gender`, `kakaoStyle`, `avatarName` 추가 |
| `sysB` 프롬프트 (115~118줄) | `city: null, hobbies: null` | 불필요한 null 전달 정리 |

### ❌ server.js — 삭제

| 코드 | 삭제 이유 |
|---|---|
| `QUIZ_CTX` 객체 (30~34줄) | 기분 퀴즈 제거 |
| `moodCtx` 조합 로직 (103~107줄) | 기분 퀴즈 제거 |

### 🆕 새로 추가

| 위치 | 내용 |
|---|---|
| `index.html` | Step 1: 생년월일 + 성별 버튼 (남/여/선택안함) |
| `index.html` | Step 2: 직업 카드 4개 (학생/대학생/직장인/기타) |
| `index.html` | Step 3: MBTI 16개 선택 (그리드 버튼) |
| `index.html` | Step 4: 취미 8개 카드, 최대 3개 선택 + 초과 시 경고 |
| `index.html` | Step 5: 카카오톡 txt 업로드 + 파싱 결과 표시 + 건너뛰기 버튼 |
| `index.html` | Step 6: 아바타 이름 입력 + 프로필 이미지 3종 선택 |
| `server.js` | `/api/analyze-kakao` POST 엔드포인트 (txt 파일 파싱) |
| `server.js` | `analyzeKakaoStyle()` 함수 (어미, 문장 길이, 이모티콘 분석) |
| `server.js` | `buildPrompt()`에 `gender`, `kakaoStyle` 파라미터 추가 |

---

## 🔀 교체 순서 (충돌 없이 진행하는 순서)

```
1단계 — server.js 정리 (프론트 영향 없음)
  └─ QUIZ_CTX 삭제
  └─ buildPrompt 파라미터 정리
  └─ /api/stream req.query 정리
  └─ /api/analyze-kakao 엔드포인트 추가

2단계 — index.html 스텝 엔진 교체 (뼈대 먼저)
  └─ 스테퍼 HTML을 6단계로 교체
  └─ go() 함수를 6단계로 수정
  └─ STEP_LABELS 배열 확장

3단계 — 기존 Step 1~4 HTML 전면 교체
  └─ 기존 step1~step4 카드 HTML 삭제
  └─ 새 step1 (생년월일+성별) 작성
  └─ 새 step2 (직업 카드) 작성
  └─ 새 step3 (MBTI 그리드) 작성
  └─ 새 step4 (취미 카드 + 3개 제한) 작성

4단계 — 새 Step 5~6 HTML 추가
  └─ step5 (카카오톡 업로드) 작성
  └─ step6 (아바타 이름+이미지) 작성

5단계 — JS 로직 교체
  └─ 기존 answers, a_city, b_* 관련 JS 삭제
  └─ 직업 카드 선택 JS 추가
  └─ 취미 3개 제한 JS 추가
  └─ 카카오톡 업로드 + /api/analyze-kakao 호출 JS 추가
  └─ startChat() 파라미터 업데이트

6단계 — setInterval 제거 및 완료 로직 정리
```

---

## ⚠️ 충돌 방지 포인트

| 포인트 | 주의사항 |
|---|---|
| `go()` 수정 시 | `chatWrap` 숨김 로직 보존 필수 |
| Step 3 MBTI 그리드 | 기존 `sel1` select 엘리먼트 완전 제거하고 새 그리드로 교체. `startChat()`의 `mbti1` 값 수집 방식도 같이 변경 |
| 취미 3개 제한 | 기존 `.tag` CSS 재사용, JS만 교체 (`toggle` → 개수 체크 후 조건부 toggle) |
| 카카오톡 건너뛰기 | Step 5에서 건너뛰면 `kakaoStyle = null`로 처리, `go(6)` 호출 |
| `startChat()` 호출 위치 | Step 6 완료 버튼에서 호출. Step 4 버튼의 `onclick="startChat()"` 제거 |
| `M1name` 레이블 | `a_city` 제거 후 `[a_age, a_job].filter(Boolean).join(' · ')` 로 수정 |

---

## ✅ Do 단계 진입 체크리스트

- [ ] server.js 정리 완료
- [ ] 스테퍼 6단계 동작 확인
- [ ] Step 1~6 화면 전환 확인
- [ ] 취미 3개 초과 시 선택 불가 확인
- [ ] 카카오톡 건너뛰기 → Step 6 이동 확인
- [ ] startChat() 에서 새 파라미터 정상 전달 확인
- [ ] 채팅 뷰어 정상 동작 확인 (기존 기능 회귀 없음)
