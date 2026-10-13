// 귀여운 말(캐릭터) 10종 — three.js 기본 도형으로 만든다. 발밑 받침 = 조 색.
import * as THREE from 'three';

export const CHARS = [
  { id: 'rabbit', name: '달토끼' },
  { id: 'alien', name: '꼬마 외계인' },
  { id: 'robot', name: '로봇 삐삐' },
  { id: 'star', name: '별똥이' },
  { id: 'octo', name: '우주 문어' },
  { id: 'penguin', name: '펭귄 대장' },
  { id: 'cat', name: '냥이' },
  { id: 'bear', name: '곰돌이' },
  { id: 'chick', name: '병아리' },
  { id: 'planet', name: '토성이' },
];

const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.45, ...o });
const BLACK = M('#1a1418', { roughness: 0.25 });
const WHITE = M('#ffffff', { roughness: 0.2 });
const BLUSH = M('#ff8fa3', { transparent: true, opacity: 0.55, roughness: 0.8 });

function add(parent, geo, mat, x = 0, y = 0, z = 0, sx = 1, sy = sx, sz = sx) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.castShadow = true;
  parent.add(m); return m;
}
const S = (r) => new THREE.SphereGeometry(r, 32, 20);

// 구 표면(중심 c, 반지름 R)의 (dx, dy) 방향에 붙이고 바깥을 보게 한다
function onSurf(parent, obj, c, R, dx, dy) {
  const d = new THREE.Vector3(dx, dy, Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy)));
  obj.position.copy(c).addScaledVector(d, R * 0.97);
  parent.add(obj);
  obj.lookAt(c.clone().addScaledVector(d, R * 3).add(parent.getWorldPosition(new THREE.Vector3())));
  return obj;
}
// 큰 까만 눈 + 하이라이트 · 볼 터치 · 웃는 입
function face(g, c, R, { eye = 0.13, gap = 0.34, dy = 0.08, mouth = true, blush = true } = {}) {
  for (const s of [-1, 1]) {
    const e = new THREE.Group();
    add(e, S(1), BLACK, 0, 0, 0, eye * 0.8, eye, eye * 0.45);
    add(e, S(1), WHITE, -eye * 0.28, eye * 0.38, eye * 0.38, eye * 0.28);
    onSurf(g, e, c, R, s * gap, dy);
    if (blush) onSurf(g, add(new THREE.Group(), S(1), BLUSH, 0, 0, 0, eye * 0.85, eye * 0.5, eye * 0.2).parent, c, R, s * (gap + 0.17), dy - 0.22);
  }
  if (mouth) {
    const m = new THREE.Group();
    add(m, new THREE.TorusGeometry(eye * 0.42, eye * 0.11, 8, 16, Math.PI), BLACK).rotation.z = Math.PI;
    onSurf(g, m, c, R, 0, dy - 0.2);
  }
}
const feet = (g, mat, w = 0.2, y = 0.07) => { for (const s of [-1, 1]) add(g, S(0.12), mat, s * w, y, 0.08, 1, 0.6, 1.3); };

