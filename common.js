// 별 파티 공용 — 조 · 통신 · 차시 · 문제
import { FIREBASE } from './firebase-config.js';

export const TEAMS = [
  { id: 't1', name: '1조', color: '#e5484d' },
  { id: 't2', name: '2조', color: '#3e63dd' },
  { id: 't3', name: '3조', color: '#46a758' },
  { id: 't4', name: '4조', color: '#ffd60a' },
  { id: 't5', name: '5조', color: '#8e4ec6' },
  { id: 't6', name: '6조', color: '#00c2d7' },
  { id: 't0', name: '선생님', color: '#f4f1ea' },
];
export const team = (id) => TEAMS.find((t) => t.id === id);

// 차시 = 강의자료 주소. 문제는 고른 차시까지의 내용만 나온다.
export const LESSONS = [
  { n: 1, title: '별까지의 거리', url: 'https://moonclipse-t.github.io/Star-Parallax/' },
  { n: 2, title: '별의 등급과 밝기', url: 'https://moonclipse-t.github.io/Star-Luminosity/' },
  { n: 3, title: '별의 표면 온도와 색', url: 'https://moonclipse-t.github.io/Star-Color/' },
];

// 통신: set(경로, 값) · on(경로, cb) · onKids(경로, cb) · get(경로)
// 값은 JSON 문자열로 저장한다(Firebase 가 빈 배열 · undefined 를 바꿔 버리는 일을 피함).
export async function connect(room) {
  const base = `rooms/${room}`;
  if (FIREBASE) {
    const V = '10.12.2';
    const { initializeApp, getApps } = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`);
    const fb = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-database.js`);
    const db = fb.getDatabase(getApps()[0] || initializeApp(FIREBASE)); // 방 번호를 바꿔 다시 연결해도 앱은 하나
    const r = (p) => fb.ref(db, `${base}/${p}`);
    const val = (s) => (s.exists() ? JSON.parse(s.val()) : null);
    return {
      mode: 'online',
      set: (p, v) => fb.set(r(p), JSON.stringify(v)),
      on: (p, cb) => fb.onValue(r(p), (s) => cb(val(s))),
      onKids: (p, cb) => fb.onValue(r(p), (s) => { const o = {}; s.forEach((c) => { o[c.key] = JSON.parse(c.val()); }); cb(o); }),
      get: async (p) => val(await fb.get(r(p))),
    };
  }
  // 시험 모드: localStorage + storage 이벤트 → 같은 컴퓨터의 탭끼리만 연결
  const K = (p) => `party:${base}/${p}`;
  const subs = new Set();
  const fire = (k) => subs.forEach((s) => s(k));
  addEventListener('storage', (e) => e.key && fire(e.key));
  const read = (k) => { const v = localStorage.getItem(k); return v == null ? null : JSON.parse(v); };
  const kids = (p) => {
    const pre = K(p) + '/', o = {};
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(pre)) o[k.slice(pre.length)] = read(k); }
    return o;
  };
  return {
    mode: 'local',
    set(p, v) { localStorage.setItem(K(p), JSON.stringify(v)); fire(K(p)); },
    on(p, cb) { const k = K(p); subs.add((x) => x === k && cb(read(k))); cb(read(k)); },
    onKids(p, cb) { const pre = K(p) + '/'; subs.add((x) => x.startsWith(pre) && cb(kids(p))); cb(kids(p)); },
    get: async (p) => read(K(p)),
  };
}

// 같은 seed → 모든 기기에서 같은 순서(유성 위치 · 문제 순서)
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const pick = (arr, n, rand) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };

