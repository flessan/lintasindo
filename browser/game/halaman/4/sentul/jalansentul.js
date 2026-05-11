
/* ============================================
   CANVAS RESPONSIF
   ============================================ */
const canvas = document.getElementById('gameCanvas'), ctx = canvas.getContext('2d');
function resize() { const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr; canvas.style.width = window.innerWidth + 'px'; canvas.style.height = window.innerHeight + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) }
resize(); window.addEventListener('resize', resize);
const VW = () => window.innerWidth, VH = () => window.innerHeight;
const WORLD_W = 1000, WORLD_H = 3200, TRACK_W = 180, HALF_TRACK = TRACK_W / 2, SIDEWALK_W = 28, CURB_W = 14;

/* ============================================
   TREK BARU - "SIRKUIT NUSANTARA"
   Start barat-daya → belok timur → hairpin kanan
   → utara Hutan Kota → S-kurve Taman Air → finish utara
   ============================================ */
const controlPoints = [
    { x: 150, y: 2900 }, { x: 160, y: 2750 },
    { x: 120, y: 2620 }, { x: 200, y: 2520 }, { x: 150, y: 2400 }, { x: 220, y: 2300 },
    { x: 350, y: 2250 }, { x: 500, y: 2220 }, { x: 650, y: 2250 }, { x: 780, y: 2300 },
    { x: 870, y: 2400 }, { x: 880, y: 2550 }, { x: 830, y: 2650 }, { x: 720, y: 2700 },
    { x: 620, y: 2650 }, { x: 560, y: 2500 }, { x: 580, y: 2350 },
    { x: 540, y: 2200 }, { x: 480, y: 2080 },
    { x: 440, y: 1900 }, { x: 420, y: 1700 }, { x: 400, y: 1500 },
    { x: 350, y: 1350 }, { x: 450, y: 1250 }, { x: 560, y: 1180 },
    { x: 650, y: 1080 }, { x: 600, y: 950 }, { x: 500, y: 880 }, { x: 420, y: 800 },
    { x: 480, y: 650 }, { x: 550, y: 500 }, { x: 580, y: 350 }, { x: 550, y: 200 },
    { x: 500, y: 100 }
];

function catmullRom(p0, p1, p2, p3, t) { const t2 = t * t, t3 = t2 * t; return { x: .5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3), y: .5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3) } }
function generateDenseCenterline() { const pts = controlPoints, dense = []; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[Math.min(pts.length - 1, i + 1)], p3 = pts[Math.min(pts.length - 1, i + 2)]; for (let j = 0; j < 24; j++)dense.push(catmullRom(p0, p1, p2, p3, j / 24)) } dense.push(pts[pts.length - 1]); return dense }
const denseCenter = generateDenseCenterline();
function createSmoothPath() { const path = new Path2D(), pts = controlPoints; path.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i].x + pts[i + 1].x) / 2, my = (pts[i].y + pts[i + 1].y) / 2; path.quadraticCurveTo(pts[i].x, pts[i].y, mx, my) } path.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y); return path }
const trackPath = createSmoothPath();

/* ============================================
   OBJEK GAME - DISESUAIKAN DENGAN TREK BARU
   ============================================ */
const cones = [
    { x: 180, y: 2680, hit: false, fallAng: 0, alpha: 1 }, { x: 130, y: 2560, hit: false, fallAng: 0, alpha: 1 },
    { x: 400, y: 2280, hit: false, fallAng: 0, alpha: 1 }, { x: 600, y: 2280, hit: false, fallAng: 0, alpha: 1 },
    { x: 760, y: 2320, hit: false, fallAng: 0, alpha: 1 }, { x: 860, y: 2440, hit: false, fallAng: 0, alpha: 1 },
    { x: 860, y: 2580, hit: false, fallAng: 0, alpha: 1 }, { x: 790, y: 2660, hit: false, fallAng: 0, alpha: 1 },
    { x: 600, y: 2580, hit: false, fallAng: 0, alpha: 1 }, { x: 540, y: 2420, hit: false, fallAng: 0, alpha: 1 },
    { x: 560, y: 2260, hit: false, fallAng: 0, alpha: 1 },
    { x: 440, y: 1960, hit: false, fallAng: 0, alpha: 1 }, { x: 410, y: 1780, hit: false, fallAng: 0, alpha: 1 },
    { x: 380, y: 1560, hit: false, fallAng: 0, alpha: 1 },
    { x: 500, y: 1220, hit: false, fallAng: 0, alpha: 1 }, { x: 620, y: 1120, hit: false, fallAng: 0, alpha: 1 },
    { x: 460, y: 830, hit: false, fallAng: 0, alpha: 1 }, { x: 530, y: 700, hit: false, fallAng: 0, alpha: 1 },
    { x: 560, y: 420, hit: false, fallAng: 0, alpha: 1 }, { x: 530, y: 240, hit: false, fallAng: 0, alpha: 1 }
];

const oilSlicks = [
    { x: 720, y: 2700, radius: 20, hitByPlayer: false }, { x: 580, y: 2380, radius: 18, hitByPlayer: false },
    { x: 400, y: 1550, radius: 22, hitByPlayer: false }, { x: 500, y: 900, radius: 16, hitByPlayer: false }
];

/* Speed Boost Zones */
const boostZones = [
    { x: 500, y: 2220, radius: 30, used: false }, { x: 480, y: 2080, radius: 30, used: false },
    { x: 420, y: 1700, radius: 28, used: false }, { x: 500, y: 880, radius: 28, used: false }
];

const trafficSigns = [
    { x: 220, y: 2400, type: 'stop', hit: false, fallAng: 0, alpha: 1, checked: false },
    { x: 830, y: 2650, type: 'no_entry', hit: false, fallAng: 0, alpha: 1, checked: false },
    { x: 380, y: 1560, type: 'left_turn', hit: false, fallAng: 0, alpha: 1, checked: false },
    { x: 580, y: 350, type: 'speed', hit: false, fallAng: 0, alpha: 1, checked: false }
];

const pedestrians = [
    { x: 250, y: 2500, axis: 'x', min: 180, max: 320, speed: .55, dir: 1, hit: false, alpha: 1, fallAng: 0, nearApproach: false },
    { x: 700, y: 2680, axis: 'x', min: 640, max: 760, speed: .45, dir: -1, hit: false, alpha: 1, fallAng: 0, nearApproach: false },
    { x: 560, y: 2350, axis: 'y', min: 2280, max: 2420, speed: .5, dir: 1, hit: false, alpha: 1, fallAng: 0, nearApproach: false },
    { x: 440, y: 1900, axis: 'x', min: 380, max: 500, speed: .6, dir: 1, hit: false, alpha: 1, fallAng: 0, nearApproach: false },
    { x: 400, y: 1450, axis: 'y', min: 1380, max: 1520, speed: .35, dir: 1, hit: false, alpha: 1, fallAng: 0, nearApproach: false },
    { x: 550, y: 600, axis: 'x', min: 480, max: 620, speed: .5, dir: -1, hit: false, alpha: 1, fallAng: 0, nearApproach: false }
];

