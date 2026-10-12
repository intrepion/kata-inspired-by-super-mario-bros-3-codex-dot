import type { Game } from "./simulation.ts";
import type { Progress } from "./save.ts";
const W = 960,
  H = 540;
export const nodes = [
  [18, 44],
  [36, 61],
  [49, 37],
  [64, 57],
  [78, 33],
  [82, 75],
  [54, 83],
];
function ellipse(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
) {
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fill();
}
function line(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  x2: number,
  y2: number,
  color: string,
  width = 2,
) {
  c.strokeStyle = color;
  c.lineWidth = width;
  c.beginPath();
  c.moveTo(x, y);
  c.lineTo(x2, y2);
  c.stroke();
}
function round(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string,
) {
  c.fillStyle = color;
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fill();
}
function star(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  size = 7,
) {
  c.fillStyle = color;
  c.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2,
      r = i % 2 ? size * 0.35 : size;
    c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  c.closePath();
  c.fill();
}
function cloud(c: CanvasRenderingContext2D, x: number, y: number, scale = 1) {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  ellipse(c, 0, 0, 42, 12, "#fff9ec99");
  ellipse(c, -16, -6, 20, 17, "#fff9ec99");
  ellipse(c, 12, -10, 26, 20, "#fff9ec99");
  c.restore();
}
function tree(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  color: string,
) {
  line(c, x, y, x - 4 * s, y - 91 * s, "#4c75646a", 7 * s);
  line(c, x, y - 45 * s, x + 30 * s, y - 82 * s, "#4c75646a", 4 * s);
  ellipse(c, x - 19 * s, y - 104 * s, 43 * s, 39 * s, color);
  ellipse(c, x + 20 * s, y - 87 * s, 36 * s, 33 * s, color);
  ellipse(c, x - 9 * s, y - 125 * s, 31 * s, 28 * s, color);
  ellipse(c, x - 25 * s, y - 113 * s, 18 * s, 16 * s, "#ffffff18");
}
function lantern(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  lit: boolean,
  scale = 1,
) {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  line(c, 0, 0, 0, -91, "#466c65", 5);
  line(c, -14, -91, 13, -91, "#466c65", 4);
  if (lit) ellipse(c, 0, -65, 34, 34, "#ffe3a030");
  round(c, -11, -83, 22, 30, 5, lit ? "#ffdf86" : "#72978a");
  round(c, -7, -79, 14, 20, 3, lit ? "#fff0b8" : "#aac0a3");
  line(c, -14, -51, 14, -51, "#466c65", 3);
  c.restore();
}
export function renderMap(
  c: CanvasRenderingContext2D,
  p: Progress,
  reduced: boolean,
  time: number,
) {
  c.clearRect(0, 0, W, H);
  c.fillStyle = "#dbead8";
  c.fillRect(0, 0, W, H);
  // Paper-like islands, river and meandering paths.
  ellipse(c, 410, 300, 510, 300, "#c7dcc1");
  ellipse(c, 395, 260, 370, 228, "#d6e4c9");
  c.strokeStyle = "#a8d4d0";
  c.lineWidth = 55;
  c.beginPath();
  c.moveTo(120, 540);
  c.bezierCurveTo(290, 360, 100, 300, 440, 250);
  c.bezierCurveTo(630, 210, 650, 170, 960, 120);
  c.stroke();
  c.strokeStyle = "#c6e7df";
  c.lineWidth = 3;
  c.stroke();
  for (let i = 0; i < 40; i++) {
    const x = (i * 137 + 21) % 960,
      y = (i * 79 + 155) % 540;
    tree(c, x, y, 0.22 + (i % 3) * 0.05, "#8fb68e66");
  }
  c.strokeStyle = "#a5bca0";
  c.lineWidth = 13;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.beginPath();
  nodes.forEach(([x, y], i) =>
    i ? c.lineTo(x * 9.6, y * 5.4) : c.moveTo(x * 9.6, y * 5.4),
  );
  c.stroke();
  c.setLineDash([3, 13]);
  c.strokeStyle = "#f2f0da";
  c.lineWidth = 3;
  c.stroke();
  c.setLineDash([]);
  for (let i = 0; i < 7; i++) {
    const [x, y] = nodes[i];
    lantern(c, x * 9.6, y * 5.4 - 25, p.completed.includes(i), 0.6);
  }
  // Observatory at the end of the path.
  round(c, 433, 400, 50, 53, 10, "#789688");
  c.fillStyle = "#56796c";
  c.beginPath();
  c.moveTo(424, 401);
  c.lineTo(458, 371);
  c.lineTo(492, 401);
  c.fill();
  ellipse(c, 458, 397, 9, 9, "#ffe3a2");
  cloud(c, 820, 72, 1.5);
  cloud(c, 60, 188, 0.8);
  for (let i = 0; i < 15; i++) {
    const x = (i * 67 + 35) % 960,
      y = (i * 43 + 210) % 520;
    star(c, x, y + (reduced ? 0 : Math.sin(time + i) * 2), "#fbf5d9", 3);
  }
}
export function renderGame(
  c: CanvasRenderingContext2D,
  g: Game,
  reduced: boolean,
) {
  const l = g.level,
    p = g.player,
    t = reduced ? 0 : g.time;
  const camera = Math.max(0, Math.min(l.width - W, p.x - W * 0.32));
  c.fillStyle = l.sky;
  c.fillRect(0, 0, W, H);
  // Distinct worlds, with layered rolling silhouettes and architectural landmarks.
  ellipse(c, 780, 85, 42, 42, g.index === 5 ? "#f8efd9" : "#fff0bd");
  ellipse(c, 780, 85, 62, 62, "#fff3ca19");
  for (let i = 0; i < 5; i++)
    cloud(
      c,
      ((i * 280 - camera * 0.13 + 230) % 1350) - 120,
      75 + (i % 3) * 37,
      0.65 + (i % 2) * 0.3,
    );
  for (let i = 0; i < 8; i++) {
    const x = i * 290 - camera * 0.2;
    ellipse(c, x, 470, 245, 200, l.leaf + "28");
    ellipse(c, x + 100, 490, 150, 145, l.leaf + "32");
  }
  for (let i = 0; i < 14; i++) {
    const x = i * 190 - camera * 0.43;
    if (g.index === 3 || g.index === 6) {
      round(c, x, 210 + (i % 3) * 30, 44, 245, 12, l.leaf + "33");
      round(c, x - 8, 203 + (i % 3) * 30, 60, 12, 4, l.leaf + "44");
      ellipse(c, x + 22, 230 + (i % 3) * 30, 10, 10, l.sky);
    } else if (g.index === 4) {
      round(c, x, 320, 80, 135, 8, l.leaf + "44");
      c.fillStyle = l.leaf + "44";
      c.beginPath();
      c.moveTo(x - 12, 320);
      c.lineTo(x + 40, 260);
      c.lineTo(x + 92, 320);
      c.fill();
    } else tree(c, x, 455, 0.9 + (i % 3) * 0.25, l.leaf + "50");
  }
  c.save();
  c.translate(-camera, 0);
  // Reflective water runs underneath the stepping stones.
  if (g.index === 1 || g.index === 5) {
    c.fillStyle = "#579caa";
    c.fillRect(0, 475, l.width, 80);
    for (let i = 0; i < 85; i++)
      line(
        c,
        i * 37 + Math.sin(t + i) * 4,
        483 + (i % 4) * 13,
        i * 37 + 23,
        483 + (i % 4) * 13,
        "#c3eee078",
        2,
      );
  }
  for (const s of l.platforms) {
    if (s.broken !== undefined && s.broken > 0.6) continue;
    const ground = s.h > 50;
    round(c, s.x, s.y, s.w, s.h, ground ? 0 : 5, ground ? l.leaf : l.ink);
    round(
      c,
      s.x,
      s.y,
      s.w,
      ground ? 12 : 5,
      ground ? 0 : 3,
      ground ? "#b4c681" : l.accent,
    );
    if (ground) {
      for (let i = 0; i < s.w; i += 24) {
        line(c, s.x + i, s.y + 6, s.x + i + 4, s.y - 3, l.leaf, 2);
        ellipse(c, s.x + i + 11, s.y + 30 + (i % 47), 2, 2, "#ffffff25");
      }
      for (let i = 0; i < s.w; i += 70)
        ellipse(c, s.x + i + 25, s.y + 70, 12, 5, "#31534716");
    }
    if (s.kind === "spring") {
      c.strokeStyle = "#ffa6b0";
      c.lineWidth = 3;
      c.beginPath();
      for (let i = 0; i < 6; i++)
        c.lineTo(s.x + 7 + i * 10, s.y + 6 + (i % 2) * 9);
      c.stroke();
    }
    if (s.kind === "conveyor")
      for (let x = s.x + 10; x < s.x + s.w; x += 22) {
        line(c, x, s.y + 5, x + 7 * (s.direction ?? 1), s.y + 9, "#8b6951", 2);
      }
    if (s.kind === "crumble") {
      for (let x = s.x + 12; x < s.x + s.w; x += 35)
        line(c, x, s.y + 3, x + 8, s.y + 17, "#ffebc285");
      if (s.broken !== undefined)
        line(c, s.x + 3, s.y + 10, s.x + s.w - 3, s.y + 13, "#fff", 2);
    }
  }
  for (const h of l.hazards) {
    const active = !h.period || g.time % h.period > 1.5;
    round(c, h.x, h.y + 16, h.w, 8, 3, "#683e47");
    for (let i = 0; i < 4; i++) {
      const x = h.x + 6 + i * 12;
      if (active) {
        ellipse(c, x, h.y + 7, 5, 15, l.accent);
        ellipse(c, x, h.y + 14, 3, 8, "#fff3b3");
      } else ellipse(c, x, h.y + 20, 3, 2, "#b96564");
    }
  }
  for (const item of l.pickups) {
    if (g.collected.has(item.id)) continue;
    const x = item.x + item.w / 2,
      y = item.y + item.h / 2 + Math.sin(t * 3 + item.x) * 3;
    if (item.kind === "mote") {
      ellipse(c, x, y, 7, 9, "#ffe095");
      ellipse(c, x - 1, y - 2, 3, 5, "#fff0bf");
    }
    if (item.kind === "seal") {
      ellipse(c, x, y, 12, 12, "#416e8b");
      ellipse(c, x, y, 9, 9, "#bbe5eb");
      ellipse(c, x + 4, y - 3, 7, 7, l.sky);
      star(c, x - 3, y + 2, "#fff", 3);
    }
    if (item.kind === "sail") {
      ellipse(c, x, y, 21, 21, "#fff5df38");
      c.save();
      c.translate(x, y);
      c.rotate(0.4);
      ellipse(c, 0, 0, 7, 16, "#fffcdb");
      line(c, 0, 15, 0, -10, "#81bbae", 2);
      for (let j = -7; j < 10; j += 5) line(c, 0, j, 5, j - 4, "#81bbae", 1);
      c.restore();
    }
    if (item.kind === "heart") {
      c.fillStyle = "#ef9b97";
      c.font = "25px Georgia";
      c.fillText("♥", x - 12, y + 9);
    }
    if (item.kind === "beacon") {
      ellipse(c, x, y, 27, 30, "#d5f7ff30");
      round(c, item.x, item.y + 8, 28, 32, 8, "#6aa6b2");
      star(c, x, y, "#d9f9ff", 13);
    }
  }
  for (const e of l.enemies) {
    if (!e.alive) continue;
    ellipse(c, e.x + 17, e.y + 23, 21, 4, "#274c5020");
    for (let j = 0; j < 3; j++)
      line(
        c,
        e.x + 4 + j * 10,
        e.y + 20,
        e.x + j * 10 + Math.sin(t * 10 + j) * 3,
        e.y + 27,
        "#3f5a62",
        2,
      );
    ellipse(c, e.x + 17, e.y + 12, 17, 12, "#c78076");
    ellipse(c, e.x + 17, e.y + 6, 11, 5, "#e1a295");
    line(c, e.x + 17, e.y + 4, e.x + 17, e.y + 22, "#8d565f", 1);
    ellipse(c, e.x + (e.speed > 0 ? 28 : 6), e.y + 12, 4, 5, "#f6ead0");
    ellipse(c, e.x + (e.speed > 0 ? 30 : 4), e.y + 11, 2, 2, "#35555c");
  }
  // Waystone and destination are tangible landmarks.
  round(c, l.checkpoint, 417, 28, 33, 9, g.checkpoint ? "#85bfa5" : "#a9b2a2");
  star(c, l.checkpoint + 14, 431, g.checkpoint ? "#fff3b0" : "#dfe5d0", 7);
  lantern(c, l.exit + 26, 450, g.status === "won");
  if (g.index === 6) {
    round(c, 2050, 373, 88, 77, 20, "#678c96");
    ellipse(c, 2094, 387, 36, 36, "#41677b");
    ellipse(c, 2094, 387, 27, 27, g.beacons === 3 ? "#ffe095" : "#98c0c9");
    star(c, 2094, 387, "#f9edb7", 18);
  }
  // Mica: a seed-shaped courier, teal hood, coral scarf and tiny satchel.
  if (p.invulnerable <= 0 || Math.floor(g.time * 12) % 2 === 0) {
    const x = p.x + p.w / 2,
      y = p.y + p.h;
    ellipse(c, x, y + 2, 19, 4, "#264c4e25");
    c.save();
    c.translate(x, y);
    c.scale(p.facing, 1);
    const run = p.grounded ? Math.sin(t * 17) * 4 : 2;
    line(c, -5, -4, -7 - run, 0, "#315557", 5);
    line(c, 5, -4, 6 + run, 0, "#315557", 5);
    round(c, -11, -24, 22, 23, 8, "#e8b67d");
    round(c, -10, -37, 22, 26, 11, "#356d68");
    ellipse(c, 3, -25, 9, 9, "#fff1ce");
    ellipse(c, 8, -27, 2, 2, "#305255");
    round(c, -13, -15, 12, 13, 3, "#b97166");
    line(c, -7, -16, 14, -16, "#f0a194", 5);
    line(c, -7, -16, -19 - Math.sin(t * 10) * 3, -12, "#f0a194", 4);
    if (p.sail && !p.grounded && g.jumpHeld && p.vy > 0) {
      c.fillStyle = "#fff2c3";
      c.beginPath();
      c.moveTo(-29, -33);
      c.quadraticCurveTo(0, -63, 31, -33);
      c.lineTo(0, -36);
      c.fill();
      line(c, -29, -33, -7, -18, "#85a79a", 1);
      line(c, 31, -33, 9, -18, "#85a79a", 1);
    }
    c.restore();
  }
  // Flowers and foreground reeds add depth without obscuring the route.
  for (let i = 0; i < l.width; i += 79) {
    if (l.platforms.some((s) => s.h > 50 && i >= s.x && i < s.x + s.w)) {
      line(c, i + 11, 450, i + 8, 438, l.ink + "88", 2);
      ellipse(c, i + 8, 438, 4, 3, l.accent);
    }
  }
  c.restore();
  if (g.index === 6) {
    c.fillStyle = l.ink;
    c.font = "bold 11px system-ui";
    c.fillText(`DAWN BEACONS  ${g.beacons} / 3`, 22, 28);
  }
}