// 문제 은행 — 교과서(강의자료) 내용만. l = 차시, a = 정답 번호(0부터)
export const QUESTIONS = [
  { l: 1, q: '떨어진 두 지점에서 물체를 볼 때, 두 관측 지점과 물체가 이루는 각은?', c: ['시차', '광년', '등급', '파섹'], a: 0 },
  { l: 1, q: '관측 지점과 물체 사이의 거리가 가까울수록 시차는?', c: ['커진다', '작아진다', '변하지 않는다'], a: 0 },
  { l: 1, q: '연주 시차는 지구에서 몇 개월 간격으로 별을 관측해 구할까?', c: ['1개월', '3개월', '6개월', '12개월'], a: 2 },
  { l: 1, q: '연주 시차는 6개월 간격으로 잰 시차의 얼마일까?', c: ['2배', '½', '¼', '같다'], a: 1 },
  { l: 1, q: '지구에서 멀리 있는 별일수록 연주 시차는?', c: ['커진다', '작아진다', '같다'], a: 1 },
  { l: 1, q: '1°(도)는 몇 ″(초)일까?', c: ['60″', '360″', '3600″', '100″'], a: 2 },
  { l: 1, q: '연주 시차가 1″ 인 별까지의 거리는?', c: ['1 pc', '1 광년', '1 AU', '10 pc'], a: 0 },
  { l: 1, q: '1 pc 은 약 몇 광년일까?', c: ['1 광년', '3.26 광년', '10 광년', '100 광년'], a: 1 },
  { l: 1, q: '1 광년은 무엇일까?', c: ['빛이 1년 동안 가는 거리', '빛이 1초 동안 가는 거리', '지구가 1년 동안 도는 거리', '지구와 태양 사이 거리'], a: 0 },
  { l: 1, q: '연주 시차가 0.1″ 인 별까지의 거리는?', c: ['0.1 pc', '1 pc', '10 pc', '100 pc'], a: 2 },
  { l: 1, q: '연주 시차가 A 0.5″, B 0.2″ 이다. 지구에서 더 가까운 별은?', c: ['A', 'B', '같다'], a: 0 },
  { l: 2, q: '단위 면적에 들어오는 빛의 양은 거리의 제곱에 ( ) 한다.', c: ['비례', '반비례', '관계없음'], a: 1 },
  { l: 2, q: '광원과의 거리가 2배가 되면 빛의 세기는?', c: ['½ 배', '¼ 배', '2배', '4배'], a: 1 },
  { l: 2, q: '광원과의 거리가 3배가 되면 빛의 세기는?', c: ['⅓ 배', '1/9 배', '3배', '9배'], a: 1 },
  { l: 2, q: '별의 등급 숫자가 클수록 별은?', c: ['밝다', '어둡다'], a: 1 },
  { l: 2, q: '1등급인 별은 6등급인 별보다 몇 배 밝을까?', c: ['5배', '6배', '100배', '1000배'], a: 2 },
  { l: 2, q: '1등급 차이는 밝기로 약 몇 배일까?', c: ['약 2.5배', '약 5배', '약 10배', '약 100배'], a: 0 },
  { l: 2, q: '모든 별이 10 pc 거리에 있다고 가정했을 때의 밝기로 정한 등급은?', c: ['겉보기 등급', '절대 등급'], a: 1 },
  { l: 2, q: '우리 눈에 보이는 밝기를 기준으로 정한 등급은?', c: ['겉보기 등급', '절대 등급'], a: 0 },
  { l: 2, q: '겉보기 등급이 가장 작은(가장 밝게 보이는) 별은?', c: ['태양', '시리우스', '베텔게우스', '리겔'], a: 0 },
  { l: 2, q: '태양의 절대 등급은?', c: ['−26.7', '4.8', '1.4', '−5.9'], a: 1 },
  { l: 2, q: '겉보기 등급 < 절대 등급 인 별은 10 pc 보다?', c: ['가까이 있다', '멀리 있다', '정확히 10 pc'], a: 0 },
  { l: 2, q: '겉보기 등급과 절대 등급이 같은 별까지의 거리는?', c: ['1 pc', '10 pc', '100 pc', '1 광년'], a: 1 },
  { l: 2, q: '별의 실제 밝기를 비교할 때 쓰는 등급은?', c: ['겉보기 등급', '절대 등급'], a: 1 },
  { l: 3, q: '별마다 색이 다른 까닭은 별의 ( ) 가 다르기 때문이다.', c: ['표면 온도', '크기', '거리', '나이'], a: 0 },
  { l: 3, q: '청색 별은 적색 별보다 표면 온도가?', c: ['높다', '낮다', '같다'], a: 0 },
  { l: 3, q: '태양은 무슨 색 별일까?', c: ['청색', '백색', '황색', '적색'], a: 2 },
  { l: 3, q: '태양의 표면 온도는 약 몇 K 일까?', c: ['3000 K', '6000 K', '10000 K', '30000 K'], a: 1 },
  { l: 3, q: '오리온자리 베텔게우스의 색은?', c: ['청백색', '백색', '황색', '적색'], a: 3 },
  { l: 3, q: '오리온자리 리겔의 색은?', c: ['청백색', '황색', '주황색', '적색'], a: 0 },
  { l: 3, q: '표면 온도가 가장 높은 별의 색은?', c: ['청색', '백색', '황색', '적색'], a: 0 },
  { l: 3, q: '다음 중 표면 온도가 가장 낮은 별은?', c: ['스피카(청백색)', '시리우스(백색)', '태양(황색)', '안타레스(적색)'], a: 3 },
  { l: 3, q: '표면 온도가 높은 별부터 바르게 나열한 것은?', c: ['청색 → 백색 → 황색 → 적색', '적색 → 황색 → 백색 → 청색', '백색 → 청색 → 적색 → 황색'], a: 0 },
  { l: 3, q: '시리우스는 무슨 색 별일까?', c: ['백색', '황색', '적색', '주황색'], a: 0 },
];
export const questionsUpTo = (l) => QUESTIONS.filter((q) => q.l <= l);

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