const BUILD = {
  rabbit(g) {
    const body = M('#f7f3f0'), pink = M('#ffb3c4');
    const c = new THREE.Vector3(0, 0.5, 0);
    add(g, S(0.45), body, 0, 0.5, 0, 1, 0.95, 1);
    for (const s of [-1, 1]) {
      const ear = add(g, new THREE.CapsuleGeometry(0.1, 0.42, 8, 16), body, s * 0.17, 1.1, -0.02);
      ear.rotation.z = -s * 0.22;
      add(ear, S(1), pink, 0, 0.02, 0.07, 0.055, 0.28, 0.03);
    }
    add(g, S(0.07), pink, 0, 0.47, 0.44);
    face(g, c, 0.45, { dy: 0.12, mouth: false });
    add(g, S(0.11), body, 0, 0.35, -0.43);
    feet(g, body);
  },
  alien(g) {
    const skin = M('#7ee081');
    const c = new THREE.Vector3(0, 0.55, 0);
    add(g, S(0.45), skin, 0, 0.55, 0, 1, 1.12, 1);
    for (const s of [-1, 1]) {
      const st = add(g, new THREE.CylinderGeometry(0.02, 0.025, 0.32), skin, s * 0.16, 1.15, 0);
      st.rotation.z = -s * 0.35;
      add(g, S(0.07), M('#ff6bd6', { emissive: '#ff2fb8', emissiveIntensity: 0.6 }), s * 0.22, 1.3, 0);
    }
    face(g, c, 0.47, { eye: 0.16, gap: 0.3, dy: 0.15 });
    for (const s of [-1, 1]) add(g, new THREE.CapsuleGeometry(0.06, 0.18), skin, s * 0.44, 0.5, 0).rotation.z = s * 0.7;
    feet(g, skin);
  },
  robot(g) {
    const metal = M('#b9c6d6', { metalness: 0.55, roughness: 0.3 }), dark = M('#1f2a38', { roughness: 0.2 });
    const glow = M('#5ff2ff', { emissive: '#28e0ff', emissiveIntensity: 1 });
    add(g, new THREE.CylinderGeometry(0.3, 0.34, 0.42, 24), metal, 0, 0.3, 0);
    const head = add(g, new THREE.BoxGeometry(0.72, 0.52, 0.56), metal, 0, 0.8, 0);
    add(head, new THREE.BoxGeometry(0.58, 0.36, 0.02), dark, 0, 0, 0.29);
    for (const s of [-1, 1]) {
      add(head, new THREE.CapsuleGeometry(0.05, 0.05, 6, 12), glow, s * 0.14, 0.04, 0.31);
      add(head, new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16), dark, s * 0.38, 0, 0).rotation.z = Math.PI / 2;
      add(g, new THREE.CapsuleGeometry(0.06, 0.2), metal, s * 0.4, 0.33, 0).rotation.z = s * 0.3;
    }
    add(head, new THREE.TorusGeometry(0.07, 0.018, 8, 16, Math.PI), glow, 0, -0.08, 0.31).rotation.z = Math.PI;
    add(g, new THREE.CylinderGeometry(0.015, 0.015, 0.22), dark, 0, 1.16, 0);
    add(g, S(0.06), M('#ff5a5a', { emissive: '#ff2020', emissiveIntensity: 0.8 }), 0, 1.28, 0);
  },
  star(g) {
    const sh = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 0.26 : 0.56, a = Math.PI / 2 + (i * Math.PI) / 5;
      i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 6, curveSegments: 4 });
    geo.translate(0, 0, -0.08);
    add(g, geo, M('#ffd23f', { emissive: '#ffb000', emissiveIntensity: 0.25 }), 0, 0.62, 0);
    const c = new THREE.Vector3(0, 0.6, -0.1);
    face(g, c, 0.36, { eye: 0.09, gap: 0.3, dy: 0.05 });
  },
  octo(g) {
    const skin = M('#ff8a9a');
    const c = new THREE.Vector3(0, 0.62, 0);
    add(g, S(0.4), skin, 0, 0.62, 0, 1, 1.05, 1);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.5;
      const t = add(g, new THREE.CapsuleGeometry(0.07, 0.22, 6, 12), skin, Math.sin(a) * 0.3, 0.2, Math.cos(a) * 0.3);
      t.rotation.set(Math.cos(a) * 0.6, 0, -Math.sin(a) * 0.6);
    }
    face(g, c, 0.4, { eye: 0.12, gap: 0.32, dy: 0 });
    add(g, S(0.56), new THREE.MeshPhysicalMaterial({ color: '#cfefff', transparent: true, opacity: 0.22, roughness: 0.05, depthWrite: false }), 0, 0.66, 0);
  },
  penguin(g) {
    const blk = M('#2a2f3a'), wht = M('#fbfaf6'), org = M('#ff9f1c');
    add(g, S(0.44), blk, 0, 0.55, 0, 1, 1.12, 0.95);
    add(g, S(0.36), wht, 0, 0.52, 0.1);
    face(g, new THREE.Vector3(0, 0.52, 0.1), 0.36, { eye: 0.1, gap: 0.3, dy: 0.25, mouth: false });
    add(g, new THREE.ConeGeometry(0.07, 0.16, 16), org, 0, 0.58, 0.5).rotation.x = Math.PI / 2;
    for (const s of [-1, 1]) add(g, new THREE.CapsuleGeometry(0.06, 0.26), blk, s * 0.43, 0.5, 0).rotation.z = s * 0.4;
    feet(g, org, 0.16);
  },
  cat(g) {
    const fur = M('#ffb057'), pale = M('#fff1dc');
    const c = new THREE.Vector3(0, 0.55, 0);
    add(g, S(0.45), fur, 0, 0.55, 0, 1.05, 0.95, 1);
    for (const s of [-1, 1]) {
      const ear = add(g, new THREE.ConeGeometry(0.13, 0.24, 16), fur, s * 0.26, 0.95, 0);
      ear.rotation.z = -s * 0.35;
    }
    add(g, S(0.16), pale, 0, 0.42, 0.33, 1.3, 0.8, 0.8);
    add(g, S(0.04), M('#ff6f91'), 0, 0.49, 0.45);
    face(g, c, 0.45, { eye: 0.11, dy: 0.12, mouth: false });
    const tail = add(g, new THREE.TorusGeometry(0.25, 0.05, 10, 24, Math.PI * 1.1), fur, 0.18, 0.45, -0.38);
    tail.rotation.y = Math.PI / 2;
    feet(g, pale);
  },
  bear(g) {
    const fur = M('#a8754f'), pale = M('#f1d7b8');
    const c = new THREE.Vector3(0, 0.55, 0);
    add(g, S(0.46), fur, 0, 0.55, 0);
    for (const s of [-1, 1]) { add(g, S(0.13), fur, s * 0.32, 0.92, 0, 1, 1, 0.7); add(g, S(0.07), pale, s * 0.32, 0.92, 0.06, 1, 1, 0.5); }
    add(g, S(0.16), pale, 0, 0.44, 0.36, 1.2, 0.85, 0.8);
    add(g, S(0.055), BLACK, 0, 0.5, 0.48, 1.3, 0.9, 1);
    face(g, c, 0.46, { eye: 0.1, gap: 0.3, dy: 0.15, mouth: false });
    feet(g, fur);
  },
  chick(g) {
    const ylw = M('#ffe14d'), org = M('#ff9f1c');
    const c = new THREE.Vector3(0, 0.5, 0);
    add(g, S(0.44), ylw, 0, 0.5, 0, 1, 1.02, 1);
    for (let i = -1; i <= 1; i++) add(g, new THREE.CapsuleGeometry(0.03, 0.1), ylw, i * 0.05, 0.98, 0).rotation.z = -i * 0.5;
    add(g, new THREE.ConeGeometry(0.07, 0.14, 16), org, 0, 0.5, 0.47).rotation.x = Math.PI / 2;
    face(g, c, 0.44, { eye: 0.1, dy: 0.13, mouth: false });
    for (const s of [-1, 1]) add(g, S(0.14), ylw, s * 0.42, 0.48, 0, 0.5, 0.9, 1).rotation.z = s * 0.3;
    feet(g, org, 0.15);
  },
  planet(g) {
    const body = M('#f5c38b');
    const c = new THREE.Vector3(0, 0.6, 0);
    add(g, S(0.42), body, 0, 0.6, 0);
    add(g, S(0.43), M('#e8a868', { transparent: true, opacity: 0.6 }), 0, 0.6, 0, 1, 0.3, 1);
    const ring = add(g, new THREE.TorusGeometry(0.64, 0.06, 10, 64), M('#c9b8ff', { metalness: 0.3 }), 0, 0.44, 0);
    ring.rotation.set(Math.PI / 2 - 0.18, 0, 0.12);
    face(g, c, 0.42, { eye: 0.11, dy: 0.08 });
    feet(g, M('#e8a868'), 0.18);
  },
};