const checkpoints = [
    { x: 500, y: 2220, passed: false, id: 1 }, { x: 720, y: 2700, passed: false, id: 2 },
    { x: 400, y: 1500, passed: false, id: 3 }, { x: 500, y: 880, passed: false, id: 4 }
];

/* Bangunan */
const buildingColors = ['#e17055', '#ffeaa7', '#74b9ff', '#55efc4', '#fab1a0', '#a29bfe', '#fd79a8', '#00cec9', '#fdcb6e'];
const buildings = [];
(function () { const minDist = HALF_TRACK + SIDEWALK_W + 20; for (let i = 0; i < 55; i++) { let x = 70 + Math.random() * (WORLD_W - 140), y = 70 + Math.random() * (WORLD_H - 140), valid = true; for (const cp of denseCenter) { if ((x - cp.x) ** 2 + (y - cp.y) ** 2 < minDist * minDist) { valid = false; break } } if (valid) { const w = 30 + Math.random() * 55, h = 30 + Math.random() * 55; buildings.push({ x: x - w / 2, y: y - h / 2, w, h, color: buildingColors[Math.floor(Math.random() * buildingColors.length)], windows: Math.random() > .2, awning: Math.random() > .6 ? buildingColors[Math.floor(Math.random() * buildingColors.length)] : null }) } } })();

/* Pohon */
const trees = [];
(function () { const minDist = HALF_TRACK + 45; for (let i = 0; i < 40; i++) { let x, y, valid, att = 0; do { x = 50 + Math.random() * (WORLD_W - 100); y = 50 + Math.random() * (WORLD_H - 100); valid = true; for (const cp of denseCenter) { if ((x - cp.x) ** 2 + (y - cp.y) ** 2 < minDist * minDist) { valid = false; break } } att++ } while (!valid && att < 25); if (valid) trees.push({ x, y, size: 14 + Math.random() * 16, green: ['#00b894', '#00cec9', '#55efc4', '#81ecec'][Math.floor(Math.random() * 4)] }) } })();

/* Bunga */
const flowers = [];
(function () { const colors = ['#fd79a8', '#ffeaa7', '#a29bfe', '#fab1a0', '#74b9ff', '#ff7675']; for (let i = 0; i < 80; i++) { let x = 30 + Math.random() * (WORLD_W - 60), y = 30 + Math.random() * (WORLD_H - 60), onT = false; for (const cp of denseCenter) { if ((x - cp.x) ** 2 + (y - cp.y) ** 2 < (HALF_TRACK + 12) ** 2) { onT = true; break } } if (!onT) flowers.push({ x, y, color: colors[Math.floor(Math.random() * colors.length)], size: 3 + Math.random() * 3 }) } })();

/* ============================================
   STATE
   ============================================ */
let player = { x: 150, y: 2900, vx: 0, vy: 0, angle: -Math.PI / 2, onTrack: true, onOil: false, boosted: 0 };
let camera = { x: 0, y: 0 };
let gameState = 'menu', gameTime = 0, timeLimit = 32, offTrackTime = 0, offTrackLimit = 3, cpCount = 0;
let floatingTexts = [], failReason = '', failDelay = 0, flashAlpha = 0, screenShake = { intensity: 0 };
let celebrationTimer = 0, confetti = [];
let isRaining = false, rainDrops = [];

/* Inisialisasi hujan */
function initRain() { rainDrops = []; for (let i = 0; i < 120; i++)rainDrops.push({ x: Math.random() * VW(), y: Math.random() * VH(), speed: 8 + Math.random() * 8, len: 12 + Math.random() * 18, alpha: .15 + Math.random() * .25 }) }

let M = { completed: false, completionTime: 0, offTrackCount: 0, offTrackTotalDuration: 0, wasOff: false, oilHitCount: 0, nearMisses: 0, suddenBrakes: 0, maxSpeed: 0, speedSamples: [], signViolations: 0, signsHitCount: 0, pedestrianHit: false, lastSpeed: 0, lastAngle: 0, dirChanges: 0, dist: 0, lx: 150, ly: 2900, boostCount: 0 };

function resetM() { M = { completed: false, completionTime: 0, offTrackCount: 0, offTrackTotalDuration: 0, wasOff: false, oilHitCount: 0, nearMisses: 0, suddenBrakes: 0, maxSpeed: 0, speedSamples: [], signViolations: 0, signsHitCount: 0, pedestrianHit: false, lastSpeed: 0, lastAngle: 0, dirChanges: 0, dist: 0, lx: player.x, ly: player.y, boostCount: 0 }; cones.forEach(c => c.nearApproach = false); pedestrians.forEach(p => p.nearApproach = false); oilSlicks.forEach(o => o.hitByPlayer = false); trafficSigns.forEach(s => s.checked = false); boostZones.forEach(b => b.used = false) }

/* ============================================
   INPUT
   ============================================ */
const base = document.getElementById('joystick-base'), knob = document.getElementById('joystick-knob');
let input = { x: 0, y: 0 }, isDragging = false, joystickOrigin = { x: 0, y: 0 };
const startDrag = e => { if (gameState !== 'playing') return; isDragging = true; const cx = e.touches ? e.touches[0].clientX : e.clientX, cy = e.touches ? e.touches[0].clientY : e.clientY; joystickOrigin = { x: cx, y: cy }; base.style.left = (cx - 50) + 'px'; base.style.top = (cy - 50) + 'px'; base.style.display = 'block' };
const moveDrag = e => { if (!isDragging) return; e.preventDefault(); const cx = e.touches ? e.touches[0].clientX : e.clientX, cy = e.touches ? e.touches[0].clientY : e.clientY; let dx = cx - joystickOrigin.x, dy = cy - joystickOrigin.y; const dist = Math.sqrt(dx * dx + dy * dy), max = 38; if (dist > max) { dx = (dx / dist) * max; dy = (dy / dist) * max } knob.style.transform = `translate(${dx}px,${dy}px)`; input.x = dx / max; input.y = dy / max };
const endDrag = () => { isDragging = false; base.style.display = 'none'; input = { x: 0, y: 0 }; knob.style.transform = 'translate(0,0)' };
window.addEventListener('mousedown', startDrag); window.addEventListener('touchstart', startDrag, { passive: false });
window.addEventListener('mousemove', moveDrag); window.addEventListener('touchmove', moveDrag, { passive: false });
window.addEventListener('mouseup', endDrag); window.addEventListener('touchend', endDrag);
const keys = {}; window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true }); window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false });
function getKB() { let kx = 0, ky = 0; if (keys['a'] || keys['arrowleft']) kx -= 1; if (keys['d'] || keys['arrowright']) kx += 1; if (keys['w'] || keys['arrowup']) ky -= 1; if (keys['s'] || keys['arrowdown']) ky += 1; const l = Math.sqrt(kx * kx + ky * ky); if (l > 1) { kx /= l; ky /= l } return { x: kx, y: ky } }

/* ============================================
   PATTERN & HELPERS
   ============================================ */
