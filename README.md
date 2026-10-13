# MoonClipse 별 파티

마리오 파티처럼 진행하는 수업 게임. 개념 설명(강의자료) → 🎲 턴 → 보드 이동 · 칸 이벤트 → 7명(6개 조 + 선생님) 미니게임 → 다시 수업.

- **선생님 화면(TV)**: `host.html` — 방 번호가 생긴다. 차시를 고르고 [게임 시작]
- **조 디벗 · 선생님 휴대폰**: `index.html` (사이트 주소 그대로) — 방 번호 → 조 → 캐릭터 → 참가
- 새로고침해도 이어서 한다(선생님 화면 주소에 `?room=번호` 가 남아 있음).

## 학교 와이파이에서 쓰려면 — Firebase 한 번 설정
`firebase-config.js` 가 비어 있으면 **시험 모드**(한 컴퓨터의 탭끼리만 연결)이다.

1. https://console.firebase.google.com → 프로젝트 추가 (애널리틱스 끔)
2. 빌드 → **Realtime Database** → 데이터베이스 만들기 → 위치 `asia-southeast1 (싱가포르)` → 잠금 모드로 시작
3. 규칙 탭에 붙여 넣고 게시:
   ```json
   { "rules": { "rooms": { "$room": { ".read": true, ".write": true } } } }
   ```
4. 프로젝트 설정(⚙) → 내 앱 → 웹(`</>`) 앱 등록 → 나오는 `firebaseConfig` 를 `firebase-config.js` 에 붙여 넣기
5. 무료(Spark) 요금제: 동시 접속 100 · 한 반 7대면 충분. 학생 개인정보는 저장하지 않는다(조 이름 · 점수만).

## 고치는 곳
| 파일 | 내용 |
|---|---|
| `common.js` | 조 색 · 차시(강의자료 주소) · **문제 은행** (`l` = 차시) |
| `games.js` | 미니게임 14종 (`l` = 그 차시부터 나오는 과학 게임). 선생님 화면 소개에서 골라 바꿀 수 있다 |
| `chars.js` | 캐릭터 10종 (three.js 도형) |
| `host.html` | 보드 · 칸 규칙(`TYPES`) · 코인 · 진행 |
| `index.html` | 조 디벗 화면 |

글자를 새로 넣으면 글꼴을 다시 만든다: `cd ../_build && node tools/party_fonts.mjs`

배경 하늘: NASA/Goddard SVS *Deep Star Maps 2020*.
