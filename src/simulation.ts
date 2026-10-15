import { makeLevel, type Level, type Rect, type Surface } from "./levels.ts";
export type Input = {
  left: boolean;
  right: boolean;
  jump: boolean;
  run?: boolean;
};
export type Player = Rect & {
  vx: number;
  vy: number;
  grounded: boolean;
  coyote: number;
  buffer: number;
  hearts: number;
  invulnerable: number;
  sail: boolean;
  facing: number;
  power: number;
  flight: number;
  flap: number;
};
export type Game = {
  level: Level;
  index: number;
  player: Player;
  time: number;
  checkpoint: boolean;
  collected: Set<string>;
  beacons: number;
  deaths: number;
  status: "playing" | "won";
  events: string[];
  jumpHeld: boolean;
};
export const DT = 1 / 120;
export function createGame(index: number): Game {
  return {
    level: makeLevel(index),
    index,
    player: {
      x: 60,
      y: 416,
      w: 28,
      h: 34,
      vx: 0,
      vy: 0,
      grounded: true,
      coyote: 0.1,
      buffer: 0,
      hearts: 3,
      invulnerable: 0,
      sail: false,
      facing: 1,
      power: 0,
      flight: 0,
      flap: 0,
    },
    time: 0,
    checkpoint: false,
    collected: new Set(),
    beacons: 0,
    deaths: 0,
    status: "playing",
    events: [],
    jumpHeld: false,
  };
}
export const overlaps = (a: Rect, b: Rect) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
export function retry(g: Game) {
  const p = g.player;
  const desired = g.checkpoint ? g.level.checkpoint : 60;
  const ground = g.level.platforms.find((s) => s.h > 50 && s.x + s.w > desired);
  p.x = ground ? Math.max(desired, ground.x) : 60;
  p.y = (ground?.y ?? 450) - p.h;
  p.vx = p.vy = 0;
  p.hearts = 3;
  p.invulnerable = 1.4;
  p.grounded = true;
  p.buffer = 0;
  p.coyote = 0.1;
  p.power = p.flight = p.flap = 0;
  g.jumpHeld = false;
  g.deaths++;
  g.events.push("retry");
}
function hurt(g: Game) {
  const p = g.player;
  if (p.invulnerable > 0) return;
  p.hearts--;
  p.power = p.flight = p.flap = 0;
  p.invulnerable = 1.4;
  p.vx = -p.facing * 180;
  p.vy = -220;
  g.events.push("hurt");
  if (p.hearts === 0) retry(g);
}
function move(
  p: Player,
  amount: number,
  axis: "x" | "y",
  platforms: Surface[],
  g: Game,
  dt: number,
) {
  const parts = Math.max(1, Math.ceil(Math.abs(amount) / 8));
  for (let i = 0; i < parts; i++) {
    const previousBottom = p.y + p.h;
    p[axis] += amount / parts;
    for (const s of platforms) {
      if ((s.broken !== undefined && s.broken > 0.6) || !overlaps(p, s))
        continue;
      if (
        s.oneWay &&
        (axis === "x" || amount <= 0 || previousBottom > s.y + 0.01)
      )
        continue;
      if (axis === "x" && (s.kind === "spring" || s.kind === "conveyor"))
        continue;
      if (axis === "x") {
        p.x = amount > 0 ? s.x - p.w : s.x + s.w;
        p.vx = 0;
      } else if (amount > 0) {
        p.y = s.y - p.h;
        p.vy = 0;
        p.grounded = true;
        if (s.kind === "spring") {
          p.vy = -800;
          p.grounded = false;
          g.events.push("spring");
        }
        if (s.kind === "conveyor") p.x += (s.direction ?? 1) * 90 * dt;
        if (s.kind === "crumble" && s.broken === undefined) s.broken = 0;
      } else {
        p.y = s.y + s.h;
        p.vy = 0;
        g.events.push("bump");
      }
    }
  }
}
function takeoff(g: Game, input: Input) {
  const p = g.player,
    direction = Number(input.right) - Number(input.left);
  const powered =
    p.sail &&
    p.power >= 1 &&
    input.run &&
    direction !== 0 &&
    Math.sign(p.vx) === direction &&
    Math.abs(p.vx) >= 270;
  p.vy = -570;
  p.grounded = false;
  p.coyote = 0;
  p.buffer = 0;
  p.power = 0;
  p.flight = 0;
  if (powered) {
    p.flight = 3;
    p.flap = 0.18;
    g.events.push("flight");
  }
  g.events.push("jump");
}
export function step(g: Game, input: Input, dt = DT) {
  if (g.status !== "playing") return;
  // The public seam accepts a bounded step, never elapsed wall time.
  dt = Math.min(Math.max(dt, 0), DT);
  if (dt === 0) return;
  g.events = [];
  g.time += dt;
  const p = g.player;
  p.invulnerable = Math.max(0, p.invulnerable - dt);
  p.flight = Math.max(0, p.flight - dt);
  p.flap = Math.max(0, p.flap - dt);
  p.buffer = Math.max(0, p.buffer - dt);
  p.coyote = p.grounded ? 0.1 : Math.max(0, p.coyote - dt);
  const jumpPressed = input.jump && !g.jumpHeld;
  if (jumpPressed) p.buffer = 0.12;
  if (jumpPressed && p.flight > 0 && !p.grounded) {
    p.vy = Math.min(p.vy, -280);
    p.flap = 0.18;
    p.buffer = 0;
    g.events.push("flap");
  }
  if (!input.jump && g.jumpHeld && p.vy < -200 && p.flight === 0) p.vy = -200;
  g.jumpHeld = input.jump;
  if (p.buffer > 0 && p.coyote > 0) {
    takeoff(g, input);
  }
  const direction = Number(input.right) - Number(input.left);
  if (direction) p.facing = direction;
  const target = direction * (input.run ? 290 : 170);
  const acceleration = (direction ? 1900 : 2400) * dt;
  p.vx += Math.max(-acceleration, Math.min(acceleration, target - p.vx));
  const previousBottom = p.y + p.h;
  p.vy = Math.min(
    p.vy + (p.flight > 0 ? 850 : 1500) * dt,
    p.sail && input.jump && p.vy > 0 ? 120 : 720,
  );
  const drift = p.grounded ? 0 : g.level.wind;
  p.grounded = false;
  move(p, (p.vx + drift) * dt, "x", g.level.platforms, g, dt);
  const unclampedX = p.x;
  p.x = Math.max(0, Math.min(g.level.width - p.w, p.x));
  if (p.x !== unclampedX) p.vx = 0;
  move(p, p.vy * dt, "y", g.level.platforms, g, dt);
  if (p.grounded) {
    p.flight = 0;
    p.flap = 0;
  }
  if (p.grounded && p.buffer > 0) {
    takeoff(g, input);
  }
  if (p.grounded) {
    const charging =
      !!input.run &&
      direction !== 0 &&
      Math.sign(p.vx) === direction &&
      Math.abs(p.vx) >= 270;
    const before = p.power;
    p.power = Math.max(0, Math.min(1, p.power + (charging ? 0.7 : -2) * dt));
    if (before < 1 && p.power === 1) g.events.push("power-ready");
  } else p.power = 0;
  for (const s of g.level.platforms)
    if (s.broken !== undefined) {
      s.broken += dt;
      if (s.broken > 3) s.broken = undefined;
    }
  for (const e of g.level.enemies) {
    if (!e.alive) continue;
    e.x += e.speed * dt;
    if (Math.abs(e.x - e.origin) > e.range) e.speed = -e.speed;
    if (overlaps(p, e)) {
      if (p.vy > 0 && previousBottom <= e.y + 10) {
        e.alive = false;
        p.vy = -410;
        g.events.push("stomp");
      } else hurt(g);
    }
  }
  for (const h of g.level.hazards)
    if ((!h.period || g.time % h.period > 1.5) && overlaps(p, h)) hurt(g);
  for (const item of g.level.pickups) {
    if (g.collected.has(item.id) || !overlaps(p, item)) continue;
    g.collected.add(item.id);
    g.events.push(item.kind);
    if (item.kind === "sail") p.sail = true;
    if (item.kind === "heart") p.hearts = Math.min(3, p.hearts + 1);
    if (item.kind === "beacon") g.beacons++;
  }
  if (!g.checkpoint && p.x >= g.level.checkpoint && p.grounded) {
    g.checkpoint = true;
    g.events.push("checkpoint");
  }
  if (p.y > 600) retry(g);
  if (p.x >= g.level.exit && (g.index !== 6 || g.beacons === 3)) {
    g.status = "won";
    g.events.push("win");
  }
}
export class FixedClock {
  private accumulated = 0;
  advance(elapsed: number, run: (dt: number) => void) {
    this.accumulated += Math.min(Math.max(elapsed, 0), 0.1);
    while (this.accumulated >= DT) {
      run(DT);
      this.accumulated -= DT;
    }
  }
  reset() {
    this.accumulated = 0;
  }
}