const dotC = document.createElement('canvas'); dotC.width = 14; dotC.height = 14; const dC = dotC.getContext('2d'); dC.fillStyle = '#00b894'; dC.fillRect(0, 0, 14, 14); dC.fillStyle = 'rgba(0,0,0,0.045)'; dC.beginPath(); dC.arc(7, 7, 4, 0, Math.PI * 2); dC.fill();
let grassPat = null; function ensureGrass() { if (!grassPat) grassPat = ctx.createPattern(dotC, 'repeat') }
function rrect(c, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath() }
function checkOnTrack(px, py) { let minD = Infinity; for (const cp of denseCenter) { const d = (px - cp.x) ** 2 + (py - cp.y) ** 2; if (d < minD) minD = d } return Math.sqrt(minD) < HALF_TRACK + SIDEWALK_W + 5 }
function addFloat(x, y, text, color, size) { floatingTexts.push({ x, y, text, color, size: size || 18, life: 60, maxLife: 60, vy: -1.8 }) }
function showToast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2500) }

/* ============================================
   PRE-RENDER DUNIA
   ============================================ */
const worldCanvas = document.createElement('canvas'); worldCanvas.width = WORLD_W; worldCanvas.height = WORLD_H; const wCtx = worldCanvas.getContext('2d');

