// 미니게임 — 조 디벗 1대를 6명이 함께 쓴다. play() 는 최종 점수를 돌려준다.
// l = 그 차시부터 나오는 과학 게임 · lower = 작을수록 1등 · hide = 끝날 때까지 큰 화면에 기록을 숨김 · tilt = 기울기 센서
import { rng, pick, esc } from './common.js';

export const GAMES = [
  { id: 'meteor', title: '유성 잡기', tag: '연타 · 다 함께', desc: '하늘에서 유성이 쏟아진다! 화면의 유성을 눌러 잡자. 금빛 혜성은 3점.', how: '조원 모두 동시에 눌러도 된다 — 손가락이 많을수록 유리!', unit: '점' },
  { id: 'rocket', title: '로켓 발사', tag: '연타', desc: '10초 동안 화면을 최대한 많이 두드려 로켓을 쏘아 올리자!', how: '6명 모두 손가락으로 두드리자', unit: '회' },
  { id: 'whack', title: '외계인 잡기', tag: '연타 · 판단', desc: '구덩이에서 튀어나오는 외계인을 눌러 잡자. 우주비행사를 누르면 −2점!', how: '구덩이를 나눠 맡으면 유리하다', unit: '점' },
  { id: 'twister', title: '우주 트위스터', tag: '협동', desc: '빛나는 원을 모두 동시에 누르고 있으면 다음 단계! 원은 6개까지 늘어난다.', how: '6명이 손가락 하나씩 맡자', unit: '단계' },
  { id: 'tilt', title: '별가루 모으기', tag: '기울이기 · 협동', desc: '디벗을 다 같이 기울여 행성을 굴리자. 별가루를 모으고, 블랙홀에 빠지면 −2.', how: '디벗을 책상 위에 두고 다 같이 잡고 기울이자', unit: '개', tilt: true },
  { id: 'memory', title: '별자리 기억', tag: '기억력', desc: '별이 빛나는 순서를 기억했다가 그대로 눌러 별자리를 완성하자. 갈수록 길어진다!', how: '순서를 나눠서 외우면 쉽다', unit: '개' },
  { id: 'count', title: '별 세기', tag: '눈치', desc: '떠다니는 별 가운데 정해진 색의 별이 몇 개인지 세자. 정답에 가장 가까운 조가 1등!', how: '화면을 나눠서 세자', lower: true, hide: true, unit: '개 차이' },
  { id: 'reaction', title: '빛 신호 반응', tag: '반응 속도', desc: '별이 번쩍 빛나는 순간 바로 누르자. 3번 재서 평균이 빠른 조가 1등. 빛나기 전에 누르면 반칙!', how: '모두 손가락을 화면 위에 대고 기다리자', lower: true, unit: 'ms', fmt: (v) => String(Math.round(v)) },
  { id: 'light', title: '10초 빛 여행', tag: '타이밍', desc: '별빛이 출발한다. 정확히 10초가 지났다고 생각될 때 [도착!] 을 누르자. 시계는 처음 3초만 보인다.', how: '다 같이 소리 내어 세어 보자. 10초에 가장 가까운 조가 1등!', lower: true, hide: true, unit: '초 차이', fmt: (v) => v.toFixed(2) },
  { id: 'stack', title: '우주정거장 쌓기', tag: '타이밍', desc: '움직이는 모듈을 눌러 떨어뜨려 높이 쌓자. 어긋난 부분은 잘려 나간다!', how: '누를 사람을 한 명 정하고, 나머지는 신호를 외치자', unit: '층' },
  { id: 'quiz', title: '별 퀴즈 순발력', tag: '퀴즈', desc: '오늘 배운 내용 문제 5개. 맞히면 100점, 빨리 맞힐수록 더 받는다.', how: '조원과 상의해서 빠르게 누르자', unit: '점' },
  { id: 'parallax', l: 1, title: '가까운 별 찾기', tag: '과학 · 1차시', desc: '같은 하늘을 두 곳에서 찍은 사진 A, B 가 번갈아 보인다. 혼자만 자리가 바뀌는 별을 찾아 누르자!', how: '두 사진을 꼼꼼히 비교하자', unit: '개' },
  { id: 'mag', l: 2, title: '밝은 별부터', tag: '과학 · 2차시', desc: '별마다 등급이 적혀 있다. 가장 밝은 별부터 차례로 누르자. 틀리면 처음부터!', how: '조원과 상의해서 빠르게!', unit: '판' },
  { id: 'color', l: 3, title: '뜨거운 별부터', tag: '과학 · 3차시', desc: '별의 색을 보고 표면 온도가 가장 높은 별부터 차례로 누르자. 틀리면 처음부터!', how: '조원과 상의해서 빠르게!', unit: '판' },
];
export const game = (id) => GAMES.find((g) => g.id === id);
export const fmt = (g, v) => (g.fmt ? g.fmt(v) : String(v));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const now = () => performance.now() / 1000;
const TAU = Math.PI * 2;

async function countdown(el) {
  const d = document.createElement('div');
  d.className = 'cd'; el.append(d);
  for (const t of ['3', '2', '1', '시작!']) { d.textContent = t; d.classList.remove('pop'); void d.offsetWidth; d.classList.add('pop'); await sleep(700); }
  d.remove();
}

export async function play(id, el, opt) {
  el.innerHTML = '';
  await countdown(el);
  return PLAY[id](el, opt);
}