// 캐릭터 하나 = Group(키 약 1.2). body 를 움직여 통통 튀게 한다.
export function buildChar(id, teamColor) {
  const g = new THREE.Group(), body = new THREE.Group();
  (BUILD[id] || BUILD.star)(body);
  g.add(body);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.06, 40),
    new THREE.MeshStandardMaterial({ color: teamColor, emissive: teamColor, emissiveIntensity: 0.35, roughness: 0.4 }));
  base.position.y = 0.03; base.receiveShadow = true;
  g.add(base);
  body.position.y = 0.06;
  g.userData.body = body;
  return g;
}

// 작은 3D 미리보기 (참가 화면 · 내 캐릭터 표시용). canvas 하나에 캐릭터 하나, 천천히 돈다.
export function preview(canvas, id, teamColor) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  r.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight('#ffffff', '#445', 2.2));
  const d = new THREE.DirectionalLight('#ffffff', 2); d.position.set(2, 3, 4); scene.add(d);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
  cam.position.set(0, 1.1, 3.4); cam.lookAt(0, 0.6, 0);
  let ch = buildChar(id, teamColor); scene.add(ch);
  let alive = true;
  const fit = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (w && h) { r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); } };
  const loop = (t) => {
    if (!alive) return;
    fit();
    ch.rotation.y = Math.sin(t / 1400) * 0.6;
    ch.userData.body.position.y = 0.06 + Math.abs(Math.sin(t / 380)) * 0.05;
    r.render(scene, cam);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  return {
    set(nid, col) { scene.remove(ch); ch = buildChar(nid, col); scene.add(ch); },
    stop() { alive = false; r.dispose(); },
  };
}