function drawTree(c, t) { c.fillStyle = 'rgba(0,0,0,0.12)'; c.beginPath(); c.ellipse(t.x + 4, t.y + 6, t.size * .9, t.size * .5, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#6d4c23'; c.strokeStyle = '#1e272e'; c.lineWidth = 2; rrect(c, t.x - 3, t.y - 2, 6, 12, 2); c.fill(); c.stroke(); c.fillStyle = t.green; c.beginPath(); c.arc(t.x, t.y - 6, t.size, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#1e272e'; c.lineWidth = 2.5; c.stroke(); c.fillStyle = 'rgba(255,255,255,0.2)'; c.beginPath(); c.arc(t.x - t.size * .25, t.y - 6 - t.size * .25, t.size * .45, 0, Math.PI * 2); c.fill() }

function drawChecker(c, cx, cy, w, h) { const sq = 9, cols = Math.ceil(w / sq), rows = Math.ceil(h / sq), sx = cx - w / 2, sy = cy - h / 2; for (let r = 0; r < rows; r++)for (let col = 0; col < cols; col++) { c.fillStyle = (r + col) % 2 === 0 ? '#1e272e' : '#dfe6e9'; c.fillRect(sx + col * sq, sy + r * sq, sq, sq) } c.strokeStyle = '#1e272e'; c.lineWidth = 2; c.strokeRect(sx, sy, cols * sq, rows * sq) }

function prerenderWorld() {
    const c = wCtx;
    c.fillStyle = '#0a1628'; c.fillRect(0, 0, WORLD_W, WORLD_H);
    /* Kolam air dekoratif */
    c.fillStyle = 'rgba(9,132,227,0.25)'; c.beginPath(); c.ellipse(700, 1100, 80, 50, .2, 0, Math.PI * 2); c.fill(); c.strokeStyle = 'rgba(116,185,255,0.3)'; c.lineWidth = 2; c.stroke();

    c.strokeStyle = 'rgba(255,255,255,0.06)'; c.lineWidth = 3;
    for (let y = 0; y < WORLD_H; y += 40) { c.beginPath(); for (let x = 0; x <= WORLD_W; x += 5) { const yy = y + Math.sin(x * .03 + y * .01) * 8; x === 0 ? c.moveTo(x, yy) : c.lineTo(x, yy) } c.stroke() }
    const gPat = c.createPattern(dotC, 'repeat'); c.fillStyle = gPat || '#00b894'; rrect(c, 20, 20, WORLD_W - 40, WORLD_H - 40, 70); c.fill();
    c.strokeStyle = '#ffeaa7'; c.lineWidth = 12; rrect(c, 20, 20, WORLD_W - 40, WORLD_H - 40, 70); c.stroke();
    c.strokeStyle = '#1e272e'; c.lineWidth = 4; rrect(c, 20, 20, WORLD_W - 40, WORLD_H - 40, 70); c.stroke();

    flowers.forEach(f => { c.fillStyle = f.color; c.beginPath(); c.arc(f.x, f.y, f.size, 0, Math.PI * 2); c.fill(); c.strokeStyle = 'rgba(0,0,0,0.15)'; c.lineWidth = 1; c.stroke() });
    trees.forEach(t => drawTree(c, t));
    buildings.forEach(b => { c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(b.x + 4, b.y + 4, b.w, b.h); c.fillStyle = b.color; c.fillRect(b.x, b.y, b.w, b.h); c.strokeStyle = '#1e272e'; c.lineWidth = 3; c.strokeRect(b.x, b.y, b.w, b.h); if (b.windows) { c.fillStyle = 'rgba(255,234,167,0.65)'; for (let wy = b.y + 8; wy < b.y + b.h - 8; wy += 11)for (let wx = b.x + 8; wx < b.x + b.w - 8; wx += 11)c.fillRect(wx, wy, 5, 5) } if (b.awning) { c.fillStyle = b.awning; c.fillRect(b.x - 3, b.y - 6, b.w + 6, 8); c.strokeStyle = '#1e272e'; c.lineWidth = 2; c.strokeRect(b.x - 3, b.y - 6, b.w + 6, 8) } });

    c.lineWidth = TRACK_W + SIDEWALK_W * 2 + CURB_W * 2 + 8; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#1e272e'; c.stroke(trackPath);
    c.lineWidth = TRACK_W + SIDEWALK_W * 2 + CURB_W * 2; c.setLineDash([18, 18]); c.strokeStyle = '#e17055'; c.stroke(trackPath); c.lineDashOffset = 18; c.strokeStyle = '#ffffff'; c.stroke(trackPath); c.setLineDash([]); c.lineDashOffset = 0;
    c.lineWidth = TRACK_W + SIDEWALK_W * 2; c.strokeStyle = '#b2bec3'; c.stroke(trackPath);
    c.lineWidth = TRACK_W + SIDEWALK_W * 2 - 6; c.setLineDash([8, 8]); c.strokeStyle = 'rgba(0,0,0,0.06)'; c.stroke(trackPath); c.setLineDash([]);
    c.lineWidth = TRACK_W + 4; c.strokeStyle = '#1e272e'; c.stroke(trackPath);
    c.lineWidth = TRACK_W; c.strokeStyle = '#2d3436'; c.stroke(trackPath);
    c.lineWidth = 3; c.setLineDash([16, 14]); c.strokeStyle = 'rgba(255,255,255,0.5)'; c.stroke(trackPath); c.setLineDash([]);

    /* Speed boost zones */
    boostZones.forEach(bz => { const g = c.createRadialGradient(bz.x, bz.y, 0, bz.x, bz.y, bz.radius); g.addColorStop(0, 'rgba(0,206,201,0.5)'); g.addColorStop(1, 'rgba(0,206,201,0)'); c.fillStyle = g; c.beginPath(); c.arc(bz.x, bz.y, bz.radius, 0, Math.PI * 2); c.fill(); c.strokeStyle = 'rgba(0,206,201,0.6)'; c.lineWidth = 2; c.setLineDash([4, 4]); c.stroke(); c.setLineDash([]); c.fillStyle = '#fff'; c.font = 'bold 12px Bungee'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BOOST', bz.x, bz.y) });

    oilSlicks.forEach(oil => { c.fillStyle = 'rgba(0,0,0,0.15)'; c.beginPath(); c.ellipse(oil.x + 2, oil.y + 3, oil.radius + 2, oil.radius * .6 + 2, .15, 0, Math.PI * 2); c.fill(); c.fillStyle = '#1e272e'; c.beginPath(); c.ellipse(oil.x, oil.y, oil.radius, oil.radius * .6, .15, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(116,185,255,0.35)'; c.beginPath(); c.ellipse(oil.x - 4, oil.y - 2, oil.radius * .4, oil.radius * .22, .15, 0, Math.PI * 2); c.fill(); c.fillStyle = '#ffeaa7'; c.font = 'bold 10px Nunito'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('!', oil.x + 6, oil.y + 2) });

    drawChecker(c, 150, y = 2940, TRACK_W, 18); drawChecker(c, 500, 48, TRACK_W, 18);
    c.fillStyle = '#ffeaa7'; c.font = 'bold 22px Bungee'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.strokeStyle = '#1e272e'; c.lineWidth = 4;
    c.strokeText('START', 150, 2900); c.fillText('START', 150, 2900); c.strokeText('FINISH', 500, 92); c.fillText('FINISH', 500, 92);
    c.font = 'bold 12px Nunito'; c.fillStyle = 'rgba(255,255,255,0.3)';
    c.fillText('Handil Bakti', 200, 2520); c.fillText('BOULEVARD', 500, 2220); c.fillText('TIKUNGAN ELANG', 830, 2550); c.fillText('HUTAN KOTA', 440, 1900); c.fillText('TAMAN AIR', 500, 1100); c.fillText('SPRINT AKHIR', 550, 400)
}
prerenderWorld();

/* ============================================
   CONFETTI
   ============================================ */
function spawnConfetti() { const colors = ['#ff7675', '#ffeaa7', '#74b9ff', '#55efc4', '#fd79a8', '#a29bfe', '#00cec9', '#fdcb6e', '#e17055']; for (let i = 0; i < 250; i++) { confetti.push({ x: VW() / 2 + (Math.random() - .5) * VW() * .6, y: -20 - Math.random() * 300, vx: (Math.random() - .5) * 7, vy: 1.5 + Math.random() * 4, rot: Math.random() * Math.PI * 2, rotS: (Math.random() - .5) * .25, color: colors[Math.floor(Math.random() * colors.length)], w: 4 + Math.random() * 8, h: 3 + Math.random() * 5, life: 200 + Math.random() * 150 }) } }
function updateConfetti() { for (let i = confetti.length - 1; i >= 0; i--) { const p = confetti[i]; p.x += p.vx; p.y += p.vy; p.vy += .06; p.vx *= .99; p.rot += p.rotS; p.life--; if (p.life <= 0 || p.y > VH() + 30) confetti.splice(i, 1) } }
function drawConfetti() { for (const p of confetti) { ctx.save(); ctx.globalAlpha = Math.min(1, p.life / 30); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore() } }

/* ============================================
   EFEK HUJAN
   ============================================ */
function drawRain() {
    if (!isRaining) return;
    if (rainDrops.length === 0) initRain();
    ctx.strokeStyle = 'rgba(174,214,241,0.35)'; ctx.lineWidth = 1.5;
    for (const d of rainDrops) {
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 2, d.y + d.len); ctx.stroke();
        d.y += d.speed; d.x -= 1.5;
        if (d.y > VH()) { d.y = -d.len; d.x = Math.random() * VW() }
    }
}

/* ============================================
   PENILAIAN
   ============================================ */
function calcEval() {
    const m = M; const avgSpd = m.speedSamples.length > 0 ? m.speedSamples.reduce((a, b) => a + b, 0) / m.speedSamples.length : 0;
    let waktuScore = m.completed ? Math.min(100, Math.round(45 + ((timeLimit - m.completionTime) / timeLimit) * 65)) : Math.round((cpCount / 4) * 35);
    let kontrolScore = Math.max(0, Math.min(100, Math.round(100 - m.oilHitCount * 8 - m.suddenBrakes * 4 - Math.min(20, m.dirChanges * .5) + m.boostCount * 3)));
    let disiplinScore = Math.max(0, Math.min(100, Math.round(100 - m.offTrackCount * 12 - Math.floor(m.offTrackTotalDuration) * 8)));
    let waspadaScore = Math.max(0, Math.min(100, Math.round(75 + m.nearMisses * 4 - (m.completed ? 0 : 15) - m.offTrackCount * 3 - (m.pedestrianHit ? 25 : 0))));
    let patuhScore = m.pedestrianHit ? 0 : Math.max(0, Math.min(100, Math.round(100 - m.signViolations * 15 - m.signsHitCount * 30)));
    const overall = Math.round((waktuScore + kontrolScore + disiplinScore + waspadaScore + patuhScore) / 5);
    let grade = overall >= 90 ? 'A' : overall >= 80 ? 'B' : overall >= 70 ? 'C' : overall >= 60 ? 'D' : 'E';
    const lulus = m.completed && overall >= 70 && !m.pedestrianHit;
    return { waktuScore, kontrolScore, disiplinScore, waspadaScore, patuhScore, overall, grade, lulus, avgSpd, maxSpeed: m.maxSpeed, offTrackCount: m.offTrackCount, offTrackDur: m.offTrackTotalDuration, oilHit: m.oilHitCount, oilTotal: oilSlicks.length, nearMisses: m.nearMisses, suddenBrakes: m.suddenBrakes, signViolations: m.signViolations, completed: m.completed, completionTime: m.completionTime, distance: Math.round(m.dist), cpCount, pedestrianHit: m.pedestrianHit, boostCount: m.boostCount }
}
function scoreColor(s) { return s >= 80 ? '#00b894' : s >= 60 ? '#fdcb6e' : '#d63031' }
function gradeColor(g) { return g === 'A' ? '#00b894' : g === 'B' ? '#0984e3' : g === 'C' ? '#ffeaa7' : g === 'D' ? '#e17055' : '#d63031' }

function showEval() {
    const ev = calcEval(); const now = new Date(); const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const regNo = 'SIM-2027-NUSA-' + String(Math.floor(Math.random() * 9000) + 1000);
    const notes = [];
    if (ev.pedestrianHit) notes.push('PELANGGARAN BERAT: Menabrak pejalan kaki. Nilai kepatuhan otomatis 0.');
    if (ev.overall >= 90) notes.push('Kemampuan mengemudi sangat baik!');
    else if (ev.overall >= 80) notes.push('Kemampuan mengemudi baik, pertahankan.');
    else if (ev.overall >= 70) notes.push('Kemampuan mengemudi cukup, perlu peningkatan.');
    else notes.push('Kemampuan mengemudi perlu banyak ditingkatkan.');
    if (ev.disiplinScore < 70) notes.push('Disiplin jalur perlu ditingkatkan.');
    if (ev.kontrolScore < 70) notes.push('Kontrol kendaraan kurang stabil.');
    if (ev.waspadaScore < 70) notes.push('Tingkatkan kewaspadaan terhadap rintangan.');
    if (ev.patuhScore < 70 && !ev.pedestrianHit) notes.push('Patuhi rambu lalu lintas.');
    if (ev.waktuScore < 70) notes.push('Kelola waktu dengan lebih efisien.');
    if (ev.oilHit > 2) notes.push('Hindari jalur licin, perhatikan marka peringatan.');
    if (ev.boostCount > 0) notes.push('Memanfaatkan speed boost sebanyak ' + ev.boostCount + 'x.');

    const cats = [{ label: 'Ketepatan Waktu', score: ev.waktuScore }, { label: 'Kontrol Kendaraan', score: ev.kontrolScore }, { label: 'Disiplin Jalur', score: ev.disiplinScore }, { label: 'Kewaspadaan', score: ev.waspadaScore }, { label: 'Kepatuhan Rambu', score: ev.patuhScore }];

    const paper = document.getElementById('eval-paper');
    paper.innerHTML = `
        <div class="evh"><div class="evh-inst">BADAN ADMINISTRASI KEHORMATAN TERSELENGGARA</div><div class="evh-title">SURAT KETERANGAN HASIL UJIAN</div><div class="evh-sub">PRAKTIK SIM KELAS C</div><div class="evh-badge">SIRKUIT NUSANTARA</div></div>
        <div class="evi"><span class="evi-l">No. Registrasi</span><span class="evi-v">${regNo}</span><span class="evi-l">Tanggal</span><span class="evi-v">${dateStr}</span><span class="evi-l">Trek</span><span class="evi-v">Nusantara</span><span class="evi-l">Status</span><span class="evi-v" style="color:${ev.completed ? '#00b894' : '#d63031'}">${ev.completed ? 'Selesai' : 'Tidak Selesai'}</span></div>
        <div class="evs">ASPEK PENILAIAN</div>
        ${cats.map(c => `<div class="evr"><span class="evr-l">${c.label}</span><span class="evr-s" style="color:${scoreColor(c.score)}">${c.score}</span><div class="evb-bg"><div class="evb-fill" data-width="${c.score}" style="background:${scoreColor(c.score)}"></div></div></div>`).join('')}
        <div class="evo"><div class="evg-circle" style="background:${gradeColor(ev.grade)}">${ev.grade}</div><div class="evo-text"><div class="evo-label">NILAI RATA-RATA <span class="scroll-hint">(scroll atau gulir kertas ini)</span></div><div class="evo-score">${ev.overall}/100</div></div></div>
        <div class="ev-stamp"><div class="ev-stamp-box ${ev.lulus ? 'ev-stamp-pass' : 'ev-stamp-fail'}">${ev.lulus ? 'LULUS' : 'TIDAK LULUS'}</div></div>
        <div class="evs">RINCIAN</div>
        <div class="ev-detail"><span>Waktu</span><strong>${ev.completed ? ev.completionTime.toFixed(1) + 's' : '- - -'}</strong><span>Kecepatan Rata-rata</span><strong>${Math.round(ev.avgSpd * 14)} km/h</strong><span>Kecepatan Maks</span><strong>${Math.round(ev.maxSpeed * 14)} km/h</strong><span>Keluar Jalur</span><strong>${ev.offTrackCount}x (${ev.offTrackDur.toFixed(1)}s)</strong><span>Minyak Dilalui</span><strong>${ev.oilHit} / ${ev.oilTotal}</strong><span>Hampir Tabrak</span><strong>${ev.nearMisses}x</strong><span>Pengereman Mendadak</span><strong>${ev.suddenBrakes}x</strong><span>Pelanggaran Rambu</span><strong>${ev.signViolations}</strong><span>Checkpoint</span><strong>${ev.cpCount} / 4</strong><span>Speed Boost</span><strong>${ev.boostCount}x</strong></div>
        <div class="evs">CATATAN PENGUJI</div>
        <div class="ev-notes">${notes.map(n => `<div>• ${n}</div>`).join('')}</div>
        <div class="ev-sig"><div>Penguji,</div><div class="ev-sig-line"></div><div class="ev-sig-name">Inspektur THIO</div></div>
        <div class="ev-seal">THIO<br>RESMI</div>`;

    const btns = document.getElementById('eval-btns');
    if (ev.lulus) {
        btns.innerHTML = `<button class="pop-btn green" id="sim-btn">AMBIL SIM C</button><button class="pop-btn orange" onclick="location.reload()">ULANGI UJIAN</button>`;
        document.getElementById('sim-btn').addEventListener('click', () => { location.href = '../selamat/' });
    } else {
        btns.innerHTML = `<button class="pop-btn orange" onclick="location.reload()">ULANGI UJIAN</button>`;
    }

    document.getElementById('hud').style.display = 'none';
    document.getElementById('offtrack-warning').style.display = 'none';
    document.getElementById('rain-toggle').style.display = 'none';
    document.getElementById('eval-screen').style.display = 'flex';
    requestAnimationFrame(() => requestAnimationFrame(() => { paper.querySelectorAll('.evb-fill').forEach(bar => { bar.style.width = bar.dataset.width + '%' }) }));
}

/* ============================================
   PRISON SCENE
   ============================================ */
function showPrison() { gameState = 'prison'; document.getElementById('prison-id').textContent = 'PK-' + String(Math.floor(Math.random() * 9000) + 1000); document.getElementById('prison-screen').style.display = 'flex'; document.getElementById('hud').style.display = 'none'; document.getElementById('offtrack-warning').style.display = 'none'; document.getElementById('rain-toggle').style.display = 'none' }
document.getElementById('prison-eval-btn').addEventListener('click', () => { document.getElementById('prison-screen').style.display = 'none'; showEval() });



/* ============================================
   HUJAN TOGGLE
   ============================================ */
document.getElementById('rain-toggle').addEventListener('click', function () {
    isRaining = !isRaining; this.classList.toggle('active', isRaining);
    document.getElementById('weather-box').style.display = isRaining ? 'block' : 'none';
    if (isRaining) initRain(); else rainDrops = [];
});

/* ============================================
   UPDATE
   ============================================ */
const ACCEL = .42, FRICTION = .93, OFF_FRICTION = .84, OIL_FRICTION = .975, RAIN_FRICTION = .96, MAX_SPEED = 2.7, BOOST_MAX = 7.5;

function updateGame(dt) {
    if (gameState === 'celebrating') {
        celebrationTimer -= dt; updateConfetti();
        floatingTexts = floatingTexts.filter(ft => ft.life > 0); for (let ft of floatingTexts) { ft.y += ft.vy; ft.life-- }
        if (screenShake.intensity > 0) { screenShake.intensity *= .9; if (screenShake.intensity < .5) screenShake.intensity = 0 }
        if (flashAlpha > 0) flashAlpha -= .02;
        camera.x += (player.x - VW() / 2 - camera.x) * .08; camera.y += (player.y - VH() / 2 - camera.y) * .08;
        if (celebrationTimer <= 0) { gameState = 'eval'; showEval() }
        return
    }
    if (gameState === 'failing') {
        failDelay--;
        [cones, trafficSigns].forEach(a => a.forEach(o => { if (o.hit && o.alpha > 0) { o.fallAng += .15; o.alpha -= .02 } }));
        pedestrians.forEach(p => { if (p.hit && p.alpha > 0) { p.fallAng += .15; p.alpha -= .02 } });
        floatingTexts = floatingTexts.filter(ft => ft.life > 0); for (let ft of floatingTexts) { ft.y += ft.vy; ft.life-- }
        if (screenShake.intensity > 0) { screenShake.intensity *= .9; if (screenShake.intensity < .5) screenShake.intensity = 0 }
        if (flashAlpha > 0) flashAlpha -= .025;
        if (failDelay <= 0) { if (M.pedestrianHit) showPrison(); else showEval(); gameState = 'eval' }
        return
    }
    if (gameState !== 'playing') return;

    const m = M; const kb = getKB(); let ix = input.x || kb.x, iy = input.y || kb.y; if (input.x && kb.x) ix = (input.x + kb.x) / 2; if (input.y && kb.y) iy = (input.y + kb.y) / 2;
    player.vx += ix * ACCEL; player.vy += iy * ACCEL;
    player.onTrack = checkOnTrack(player.x, player.y);

    player.onOil = false;
    for (let oil of oilSlicks) { if (Math.sqrt((player.x - oil.x) ** 2 + (player.y - oil.y) ** 2) < oil.radius + 8) { player.onOil = true; if (!oil.hitByPlayer) { oil.hitByPlayer = true; m.oilHitCount++ } break } }

    /* Speed boost */
    for (let bz of boostZones) { if (!bz.used && Math.sqrt((player.x - bz.x) ** 2 + (player.y - bz.y) ** 2) < bz.radius) { bz.used = true; player.boosted = 120; m.boostCount++; addFloat(bz.x, bz.y - 30, 'BOOST!', '#00cec9', 22) } }

    let fric = player.onTrack ? FRICTION : OFF_FRICTION;
    if (player.onOil) fric = OIL_FRICTION;
    if (isRaining) fric *= RAIN_FRICTION / FRICTION;
    player.vx *= fric; player.vy *= fric;

    const maxSpd = player.boosted > 0 ? BOOST_MAX : MAX_SPEED;
    if (player.boosted > 0) player.boosted--;

    const speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
    if (speed > maxSpd) { player.vx = (player.vx / speed) * maxSpd; player.vy = (player.vy / speed) * maxSpd }

    if (player.onOil) { player.vx += (Math.random() - .5) * .6; player.vy += (Math.random() - .5) * .6 }

    player.x += player.vx; player.y += player.vy;
    if (speed > .5) player.angle = Math.atan2(player.vy, player.vx);
    player.x = Math.max(50, Math.min(WORLD_W - 50, player.x)); player.y = Math.max(50, Math.min(WORLD_H - 50, player.y));

    document.getElementById('speed-val').textContent = Math.round(speed * 14);
    const sBox = document.getElementById('speed-box');
    sBox.classList.toggle('boost-active', player.boosted > 0);

    /* Metrik */
    m.speedSamples.push(speed); if (speed > m.maxSpeed) m.maxSpeed = speed;
    m.dist += Math.sqrt((player.x - m.lx) ** 2 + (player.y - m.ly) ** 2); m.lx = player.x; m.ly = player.y;
    if (m.lastSpeed - speed > 2.5 && m.lastSpeed > 3) m.suddenBrakes++; m.lastSpeed = speed;
    if (speed > 2) { const ad = Math.abs(player.angle - m.lastAngle); const wrap = ad > Math.PI ? 2 * Math.PI - ad : ad; if (wrap > .4) m.dirChanges++; m.lastAngle = player.angle }

    for (let c of cones) { if (c.hit) continue; const d = Math.sqrt((player.x - c.x) ** 2 + (player.y - c.y) ** 2); if (d < 36 && d > 20 && !c.nearApproach) c.nearApproach = true; if (c.nearApproach && d > 42) { m.nearMisses++; c.nearApproach = false } }
    for (let p of pedestrians) { if (p.hit) continue; const d = Math.sqrt((player.x - p.x) ** 2 + (player.y - p.y) ** 2); if (d < 34 && d > 18 && !p.nearApproach) p.nearApproach = true; if (p.nearApproach && d > 40) { m.nearMisses++; p.nearApproach = false } }
    for (let s of trafficSigns) { if (s.hit || s.checked) continue; if (Math.sqrt((player.x - s.x) ** 2 + (player.y - s.y) ** 2) < 55) { s.checked = true; if (speed > 4.5) m.signViolations++ } }
    if (!player.onTrack) { if (!m.wasOff) m.offTrackCount++; m.offTrackTotalDuration += dt / 1000; m.wasOff = true } else { m.wasOff = false }

    /* Kolisi cone */
    for (let c of cones) { if (c.hit) continue; if (Math.sqrt((player.x - c.x) ** 2 + (player.y - c.y) ** 2) < 20) { c.hit = true; failReason = 'Mengenai cone rintangan!'; addFloat(c.x, c.y - 35, 'GAGAL!', '#ff7675', 30); screenShake.intensity = 16; flashAlpha = .7; gameState = 'failing'; failDelay = 55; return } }
    /* Kolisi rambu */
    for (let s of trafficSigns) { if (s.hit) continue; if (Math.sqrt((player.x - s.x) ** 2 + (player.y - s.y) ** 2) < 18) { s.hit = true; m.signsHitCount++; failReason = 'Menabrak rambu lalu lintas!'; addFloat(s.x, s.y - 35, 'GAGAL!', '#ff7675', 30); screenShake.intensity = 16; flashAlpha = .7; gameState = 'failing'; failDelay = 55; return } }
    /* Pejalan kaki → PENJARA */
    for (let p of pedestrians) {
        if (p.hit) continue;
        if (p.axis === 'x') { p.x += p.speed * p.dir; if (p.x > p.max || p.x < p.min) p.dir *= -1 } else { p.y += p.speed * p.dir; if (p.y > p.max || p.y < p.min) p.dir *= -1 }
        if (Math.sqrt((player.x - p.x) ** 2 + (player.y - p.y) ** 2) < 18) { p.hit = true; m.pedestrianHit = true; failReason = 'Menabrak pejalan kaki!'; addFloat(p.x, p.y - 35, 'PENJARA!', '#ff7675', 30); screenShake.intensity = 20; flashAlpha = .9; gameState = 'failing'; failDelay = 60; return }
    }

    [cones, trafficSigns].forEach(a => a.forEach(o => { if (o.hit && o.alpha > 0) { o.fallAng += .15; o.alpha -= .02 } }));
    pedestrians.forEach(p => { if (p.hit && p.alpha > 0) { p.fallAng += .15; p.alpha -= .02 } });

    if (!player.onTrack) {
        offTrackTime += dt / 1000; document.getElementById('offtrack-warning').style.display = 'block';
        document.getElementById('offtrack-fill').style.width = Math.min(100, (offTrackTime / offTrackLimit) * 100) + '%';
        if (offTrackTime >= offTrackLimit) { failReason = 'Keluar dari jalur terlalu lama!'; addFloat(player.x, player.y - 35, 'KELUAR JALUR!', '#ff7675', 24); screenShake.intensity = 12; flashAlpha = .5; gameState = 'failing'; failDelay = 55; return }
    } else { offTrackTime = Math.max(0, offTrackTime - dt / 400); if (offTrackTime <= 0) { document.getElementById('offtrack-warning').style.display = 'none'; document.getElementById('offtrack-fill').style.width = '0%' } else { document.getElementById('offtrack-fill').style.width = Math.min(100, (offTrackTime / offTrackLimit) * 100) + '%' } }

    gameTime += dt / 1000; const remaining = Math.max(0, timeLimit - gameTime); document.getElementById('timer').textContent = Math.ceil(remaining);
    const tb = document.getElementById('timer-box'); if (remaining <= 30) tb.classList.add('danger'); else tb.classList.remove('danger');
    if (remaining <= 0) { failReason = 'Waktu habis!'; addFloat(player.x, player.y - 35, 'WAKTU HABIS!', '#ff7675', 24); screenShake.intensity = 10; flashAlpha = .5; gameState = 'failing'; failDelay = 55; return }

    for (let cp of checkpoints) { if (cp.passed) continue; if (Math.sqrt((player.x - cp.x) ** 2 + (player.y - cp.y) ** 2) < HALF_TRACK) { cp.passed = true; cpCount++; document.getElementById('cp-count').textContent = cpCount; addFloat(cp.x, cp.y - 40, 'CP ' + cp.id + ' OK!', '#55efc4', 24) } }

    /* FINISH */
    if (cpCount === 4 && Math.sqrt((player.x - 500) ** 2 + (player.y - 100) ** 2) < HALF_TRACK) {
        m.completed = true; m.completionTime = gameTime;
        gameState = 'celebrating'; celebrationTimer = 3200; spawnConfetti();
        screenShake.intensity = 6; flashAlpha = .4;
        addFloat(player.x, player.y - 50, 'LULUS!', '#55efc4', 36);
        addFloat(player.x, player.y - 85, 'SIM BERHASIL!', '#ffeaa7', 22);
        return
    }

    camera.x += (player.x - VW() / 2 - camera.x) * .08; camera.y += (player.y - VH() / 2 - camera.y) * .08;
    if (screenShake.intensity > 0) { screenShake.intensity *= .9; if (screenShake.intensity < .5) screenShake.intensity = 0 }
    if (flashAlpha > 0) flashAlpha -= .03;
    floatingTexts = floatingTexts.filter(ft => ft.life > 0); for (let ft of floatingTexts) { ft.y += ft.vy; ft.life-- }
}

/* ============================================
   RENDER
   ============================================ */
function drawPlayer() {
    ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(player.angle + Math.PI / 2);
    if (player.onOil) ctx.rotate(Math.sin(Date.now() * .02) * .15);
    /* Bayangan */
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(0, 6, 14, 6, 0, 0, Math.PI * 2); ctx.fill();
    /* Body */
    const bodyColor = player.boosted > 0 ? '#00cec9' : '#e17055';
    ctx.fillStyle = bodyColor; ctx.strokeStyle = '#1e272e'; ctx.lineWidth = 3; rrect(ctx, -11, -18, 22, 26, 5); ctx.fill(); ctx.stroke();
    /* Roda */
    ctx.fillStyle = '#2d3436'; ctx.beginPath(); ctx.arc(0, -14, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 10, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    /* Visor */
    ctx.fillStyle = '#74b9ff'; ctx.beginPath(); ctx.arc(0, -6, 8, Math.PI, 0); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#dfe6e9'; ctx.beginPath(); ctx.arc(0, -6, 8, Math.PI + .3, -.3); ctx.fill();
    /* Handlebar */
    ctx.strokeStyle = '#636e72'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-13, -6); ctx.lineTo(13, -6); ctx.stroke(); ctx.strokeStyle = '#1e272e'; ctx.lineWidth = 1.5; ctx.stroke();
    /* Boost trail */
    if (player.boosted > 0) { ctx.fillStyle = 'rgba(0,206,201,0.4)'; ctx.beginPath(); ctx.moveTo(-4, 14); ctx.lineTo(4, 14); ctx.lineTo(1, 28 + Math.random() * 8); ctx.lineTo(-1, 28 + Math.random() * 8); ctx.fill() }
    ctx.restore()
}

function drawPed(p) {
    if (p.alpha <= 0) return; ctx.save(); ctx.globalAlpha = Math.max(0, p.alpha); ctx.translate(p.x, p.y); if (p.hit) ctx.rotate(p.fallAng);
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.ellipse(0, 8, 6, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fdcb6e'; ctx.strokeStyle = '#1e272e'; ctx.lineWidth = 2; rrect(ctx, -5, -6, 10, 14, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffeaa7'; ctx.beginPath(); ctx.arc(0, -10, 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const la = Math.sin(Date.now() * .01) * 3; ctx.strokeStyle = '#1e272e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-2, 8); ctx.lineTo(-2 + la, 14); ctx.stroke(); ctx.beginPath(); ctx.moveTo(2, 8); ctx.lineTo(2 - la, 14); ctx.stroke();
    ctx.restore()
}

function drawSign(s) {
    if (s.alpha <= 0) return; ctx.save(); ctx.globalAlpha = Math.max(0, s.alpha); ctx.translate(s.x, s.y); if (s.hit) ctx.rotate(s.fallAng);
    ctx.fillStyle = '#636e72'; ctx.fillRect(-2, -20, 4, 28); ctx.strokeStyle = '#1e272e'; ctx.lineWidth = 1.5; ctx.strokeRect(-2, -20, 4, 28); ctx.lineWidth = 2.5; ctx.strokeStyle = '#1e272e';
    if (s.type === 'stop') { ctx.fillStyle = '#d63031'; ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(10, -26); ctx.lineTo(10, -16); ctx.lineTo(0, -10); ctx.lineTo(-10, -16); ctx.lineTo(-10, -26); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = 'bold 7px Nunito'; ctx.textAlign = 'center'; ctx.fillText('STOP', 0, -21) }
    else if (s.type === 'no_entry') { ctx.fillStyle = '#d63031'; ctx.beginPath(); ctx.arc(0, -21, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(-6, -23, 12, 4) }
    else if (s.type === 'left_turn') { ctx.fillStyle = '#0984e3'; ctx.beginPath(); ctx.arc(0, -21, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(4, -17); ctx.lineTo(-4, -17); ctx.lineTo(-4, -23); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-4, -23); ctx.lineTo(-7, -20); ctx.lineTo(-1, -20); ctx.fillStyle = '#fff'; ctx.fill() }
    else if (s.type === 'speed') { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -21, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#d63031'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -21, 7, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = '#1e272e'; ctx.font = 'bold 9px Nunito'; ctx.textAlign = 'center'; ctx.fillText('40', 0, -19) }
    ctx.restore()
}

function drawMinimap() {
    const s = Math.min(VW(), VH()) / 1400;
    const mmW = Math.round(80 * s), mmH = Math.round(250 * s), mmX = VW() - mmW - 10, mmY = VH() - mmH - 10;
    ctx.fillStyle = 'rgba(10,22,40,0.8)'; ctx.strokeStyle = '#1e272e'; ctx.lineWidth = 2.5; rrect(ctx, mmX, mmY, mmW, mmH, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(0,184,148,0.4)'; rrect(ctx, mmX + 2, mmY + 2, mmW - 4, mmH - 4, 6); ctx.fill();
    ctx.save(); ctx.translate(mmX, mmY); ctx.scale(mmW / WORLD_W, mmH / WORLD_H);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = TRACK_W * .3; ctx.lineCap = 'round'; ctx.stroke(trackPath);
    /* Boost zones on minimap */
    ctx.fillStyle = 'rgba(0,206,201,0.7)'; boostZones.forEach(bz => { ctx.beginPath(); ctx.arc(bz.x, bz.y, 12, 0, Math.PI * 2); ctx.fill() });
    ctx.fillStyle = 'rgba(255,118,117,0.7)'; cones.forEach(c => { if (!c.hit) { ctx.beginPath(); ctx.arc(c.x, c.y, 10, 0, Math.PI * 2); ctx.fill() } });
    ctx.restore();
    const px = mmX + (player.x / WORLD_W) * mmW, py = mmY + (player.y / WORLD_H) * mmH;
    ctx.fillStyle = player.boosted > 0 ? '#00cec9' : '#e17055'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
}

function render() {
    ctx.clearRect(0, 0, VW(), VH()); ensureGrass(); ctx.fillStyle = '#0a1628'; ctx.fillRect(0, 0, VW(), VH());
    ctx.save();
    const sx = screenShake.intensity > 0 ? (Math.random() - .5) * screenShake.intensity : 0, sy = screenShake.intensity > 0 ? (Math.random() - .5) * screenShake.intensity : 0;
    ctx.translate(-camera.x + sx, -camera.y + sy);
    ctx.drawImage(worldCanvas, 0, 0);

    oilSlicks.forEach(oil => { const sh = Math.sin(Date.now() * .004 + oil.x * .1) * .2; ctx.fillStyle = `rgba(116,185,255,${Math.max(0, .12 + sh).toFixed(3)})`; ctx.beginPath(); ctx.ellipse(oil.x - 3, oil.y - 2, oil.radius * .35, oil.radius * .18, .15, 0, Math.PI * 2); ctx.fill() });

    for (let cp of checkpoints) { const pulse = Math.sin(Date.now() * .005) * .3; ctx.save(); ctx.globalAlpha = cp.passed ? .3 : (.5 + pulse); ctx.fillStyle = cp.passed ? '#636e72' : '#ffeaa7'; ctx.beginPath(); ctx.arc(cp.x, cp.y, 28, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#1e272e'; ctx.lineWidth = 3; ctx.stroke(); ctx.globalAlpha = 1; ctx.fillStyle = '#1e272e'; ctx.font = 'bold 14px Nunito'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(cp.passed ? '✓' : 'CP' + cp.id, cp.x, cp.y); ctx.restore() }

    /* Boost Zones efek berkilau */
    boostZones.forEach(bz => { if (!bz.used) { const pulse = Math.sin(Date.now() * .006 + bz.x) * .3; ctx.save(); ctx.globalAlpha = .3 + pulse; ctx.strokeStyle = '#00cec9'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.arc(bz.x, bz.y, bz.radius + 4, Date.now() * .002, Date.now() * .002 + Math.PI * 1.5); ctx.stroke(); ctx.setLineDash([]); ctx.restore() } });

    cones.forEach(c => { if (c.alpha <= 0) return; ctx.save(); ctx.globalAlpha = Math.max(0, c.alpha); ctx.translate(c.x, c.y); ctx.rotate(c.hit ? c.fallAng : 0); ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.beginPath(); ctx.ellipse(2, 8, 7, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ff7675'; ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(-9, 8); ctx.lineTo(9, 8); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#1e272e'; ctx.lineWidth = 2.5; ctx.stroke(); ctx.fillStyle = '#dfe6e9'; ctx.fillRect(-5, -2, 10, 3); ctx.fillRect(-3, -8, 6, 3); ctx.restore() });

    trafficSigns.forEach(s => drawSign(s));
    pedestrians.forEach(p => drawPed(p));
    drawPlayer();

    for (let ft of floatingTexts) { ctx.globalAlpha = ft.life / ft.maxLife; ctx.font = `bold ${ft.size}px Bungee`; ctx.textAlign = 'center'; ctx.strokeStyle = '#1e272e'; ctx.lineWidth = 4; ctx.strokeText(ft.text, ft.x, ft.y); ctx.fillStyle = ft.color; ctx.fillText(ft.text, ft.x, ft.y); ctx.globalAlpha = 1 }
    ctx.restore();

    /* Off-track vignette */
    if (!player.onTrack && (gameState === 'playing' || gameState === 'failing')) { const i = Math.min(1, offTrackTime / offTrackLimit); const g = ctx.createRadialGradient(VW() / 2, VH() / 2, VW() * .25, VW() / 2, VH() / 2, VW() * .7); g.addColorStop(0, 'rgba(214,48,49,0)'); g.addColorStop(1, `rgba(214,48,49,${(.45 * i).toFixed(3)})`); ctx.fillStyle = g; ctx.fillRect(0, 0, VW(), VH()) }
    if (flashAlpha > 0) { ctx.fillStyle = `rgba(255,50,50,${flashAlpha.toFixed(3)})`; ctx.fillRect(0, 0, VW(), VH()) }
    if (player.onOil && gameState === 'playing') { const op = Math.sin(Date.now() * .01) * .15 + .25; ctx.strokeStyle = `rgba(45,52,54,${op.toFixed(3)})`; ctx.lineWidth = 6; ctx.strokeRect(3, 3, VW() - 6, VH() - 6) }

    /* Celebration: confetti + gold glow */
    if (gameState === 'celebrating') {
        drawConfetti();
        const g = ctx.createRadialGradient(VW() / 2, VH() / 2, 50, VW() / 2, VH() / 2, VW() * .5);
        g.addColorStop(0, 'rgba(255,234,167,0.12)'); g.addColorStop(1, 'rgba(255,234,167,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, VW(), VH())
    }

    drawRain();
    drawMinimap()
}

/* ============================================
   GAME LOOP
   ============================================ */
let lastTime = 0;
function gameLoop(ts) { const dt = Math.min(ts - lastTime, 50); lastTime = ts; if (gameState === 'playing' || gameState === 'failing' || gameState === 'celebrating') updateGame(dt); render(); requestAnimationFrame(gameLoop) }

camera.x = player.x - VW() / 2; camera.y = player.y - VH() / 2;

document.getElementById('start-btn').addEventListener('click', () => {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('hud').style.display = 'flex';
    document.getElementById('rain-toggle').style.display = 'block';
    gameState = 'playing'; resetM(); initRain()
});

requestAnimationFrame(gameLoop);