// ---------- 공용 도구 ----------
// 화면 가득 canvas + 위쪽 점수판. 좌표는 기기 픽셀(W, H)
function stage(el) {
  const cv = document.createElement('canvas'); cv.className = 'full'; el.append(cv);
  const hud = document.createElement('div'); hud.className = 'mg-hud'; el.append(hud);
  const s = {
    cv, hud, ctx: cv.getContext('2d'), W: 1, H: 1, u: 1,
    fit() { const d = devicePixelRatio; s.W = cv.width = cv.clientWidth * d; s.H = cv.height = cv.clientHeight * d; s.u = Math.min(s.W, s.H); },
    xy(e) { const r = cv.getBoundingClientRect(), d = devicePixelRatio; return [(e.clientX - r.left) * d, (e.clientY - r.top) * d]; },
  };
  s.fit();
  return s;
}
// 매 프레임 f(t, dt). f 가 숫자를 돌려주면 그 숫자(점수)로 끝난다
function run(f) {
  return new Promise((done) => {
    const t0 = now(); let last = t0;
    const fr = () => { const n = now(), r = f(n - t0, Math.min(0.05, n - last)); last = n; if (typeof r === 'number') return done(r); requestAnimationFrame(fr); };
    requestAnimationFrame(fr);
  });
}
const every = (live, gap = 0.5) => { let last = -9; return (s, t) => { if (t - last >= gap) { last = t; live(s); } }; };
function starBg(rand, n = 150) {
  const st = Array.from({ length: n }, () => [rand(), rand(), rand() * 1.4 + 0.3]);
  return (c, W, H, t, scroll = 0) => {
    c.fillStyle = '#05060c'; c.fillRect(0, 0, W, H);
    const d = devicePixelRatio;
    for (const [x, y, z] of st) {
      c.fillStyle = `rgba(255,255,255,${0.35 + 0.3 * Math.sin(t * 2 + x * 50)})`;
      c.fillRect(x * W, ((((y + scroll * z) % 1) + 1) % 1) * H, z * d, z * d);
    }
  };
}
function glow(c, x, y, r, col, core = '#fff') {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, core); g.addColorStop(0.28, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
}
function label(c, s, x, y, size, col = '#fff') {
  c.fillStyle = col; c.font = `${size}px Head, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, x, y);
}
// 서로 겹치지 않는 자리 n개 (0~1 비율, 가로는 화면비 반영)
function spots(rand, n, gap, asp = 1.6, m = 0.1) {
  const out = [];
  for (let k = 0; out.length < n && k < 2000; k++) {
    const p = [m + rand() * (1 - 2 * m), m + 0.04 + rand() * (1 - 2 * m - 0.04)];
    if (out.every((q) => Math.hypot((q[0] - p[0]) * asp, q[1] - p[1]) > gap)) out.push(p);
  }
  return out;
}
const fxText = (fx, x, y, s, col, t) => fx.push({ x, y, s, col, t });
function drawFx(c, fx, t, u) {
  for (const f of fx) {
    const a = t - f.t; if (a > 0.7) continue;
    c.globalAlpha = 1 - a / 0.7; label(c, f.s, f.x, f.y - a * u * 0.12, u * 0.07, f.col); c.globalAlpha = 1;
  }
}

const PLAY = {
  // ---------- 유성 잡기 ----------
  meteor(el, { seed, live }) {
    const DUR = 20, rand = rng(seed), S = stage(el), bg = starBg(rand), L = every(live, 0.6);
    const ms = [];
    for (let t = 0.3; t < DUR - 0.6; t += 0.16 + rand() * 0.14) ms.push({ t, x: 0.07 + rand() * 0.86, v: 0.2 + rand() * 0.16, gold: rand() < 0.08, dx: (rand() - 0.5) * 0.08, hit: false });
    const fx = [];
    let score = 0, T = 0;
    const R = () => S.u * 0.055;
    const pos = (m, t) => [(m.x + m.dx * (t - m.t)) * S.W, ((t - m.t) * m.v - 0.05) * S.H];
    S.cv.addEventListener('pointerdown', (e) => {
      const [px, py] = S.xy(e);
      for (const m of ms) {
        if (m.hit || T < m.t) continue;
        const [x, y] = pos(m, T), rr = R() * (m.gold ? 1.5 : 1.25) * 1.6;
        if ((x - px) ** 2 + (y - py) ** 2 < rr * rr) { m.hit = true; score += m.gold ? 3 : 1; fxText(fx, x, y, m.gold ? '+3' : '+1', m.gold ? '#ffd23f' : '#fff', T); break; }
      }
    });
    return run((t) => {
      T = t; S.fit();
      const c = S.ctx, { W, H } = S;
      bg(c, W, H, t);
      for (const m of ms) {
        if (m.hit || t < m.t) continue;
        const [x, y] = pos(m, t);
        if (y > H + 50) continue;
        const r = R() * (m.gold ? 1.5 : 1), tail = r * 7;
        // 꼬리: 머리 쪽이 굵고 끝으로 갈수록 가늘어지는 삼각형
        const tx = x - m.dx * tail * 3, ty = y - tail, len = Math.hypot(tx - x, ty - y), nx = -(ty - y) / len, ny = (tx - x) / len;
        const g = c.createLinearGradient(x, y, tx, ty);
        g.addColorStop(0, m.gold ? 'rgba(255,214,90,.85)' : 'rgba(190,220,255,.7)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g;
        c.beginPath(); c.moveTo(x + nx * r * 0.7, y + ny * r * 0.7); c.lineTo(tx, ty); c.lineTo(x - nx * r * 0.7, y - ny * r * 0.7); c.fill();
        glow(c, x, y, r * 1.6, m.gold ? '#ffd23f' : '#9fd0ff');
      }
      drawFx(c, fx, t, S.u);
      S.hud.innerHTML = `<b>${score}</b>점 · ${Math.max(0, DUR - t).toFixed(0)}초`;
      L(`${score}점`, t);
      if (t >= DUR) return score;
    });
  },

  // ---------- 로켓 발사 (연타) ----------
  rocket(el, { seed, live }) {
    const DUR = 10, S = stage(el), bg = starBg(rng(seed)), L = every(live);
    let taps = 0, scroll = 0, hits = [];
    S.cv.addEventListener('pointerdown', () => { taps++; hits.push(now()); });
    return run((t, dt) => {
      S.fit();
      const c = S.ctx, { W, H } = S, u = S.u / 100;
      hits = hits.filter((x) => now() - x < 1);
      const rate = hits.length; // 1초 동안 두드린 수
      scroll += dt * (0.03 + rate * 0.025);
      bg(c, W, H, t, scroll);
      const x = W / 2, y = H * 0.72 - Math.min(1, taps / 120) * H * 0.3 + Math.sin(t * 40) * Math.min(rate, 20) * 0.04 * u;
      // 불꽃 (빨리 두드릴수록 길다)
      const fl = (6 + Math.min(rate, 25) * 1.5) * u * (0.85 + Math.random() * 0.3);
      const g = c.createLinearGradient(x, y + 9 * u, x, y + 9 * u + fl);
      g.addColorStop(0, '#fff6c2'); g.addColorStop(0.3, '#ffb000'); g.addColorStop(1, 'rgba(255,60,0,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(x - 3.4 * u, y + 9 * u); c.quadraticCurveTo(x, y + 9 * u + fl * 1.2, x + 3.4 * u, y + 9 * u); c.fill();
      // 몸통 · 코 · 날개 · 창
      c.fillStyle = '#e5484d';
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * 3.8 * u, y + 1 * u); c.lineTo(x + s * 8 * u, y + 10 * u); c.lineTo(x + s * 3.8 * u, y + 8 * u); c.fill(); }
      c.fillStyle = '#f4f1ea'; c.beginPath(); c.roundRect(x - 4 * u, y - 8 * u, 8 * u, 17 * u, 2.5 * u); c.fill();
      c.fillStyle = '#e5484d'; c.beginPath(); c.moveTo(x - 4 * u, y - 6.5 * u); c.quadraticCurveTo(x, y - 19 * u, x + 4 * u, y - 6.5 * u); c.fill();
      c.fillStyle = '#3e63dd'; c.beginPath(); c.arc(x, y - 1.5 * u, 2.3 * u, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(x - 0.7 * u, y - 2.3 * u, 0.8 * u, 0, TAU); c.fill();
      label(c, `${taps * 10} km`, x, H * 0.93, 5 * u, 'rgba(255,255,255,.6)');
      S.hud.innerHTML = `<b>${taps}</b>회 · ${Math.max(0, DUR - t).toFixed(1)}초`;
      L(`${taps}회`, t);
      if (t >= DUR) return taps;
    });
  },

  // ---------- 외계인 잡기 (두더지) ----------
  whack(el, { seed, live }) {
    const DUR = 20, rand = rng(seed), S = stage(el), L = every(live);
    const pops = [];
    for (let t = 0.4; t < DUR - 0.6; t += 0.3 + rand() * 0.3) pops.push({ t, hole: Math.floor(rand() * 9), dur: 0.85 + rand() * 0.5, friend: rand() < 0.22, hit: -1 });
    const fx = [];
    let score = 0, T = 0;
    const hole = (i) => [((i % 3) + 0.5) / 3 * S.W, (Math.floor(i / 3) + 0.66) / 3 * S.H];
    const R = () => Math.min(S.W, S.H) / 3 * 0.3;
    const rise = (p, t) => { const k = (t - p.t) / p.dur; if (k < 0 || k > 1) return 0; return Math.min(1, Math.sin(Math.PI * k) * 1.8); };
    S.cv.addEventListener('pointerdown', (e) => {
      const [px, py] = S.xy(e);
      for (const p of pops) {
        if (p.hit >= 0 || rise(p, T) < 0.35) continue;
        const [x, y] = hole(p.hole), hy = y - rise(p, T) * R() * 0.6;
        if (Math.hypot(px - x, py - hy) < R() * 1.15) {
          p.hit = T; score += p.friend ? -2 : 1;
          fxText(fx, x, hy - R(), p.friend ? '−2' : '+1', p.friend ? '#ff6b6b' : '#7ee081', T); break;
        }
      }
    });
    return run((t) => {
      T = t; S.fit();
      const c = S.ctx, { W, H } = S, r = R();
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#20232e'); g.addColorStop(1, '#3a3d4a');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 9; i++) {
        const [x, y] = hole(i);
        c.fillStyle = '#14151b'; c.beginPath(); c.ellipse(x, y, r * 1.3, r * 0.45, 0, 0, TAU); c.fill();
        const p = pops.find((q) => q.hole === i && t >= q.t && t <= q.t + q.dur && (q.hit < 0 || t - q.hit < 0.25));
        if (p) {
          const k = p.hit >= 0 ? Math.max(0, 1 - (t - p.hit) / 0.25) : 1, hy = y - rise(p, t) * r * 0.6 * k;
          c.save(); c.beginPath(); c.rect(x - r * 1.5, y - r * 3, r * 3, r * 3.05); c.clip(); // 구덩이 아래는 가린다
          if (p.friend) { // 우주비행사: 흰 헬멧 + 금빛 얼굴 가리개
            c.fillStyle = '#f4f1ea'; c.beginPath(); c.arc(x, hy, r * 0.8, 0, TAU); c.fill();
            c.fillStyle = '#d9a441'; c.beginPath(); c.roundRect(x - r * 0.55, hy - r * 0.35, r * 1.1, r * 0.6, r * 0.3); c.fill();
            c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(x - r * 0.25, hy - r * 0.18, r * 0.16, r * 0.08, -0.4, 0, TAU); c.fill();
          } else { // 외계인: 초록 머리 + 큰 눈 + 더듬이
            c.strokeStyle = '#7ee081'; c.lineWidth = r * 0.08;
            for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * r * 0.3, hy - r * 0.6); c.lineTo(x + s * r * 0.5, hy - r * 1.05); c.stroke(); glow(c, x + s * r * 0.5, hy - r * 1.05, r * 0.2, '#ff6bd6'); }
            c.fillStyle = '#7ee081'; c.beginPath(); c.ellipse(x, hy, r * 0.75, r * 0.85, 0, 0, TAU); c.fill();
            for (const s of [-1, 1]) {
              c.fillStyle = '#1a1418'; c.beginPath(); c.ellipse(x + s * r * 0.3, hy - r * 0.05, r * 0.2, r * 0.28, 0, 0, TAU); c.fill();
              c.fillStyle = '#fff'; c.beginPath(); c.arc(x + s * r * 0.3 - r * 0.06, hy - r * 0.15, r * 0.07, 0, TAU); c.fill();
            }
          }
          c.restore();
        }
        c.strokeStyle = '#5b5e6b'; c.lineWidth = r * 0.14; c.beginPath(); c.ellipse(x, y, r * 1.3, r * 0.45, 0, 0, Math.PI); c.stroke();
      }
      drawFx(c, fx, t, S.u);
      S.hud.innerHTML = `<b>${score}</b>점 · ${Math.max(0, DUR - t).toFixed(0)}초`;
      L(`${score}점`, t);
      if (t >= DUR) return score;
    });
  },

  // ---------- 우주 트위스터 (여럿이 동시에 누르고 있기) ----------
  twister(el, { seed, live }) {
    const DUR = 30, HOLD = 0.7, rand = rng(seed), S = stage(el), bg = starBg(rand), L = every(live);
    const touch = new Map();
    const put = (e) => touch.set(e.pointerId, S.xy(e));
    S.cv.addEventListener('pointerdown', put);
    S.cv.addEventListener('pointermove', (e) => touch.has(e.pointerId) && put(e));
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) S.cv.addEventListener(ev, (e) => touch.delete(e.pointerId));
    let level = 0, targets, hold = 0, score = 0, flash = -9;
    const next = () => { targets = spots(rand, Math.min(6, 2 + Math.floor(level / 2)), 0.26, 1.6, 0.13); };
    next();
    return run((t, dt) => {
      S.fit();
      const c = S.ctx, { W, H } = S, r = S.u * 0.085;
      bg(c, W, H, t);
      const on = targets.map(([x, y]) => [...touch.values()].some(([px, py]) => Math.hypot(px - x * W, py - y * H) < r * 1.2));
      hold = on.every(Boolean) ? hold + dt : Math.max(0, hold - dt * 2);
      if (hold >= HOLD) { score++; level++; hold = 0; flash = t; next(); }
      targets.forEach(([x, y], i) => {
        const px = x * W, py = y * H, pulse = 1 + Math.sin(t * 5 + i) * 0.05;
        glow(c, px, py, r * 1.9 * pulse, on[i] ? 'rgba(242,163,58,.8)' : 'rgba(120,170,255,.6)', on[i] ? '#fff2d8' : '#dfe9ff');
        c.lineWidth = r * 0.12; c.strokeStyle = on[i] ? '#f2a33a' : 'rgba(255,255,255,.7)';
        c.beginPath(); c.arc(px, py, r, 0, TAU); c.stroke();
        if (hold > 0) { c.strokeStyle = '#fff'; c.beginPath(); c.arc(px, py, r * 1.25, -Math.PI / 2, -Math.PI / 2 + TAU * (hold / HOLD)); c.stroke(); }
      });
      if (t - flash < 0.5) { c.fillStyle = `rgba(242,163,58,${0.35 * (1 - (t - flash) / 0.5)})`; c.fillRect(0, 0, W, H); }
      label(c, `손가락 ${targets.length}개!`, W / 2, H * 0.94, S.u * 0.05, 'rgba(255,255,255,.7)');
      S.hud.innerHTML = `<b>${score}</b>단계 · ${Math.max(0, DUR - t).toFixed(0)}초`;
      L(`${score}단계`, t);
      if (t >= DUR) return score;
    });
  },

  // ---------- 별가루 모으기 (기울이기) ----------
  tilt(el, { seed, live }) {
    const DUR = 25, rand = rng(seed), S = stage(el), bg = starBg(rand), L = every(live);
    let ax = 0, ay = 0, base = null, mode = 'touch', finger = null;
    // 화면이 돌아가 있으면(가로) 기울기 축도 같이 돌린다
    const rot = (g, b) => { const a = screen.orientation?.angle ?? window.orientation ?? 0; return a === 90 ? [b, -g] : a === 270 || a === -90 ? [-b, g] : a === 180 ? [-g, -b] : [g, b]; };
    const ori = (e) => {
      if (e.beta == null) return;
      mode = 'tilt';
      const [x, y] = rot(e.gamma, e.beta);
      if (!base) base = [x, y]; // 처음 잡은 자세를 0 으로
      ax = x - base[0]; ay = y - base[1];
    };
    addEventListener('deviceorientation', ori);
    S.cv.addEventListener('pointerdown', (e) => { finger = S.xy(e); });
    S.cv.addEventListener('pointermove', (e) => { if (finger) finger = S.xy(e); });
    for (const ev of ['pointerup', 'pointercancel']) S.cv.addEventListener(ev, () => { finger = null; });
    const dust = Array.from({ length: 80 }, () => [0.08 + rand() * 0.84, 0.1 + rand() * 0.82]);
    let di = 5, live5 = dust.slice(0, 5);
    const holes = Array.from({ length: 3 }, (_, i) => ({ c: [0.2 + i * 0.3 + (rand() - 0.5) * 0.1, 0.3 + rand() * 0.4], r: 0.08 + rand() * 0.1, w: (rand() < 0.5 ? -1 : 1) * (0.4 + rand() * 0.4), ph: rand() * TAU }));
    let bx = null, by = 0, vx = 0, vy = 0, score = 0, hurt = -9;
    const fx = [];
    return run((t, dt) => {
      S.fit();
      const c = S.ctx, { W, H, u } = S, br = u * 0.045;
      if (bx == null) { bx = W / 2; by = H / 2; }
      let fx_ = 0, fy_ = 0;
      if (mode === 'tilt') { fx_ = Math.max(-1, Math.min(1, ax / 25)); fy_ = Math.max(-1, Math.min(1, ay / 25)); }
      else if (finger) { const dx = finger[0] - bx, dy = finger[1] - by, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / (u * 0.25)); fx_ = (dx / d) * k; fy_ = (dy / d) * k; }
      vx += fx_ * u * 2.4 * dt; vy += fy_ * u * 2.4 * dt;
      vx *= 1 - dt * 0.9; vy *= 1 - dt * 0.9;
      bx += vx * dt; by += vy * dt;
      if (bx < br) { bx = br; vx = -vx * 0.5; } if (bx > W - br) { bx = W - br; vx = -vx * 0.5; }
      if (by < br) { by = br; vy = -vy * 0.5; } if (by > H - br) { by = H - br; vy = -vy * 0.5; }
      bg(c, W, H, t);
      // 블랙홀
      for (const h of holes) {
        const hx = (h.c[0] + Math.cos(t * h.w + h.ph) * h.r) * W, hy = (h.c[1] + Math.sin(t * h.w + h.ph) * h.r) * H, hr = u * 0.07;
        const g = c.createRadialGradient(hx, hy, hr * 0.4, hx, hy, hr * 1.6);
        g.addColorStop(0, '#000'); g.addColorStop(0.45, '#000'); g.addColorStop(0.6, 'rgba(255,150,40,.9)'); g.addColorStop(1, 'rgba(255,90,0,0)');
        c.fillStyle = g; c.beginPath(); c.arc(hx, hy, hr * 1.6, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(255,200,120,.6)'; c.lineWidth = u * 0.006;
        for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(hx, hy, hr * (0.75 + k * 0.18), t * 3 + k * 2, t * 3 + k * 2 + 1.6); c.stroke(); }
        if (t - hurt > 1 && Math.hypot(bx - hx, by - hy) < hr * 0.7 + br * 0.5) {
          score = Math.max(0, score - 2); hurt = t; fxText(fx, hx, hy - hr, '−2', '#ff6b6b', t);
          bx = W / 2; by = H / 2; vx = vy = 0;
        }
      }
      // 별가루
      live5 = live5.filter(([x, y]) => {
        const px = x * W, py = y * H;
        if (Math.hypot(px - bx, py - by) < br + u * 0.03) { score++; fxText(fx, px, py, '+1', '#ffd23f', t); return false; }
        glow(c, px, py, u * (0.03 + Math.sin(t * 6 + x * 9) * 0.005), '#ffd23f');
        return true;
      });
      while (live5.length < 5) live5.push(dust[di++ % dust.length]);
      // 행성(공)
      const pg = c.createRadialGradient(bx - br * 0.4, by - br * 0.4, br * 0.1, bx, by, br);
      pg.addColorStop(0, '#bfe3ff'); pg.addColorStop(0.5, '#3e8ef7'); pg.addColorStop(1, '#16306e');
      c.globalAlpha = t - hurt < 1 ? 0.4 + 0.6 * Math.abs(Math.sin(t * 20)) : 1;
      c.fillStyle = pg; c.beginPath(); c.arc(bx, by, br, 0, TAU); c.fill(); c.globalAlpha = 1;
      drawFx(c, fx, t, u);
      label(c, mode === 'tilt' ? '디벗을 기울이자' : '화면을 눌러 행성을 끌어당기자', W / 2, H * 0.95, u * 0.035, 'rgba(255,255,255,.55)');
      S.hud.innerHTML = `<b>${score}</b>개 · ${Math.max(0, DUR - t).toFixed(0)}초`;
      L(`${score}개`, t);
      if (t >= DUR) { removeEventListener('deviceorientation', ori); return score; }
    });
  },

  // ---------- 별자리 기억 ----------
  memory(el, { seed, live }) {
    const DUR = 50, ON = 0.5, GAP = 0.2, rand = rng(seed), S = stage(el), bg = starBg(rand);
    const pts = Array.from({ length: 9 }, (_, i) => [((i % 3) + 0.5 + (rand() - 0.5) * 0.5) / 3, (Math.floor(i / 3) + 0.5 + (rand() - 0.5) * 0.4) / 3]);
    const seq = [Math.floor(rand() * 9)];
    while (seq.length < 30) { const k = Math.floor(rand() * 9); if (k !== seq[seq.length - 1]) seq.push(k); }
    let len = 3, best = 0, lives = 2, mode = 'show', m0 = 0, idx = 0, lit = -1, litT = -9, T = 0, bad = -9;
    S.cv.addEventListener('pointerdown', (e) => {
      if (mode !== 'input') return;
      const [px, py] = S.xy(e);
      const k = pts.findIndex(([x, y]) => Math.hypot(px - x * S.W, py - y * S.H) < S.u * 0.11);
      if (k < 0) return;
      lit = k; litT = T;
      if (k === seq[idx]) {
        idx++;
        if (idx === len) { best = len; len++; mode = 'ok'; m0 = T; live(`${best}개`); }
      } else {
        lives--; bad = T; mode = lives > 0 ? 'retry' : 'end'; m0 = T;
      }
    });
    return run((t) => {
      T = t; S.fit();
      const c = S.ctx, { W, H, u } = S;
      bg(c, W, H, t);
      let on = -1, msg = '';
      if (mode === 'show') {
        const k = Math.floor((t - m0) / (ON + GAP));
        if (k >= len) { mode = 'input'; idx = 0; } else if ((t - m0) % (ON + GAP) < ON) on = seq[k];
        msg = '잘 보자…';
      }
      if (mode === 'input') msg = `따라 누르자!  ${idx} / ${len}`;
      if (mode === 'ok') { msg = '성공! 하나 더 길어진다'; if (t - m0 > 0.9) { mode = 'show'; m0 = t; } }
      if (mode === 'retry') { msg = `틀렸다! 다시 보여 줄게 (남은 기회 ${lives})`; if (t - m0 > 1.2) { mode = 'show'; m0 = t; } }
      if (mode === 'end' && t - m0 > 1.2) return best;
      if (t >= DUR) return best;
      if (t - litT < 0.3) on = on < 0 ? lit : on;
      // 맞힌 데까지 선으로 이어 별자리를 그린다
      const done = mode === 'input' ? idx : mode === 'ok' ? len - 1 : 0;
      c.strokeStyle = 'rgba(242,163,58,.7)'; c.lineWidth = u * 0.008; c.beginPath();
      for (let i = 0; i < done; i++) { const [x, y] = pts[seq[i]]; i ? c.lineTo(x * W, y * H) : c.moveTo(x * W, y * H); }
      c.stroke();
      pts.forEach(([x, y], i) => glow(c, x * W, y * H, u * (i === on ? 0.12 : 0.045), i === on ? '#ffd23f' : '#9fc4ff'));
      if (t - bad < 0.4) { c.fillStyle = 'rgba(229,72,77,.3)'; c.fillRect(0, 0, W, H); }
      label(c, msg, W / 2, H * 0.94, u * 0.045, 'rgba(255,255,255,.8)');
      S.hud.innerHTML = `<b>${best}</b>개 · ${Math.max(0, DUR - t).toFixed(0)}초`;
    });
  },

  // ---------- 별 세기 ----------
  async count(el, { seed, live }) {
    const rand = rng(seed), COLS = [['빨간', '#ff6b5a'], ['파란', '#7fa6ff'], ['노란', '#ffd84a'], ['하얀', '#ffffff']];
    const tk = Math.floor(rand() * COLS.length), items = [];
    COLS.forEach((col, k) => {
      const n = k === tk ? 9 + Math.floor(rand() * 8) : 6 + Math.floor(rand() * 8);
      for (let i = 0; i < n; i++) items.push({ k, x: rand(), y: rand(), vx: (rand() - 0.5) * 0.14, vy: (rand() - 0.5) * 0.14 });
    });
    const truth = items.filter((i) => i.k === tk).length, [cname, ccol] = COLS[tk];
    const S = stage(el), bg = starBg(rand, 60);
    live('세는 중…');
    await run((t) => {
      S.fit();
      const c = S.ctx, { W, H, u } = S;
      bg(c, W, H, t);
      if (t < 2) { label(c, `${cname} 별을 세자!`, W / 2, H / 2, u * 0.1, ccol); return; }
      for (const it of items) {
        const x = ((((it.x + it.vx * t) % 1) + 1) % 1) * W, y = ((((it.y + it.vy * t) % 1) + 1) % 1) * H;
        glow(c, x, y, u * 0.04, COLS[it.k][1]);
      }
      S.hud.innerHTML = `${cname} 별 · <b>${Math.max(0, 8 - t).toFixed(0)}</b>초`;
      if (t >= 8) return 0;
    });
    el.innerHTML = `<div class="cnt"><p class="cnt-q"><span style="color:${ccol}">${cname} 별</span>은 몇 개였을까?</p>
      <div class="cnt-row"><button data-d="-1">−</button><b class="cnt-v">0</b><button data-d="1">+</button></div>
      <div class="cnt-row sm"><button data-d="-5">−5</button><button data-d="5">+5</button></div>
      <button class="btn cnt-go">제출</button><p class="cnt-t"></p></div>`;
    let v = 0;
    const vEl = el.querySelector('.cnt-v'), tEl = el.querySelector('.cnt-t');
    el.querySelectorAll('[data-d]').forEach((b) => b.addEventListener('click', () => { v = Math.max(0, v + +b.dataset.d); vEl.textContent = v; }));
    await new Promise((res) => {
      const t0 = now();
      el.querySelector('.cnt-go').addEventListener('click', res, { once: true });
      const tick = () => { const left = 15 - (now() - t0); tEl.textContent = `${Math.max(0, left).toFixed(0)}초 남음`; if (left <= 0) return res(); if (el.isConnected) setTimeout(tick, 200); };
      tick();
    });
    el.querySelector('.cnt').innerHTML = `<p class="cnt-q">정답은 <b>${truth}</b>개 · 우리 답 <b>${v}</b>개</p>`;
    live('제출!');
    return Math.abs(v - truth);
  },

  // ---------- 빛 신호 반응 ----------
  async reaction(el, { seed, live }) {
    const rand = rng(seed), times = [];
    el.insertAdjacentHTML('beforeend', '<div class="rx"><div class="rx-msg"></div><div class="rx-rec"></div></div>');
    const box = el.querySelector('.rx'), msg = el.querySelector('.rx-msg'), rec = el.querySelector('.rx-rec');
    for (let i = 0; i < 3; i++) {
      box.className = 'rx'; msg.textContent = `${i + 1}번째 · 기다려…`;
      const delay = 1.5 + rand() * 2.5;
      const v = await new Promise((resolve) => {
        let goT = 0, over = false;
        const finish = (x) => { if (over) return; over = true; clearTimeout(a); clearTimeout(b); box.removeEventListener('pointerdown', on); resolve(x); };
        const on = (e) => finish(goT ? Math.max(0, e.timeStamp - goT) : -1);
        const a = setTimeout(() => { goT = performance.now(); box.className = 'rx go'; msg.textContent = '지금!'; }, delay * 1000);
        const b = setTimeout(() => finish(1000), delay * 1000 + 3000);
        box.addEventListener('pointerdown', on);
      });
      if (v < 0) { box.className = 'rx foul'; msg.textContent = '반칙! +1000 ms'; times.push(1000); }
      else { box.className = 'rx'; msg.textContent = `${Math.round(v)} ms`; times.push(v); }
      rec.textContent = times.map((x) => Math.round(x)).join(' · ');
      live(`${i + 1}/3`);
      await sleep(1300);
    }
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    msg.textContent = `평균 ${avg} ms`; box.className = 'rx';
    return avg;
  },

  // ---------- 10초 빛 여행 ----------
  light(el, { live }) {
    el.insertAdjacentHTML('beforeend', `<div class="lt"><div class="lt-clock">0.00</div><div class="lt-msg">처음 3초만 보인다</div>
      <button class="big-btn">도착!</button></div>`);
    const clock = el.querySelector('.lt-clock'), msg = el.querySelector('.lt-msg'), btn = el.querySelector('.big-btn');
    const t0 = now();
    return new Promise((done) => {
      let over = false;
      const end = (t) => {
        if (over) return; over = true;
        const diff = Math.round(Math.abs(t - 10) * 100) / 100;
        btn.disabled = true; clock.textContent = t.toFixed(2); clock.classList.remove('hide');
        msg.textContent = `10초와 ${diff.toFixed(2)}초 차이!`;
        live('도착!');
        done(diff);
      };
      btn.addEventListener('pointerdown', () => end(now() - t0));
      const tick = () => {
        if (over) return;
        const t = now() - t0;
        if (t < 3) clock.textContent = t.toFixed(2);
        else if (!clock.classList.contains('hide')) { clock.classList.add('hide'); clock.textContent = '?.??'; msg.textContent = '이제 마음속으로 세자…'; }
        if (t > 20) return end(20);
        requestAnimationFrame(tick);
      };
      tick();
    });
  },

  // ---------- 우주정거장 쌓기 ----------
  stack(el, { live }) {
    const DUR = 45, S = stage(el), bg = starBg(rng(7), 90);
    const blocks = [{ x: 0.5, w: 0.42 }], falling = [];
    let cur = { w: 0.42, ph: -Math.PI / 2 }, speed = 1.7, over = -1, last = -9, T = 0, cam = 0, perfect = -9;
    S.cv.addEventListener('pointerdown', () => {
      if (over >= 0 || T - last < 0.25) return; // 여러 손가락이 한꺼번에 눌러도 한 번만
      last = T;
      const cx = 0.5 + 0.36 * Math.sin(cur.ph), top = blocks[blocks.length - 1], lv = blocks.length;
      let a = Math.max(cx - cur.w / 2, top.x - top.w / 2), b = Math.min(cx + cur.w / 2, top.x + top.w / 2);
      if (b - a <= 0.004) { over = T; falling.push({ x: cx, w: cur.w, y: lv, vy: 0 }); return; }
      if (Math.abs(cx - top.x) < 0.012) { a = top.x - top.w / 2; b = top.x + top.w / 2; perfect = T; } // 딱 맞으면 안 잘림
      else {
        if (cx - cur.w / 2 < a) falling.push({ x: (cx - cur.w / 2 + a) / 2, w: a - (cx - cur.w / 2), y: lv, vy: 0 });
        if (cx + cur.w / 2 > b) falling.push({ x: (b + cx + cur.w / 2) / 2, w: cx + cur.w / 2 - b, y: lv, vy: 0 });
      }
      blocks.push({ x: (a + b) / 2, w: b - a });
      cur = { w: b - a, ph: -Math.PI / 2 };
      speed += 0.12;
      live(`${blocks.length - 1}층`);
    });
    const HUES = ['#c9ced8', '#f2a33a', '#9fb6d9', '#e8e2d4', '#7fa6ff'];
    const module = (c, x, y, w, h, i) => {
      c.fillStyle = HUES[i % HUES.length]; c.beginPath(); c.roundRect(x - w / 2, y - h, w, h * 0.92, h * 0.18); c.fill();
      c.fillStyle = 'rgba(20,24,34,.55)';
      for (let k = -2; k <= 2; k++) if (Math.abs(k) * h * 0.55 < w / 2 - h * 0.3) { c.beginPath(); c.arc(x + k * h * 0.55, y - h * 0.48, h * 0.16, 0, TAU); c.fill(); }
    };
    return run((t, dt) => {
      T = t; S.fit();
      const c = S.ctx, { W, H, u } = S, bh = H / 15;
      cam += (Math.max(0, blocks.length - 8) * bh - cam) * (1 - Math.exp(-dt * 4));
      bg(c, W, H, t, cam / H * 0.3);
      const base = H * 0.92 + cam, Y = (lv) => base - lv * bh;
      blocks.forEach((b, i) => module(c, b.x * W, Y(i), b.w * W, bh, i));
      if (over < 0) { cur.ph += dt * speed; module(c, (0.5 + 0.36 * Math.sin(cur.ph)) * W, Y(blocks.length), cur.w * W, bh, blocks.length); }
      for (const f of falling) { f.vy += dt * 9; f.y -= f.vy * dt; c.globalAlpha = 0.7; module(c, f.x * W, Y(f.y), f.w * W, bh, 1); c.globalAlpha = 1; }
      if (t - perfect < 0.6) label(c, '딱 맞았다!', W / 2, H * 0.2, u * 0.07, '#ffd23f');
      S.hud.innerHTML = `<b>${blocks.length - 1}</b>층 · ${Math.max(0, DUR - t).toFixed(0)}초`;
      if ((over >= 0 && t - over > 1.2) || t >= DUR) return blocks.length - 1;
    });
  },

  // ---------- 별 퀴즈 순발력 ----------
  async quiz(el, { seed, questions, live }) {
    const qs = pick(questions, 5, rng(seed));
    let score = 0;
    for (let i = 0; i < qs.length; i++) {
      const q = qs[i], LIM = 10, t0 = now();
      el.innerHTML = `<div class="qz"><div class="qz-top">${i + 1} / ${qs.length} · <b>${score}</b>점</div><div class="qz-bar"><i></i></div>
        <div class="qz-q">${esc(q.q)}</div><div class="qz-c">${q.c.map((c, k) => `<button data-k="${k}">${esc(c)}</button>`).join('')}</div></div>`;
      live(`${i + 1}/${qs.length} · ${score}점`);
      const bar = el.querySelector('.qz-bar i');
      const k = await new Promise((res) => {
        el.querySelectorAll('.qz-c button').forEach((b) => b.addEventListener('pointerdown', () => res(+b.dataset.k), { once: true }));
        const tick = () => { const left = LIM - (now() - t0); bar.style.width = `${Math.max(0, left / LIM) * 100}%`; if (left <= 0) return res(-1); if (el.isConnected) requestAnimationFrame(tick); };
        tick();
      });
      const left = Math.max(0, LIM - (now() - t0));
      if (k === q.a) score += 100 + Math.round(left * 10);
      el.querySelectorAll('.qz-c button').forEach((b) => { b.disabled = true; if (+b.dataset.k === q.a) b.classList.add('ok'); else if (+b.dataset.k === k) b.classList.add('no'); });
      await sleep(1100);
    }
    el.innerHTML = `<div class="qz"><div class="qz-q">끝! <b>${score}</b>점</div></div>`;
    return score;
  },

  // ---------- 가까운 별 찾기 (연주 시차) ----------
  parallax(el, { seed, live }) {
    const DUR = 30, BLINK = 0.6, rand = rng(seed), S = stage(el), L = every(live);
    let field, found = 0, T = 0, okT = -9, bad = -9;
    const fx = [];
    const next = () => {
      const stars = Array.from({ length: 70 }, () => ({ x: 0.05 + rand() * 0.9, y: 0.08 + rand() * 0.86, b: 0.3 + rand() * 0.7 }));
      const a = rand() * TAU;
      field = { stars, k: Math.floor(rand() * stars.length), dx: Math.cos(a) * 0.035, dy: Math.sin(a) * 0.05, t0: T };
    };
    next();
    const near = (view) => { const s = field.stars[field.k]; return view ? [s.x + field.dx, s.y + field.dy] : [s.x, s.y]; };
    S.cv.addEventListener('pointerdown', (e) => {
      if (T - okT < 0.8 || T - bad < 0.7) return;
      const [px, py] = S.xy(e), { W, H, u } = S;
      const hit = [0, 1].some((v) => { const [x, y] = near(v); return Math.hypot(px - x * W, py - y * H) < u * 0.08; });
      if (hit) { found++; okT = T; fxText(fx, px, py - u * 0.05, '찾았다!', '#ffd23f', T); }
      else bad = T;
    });
    return run((t) => {
      T = t; S.fit();
      const c = S.ctx, { W, H, u } = S;
      if (okT > 0 && t - okT >= 0.8 && field.t0 < okT) next();
      c.fillStyle = '#04050a'; c.fillRect(0, 0, W, H);
      const view = Math.floor((t - field.t0) / BLINK) % 2;
      field.stars.forEach((s, i) => {
        const [x, y] = i === field.k ? near(view) : [s.x, s.y];
        glow(c, x * W, y * H, u * 0.022 * (0.6 + s.b), 'rgba(220,230,255,.9)');
      });
      if (t - okT < 0.8) { const [x, y] = near(view); c.strokeStyle = '#ffd23f'; c.lineWidth = u * 0.008; c.beginPath(); c.arc(x * W, y * H, u * 0.06, 0, TAU); c.stroke(); }
      if (t - bad < 0.4) { c.fillStyle = 'rgba(229,72,77,.28)'; c.fillRect(0, 0, W, H); label(c, '땡!', W / 2, H / 2, u * 0.12, '#ff6b6b'); }
      label(c, view ? 'B' : 'A', u * 0.08, H - u * 0.08, u * 0.08, '#f2a33a');
      drawFx(c, fx, t, u);
      S.hud.innerHTML = `<b>${found}</b>개 · ${Math.max(0, DUR - t).toFixed(0)}초`;
      L(`${found}개`, t);
      if (t >= DUR) return found;
    });
  },

  // ---------- 밝은 별부터 (등급) ----------
  mag(el, opt) {
    const MAGS = [-1.5, -0.7, 0, 0.6, 1.3, 2, 2.8, 3.5, 4.3, 5.1, 5.8];
    return orderGame(el, opt, (rand) => {
      const ms = pick(MAGS, 5, rand).sort((a, b) => a - b);
      return spots(rand, 5, 0.3, 1.6, 0.14).map((p, i) => ({ x: p[0], y: p[1], rank: i, m: ms[i] }));
    }, (c, it, x, y, u, solved) => {
      // 풀고 나면 실제 밝기(등급이 1 작으면 약 2.5배 밝다)대로 크기를 바꿔 보여 준다
      const r = solved ? u * 0.03 * Math.pow(2.512, (2 - it.m) / 2.5) : u * 0.05;
      glow(c, x, y, r, 'rgba(225,235,255,.9)');
      label(c, `${it.m.toFixed(1).replace('-', '−')} 등급`, x, y + u * 0.09, u * 0.045, '#fff');
    });
  },

  // ---------- 뜨거운 별부터 (색과 표면 온도) ----------
  color(el, opt) {
    const CLS = [['청색', '#8fb0ff'], ['청백색', '#c4d4ff'], ['백색', '#ffffff'], ['황색', '#ffd77a'], ['주황색', '#ffa95c'], ['적색', '#ff6a4d']];
    return orderGame(el, opt, (rand) => {
      const ks = pick([0, 1, 2, 3, 4, 5], 5, rand).sort((a, b) => a - b);
      return spots(rand, 5, 0.3, 1.6, 0.14).map((p, i) => ({ x: p[0], y: p[1], rank: i, k: ks[i] }));
    }, (c, it, x, y, u, solved) => {
      glow(c, x, y, u * 0.075, CLS[it.k][1], CLS[it.k][1]);
      if (it.done || solved) label(c, CLS[it.k][0], x, y + u * 0.1, u * 0.04, '#fff');
    });
  },
};

// 차례대로 누르기 게임 틀 — rank 0 부터 순서대로. 틀리면 그 판을 처음부터
function orderGame(el, { seed, live }, make, draw) {
  const DUR = 30, rand = rng(seed), S = stage(el), bg = starBg(rand, 80), L = every(live);
  let items = make(rand), next = 0, rounds = 0, okT = -9, bad = -9, T = 0;
  S.cv.addEventListener('pointerdown', (e) => {
    if (next === items.length) return;
    const [px, py] = S.xy(e);
    const it = items.find((i) => !i.done && Math.hypot(px - i.x * S.W, py - i.y * S.H) < S.u * 0.09);
    if (!it) return;
    if (it.rank === next) { it.done = true; next++; if (next === items.length) { rounds++; okT = T; } }
    else { bad = T; next = 0; items.forEach((i) => { i.done = false; }); }
  });
  return run((t) => {
    T = t; S.fit();
    const c = S.ctx, { W, H, u } = S;
    if (next === items.length && t - okT >= 1.1) { items = make(rand); next = 0; }
    bg(c, W, H, t);
    const solved = next === items.length;
    for (const it of items) {
      const x = it.x * W, y = it.y * H;
      draw(c, it, x, y, u, solved);
      if (it.done) { c.fillStyle = '#f2a33a'; c.beginPath(); c.arc(x + u * 0.06, y - u * 0.06, u * 0.03, 0, TAU); c.fill(); label(c, String(it.rank + 1), x + u * 0.06, y - u * 0.058, u * 0.035, '#140c02'); }
    }
    if (t - bad < 0.4) { c.fillStyle = 'rgba(229,72,77,.28)'; c.fillRect(0, 0, W, H); label(c, '땡! 처음부터', W / 2, H / 2, u * 0.09, '#ff6b6b'); }
    if (solved) {
      c.fillStyle = 'rgba(6,6,7,.8)'; c.beginPath(); c.roundRect(W / 2 - u * 0.17, H / 2 - u * 0.07, u * 0.34, u * 0.14, u * 0.07); c.fill();
      label(c, '성공!', W / 2, H / 2, u * 0.08, '#ffd23f');
    }
    S.hud.innerHTML = `<b>${rounds}</b>판 · ${Math.max(0, DUR - t).toFixed(0)}초`;
    L(`${rounds}판`, t);
    if (t >= DUR) return rounds;
  });
}
