import { test } from "node:test";
import assert from "node:assert/strict";
import { createGame, step, DT, type Input } from "../src/simulation.ts";
const idle: Input = { left: false, right: false, jump: false };
const running = { ...idle, right: true, run: true };
function advance(
  g: ReturnType<typeof createGame>,
  seconds: number,
  input: Input = idle,
) {
  for (let i = 0; i < seconds / DT; i++) step(g, input);
}
function runway() {
  const g = createGame(2);
  g.level.platforms = [{ x: 0, y: 450, w: g.level.width, h: 130 }];
  g.level.enemies = [];
  g.level.pickups = [];
  g.player.sail = true;
  return g;
}
function launch() {
  const g = runway();
  advance(g, 1.7, running);
  assert.equal(g.player.power, 1);
  step(g, { ...running, jump: true });
  return g;
}
test("walking and held running have distinct capped speeds; only real full-speed ground travel charges power", () => {
  const walk = runway(),
    run = runway();
  advance(walk, 0.6, { ...idle, right: true });
  advance(run, 0.6, running);
  assert.equal(walk.player.vx, 170);
  assert.equal(run.player.vx, 290);
  assert.equal(walk.player.power, 0);
  assert.ok(run.player.power > 0);
  advance(run, 1.1, running);
  assert.equal(run.player.power, 1);
  const blocked = runway();
  blocked.level.platforms.push({ x: 190, y: 0, w: 20, h: 450 });
  advance(blocked, 3, running);
  assert.equal(blocked.player.vx, 0);
  assert.equal(blocked.player.power, 0);
  const edge = runway();
  edge.player.x = edge.level.width - edge.player.w;
  advance(edge, 3, running);
  assert.equal(edge.player.power, 0);
});
test("braking/reversing drains power and cannot trigger an immediate opposite-direction takeoff", () => {
  const g = runway();
  advance(g, 1.7, running);
  step(g, { ...idle, left: true, run: true });
  assert.ok(g.player.power < 1);
  step(g, { ...idle, left: true, run: true, jump: true });
  assert.equal(g.player.flight, 0);
  advance(g, 0.5, idle);
  assert.equal(g.player.power, 0);
});
test("standing jumps and fast jumps without the sail never gain powered ascent", () => {
  const standing = runway();
  step(standing, { ...idle, jump: true, run: true });
  assert.equal(standing.player.flight, 0);
  const plain = runway();
  plain.player.sail = false;
  advance(plain, 1.7, running);
  step(plain, { ...running, jump: true });
  assert.equal(plain.player.flight, 0);
});
test("a charged takeoff permits new-press flaps for only a bounded three seconds; holding does not repeat them", () => {
  const taps = launch(),
    held = launch();
  assert.ok(taps.player.flight > 2.9);
  let flaps = 0;
  for (let i = 0; i < 300; i++) {
    const jump = i % 24 === 12;
    step(taps, { ...running, jump });
    flaps += Number(taps.events.includes("flap"));
    step(held, { ...running, jump: true });
  }
  assert.ok(flaps > 5);
  assert.ok(taps.player.y < held.player.y - 100);
  assert.equal(taps.player.power, 0);
  advance(taps, 0.6, { ...running, jump: true });
  assert.equal(taps.player.flight, 0);
  const y = taps.player.y;
  step(taps, { ...running, jump: false });
  step(taps, { ...running, jump: true });
  assert.equal(taps.player.flight, 0);
  assert.ok(taps.player.y >= y);
  assert.ok(taps.player.vy <= 120);
});
test("powered flight, charged speed and flap animation clear on landing, hurt and retry", () => {
  const g = launch();
  g.player.y = 415;
  g.player.vy = 200;
  step(g, idle);
  assert.equal(g.player.grounded, true);
  assert.equal(g.player.flight, 0);
  const injured = launch();
  injured.level.enemies = [
    {
      x: injured.player.x,
      y: injured.player.y,
      w: 34,
      h: 34,
      origin: injured.player.x,
      range: 0,
      speed: 0,
      alive: true,
    },
  ];
  step(injured, idle);
  assert.equal(injured.player.hearts, 2);
  assert.equal(injured.player.flight, 0);
  assert.equal(injured.player.power, 0);
  const retry = launch();
  retry.player.y = 700;
  step(retry, idle);
  assert.equal(retry.player.flight, 0);
  assert.equal(retry.player.power, 0);
  assert.equal(retry.player.flap, 0);
});
test("upper flight landing admits ascent from below and supports a descending courier", () => {
  const g = createGame(2);
  g.level.enemies = [];
  const sky = g.level.platforms.find((p) => p.oneWay)!;
  assert.ok(sky);
  g.player.x = sky.x + 50;
  g.player.y = sky.y + 5;
  g.player.vy = -200;
  g.player.grounded = false;
  g.player.coyote = 0;
  advance(g, 0.1, idle);
  assert.ok(g.player.y < sky.y + 5);
  g.player.y = sky.y - g.player.h - 2;
  g.player.vy = 120;
  step(g, idle);
  step(g, idle);
  assert.equal(g.player.y, sky.y - g.player.h);
  assert.equal(g.player.grounded, true);
});

test("the Glass Orchard cloud seal is reachable from entry by run and timed jump inputs without fixtures", () => {
  const g = createGame(2);
  let launched = false,
    flapping = true,
    landed = false,
    flaps = 0;
  for (let frame = 0; frame < 2400; frame++) {
    const p = g.player;
    let jump = false;
    if (!launched && p.power === 1 && p.sail) {
      launched = true;
      jump = true;
    } else if (launched) {
      if (p.y < 20) flapping = false;
      jump = flapping ? frame % 30 === 0 : p.vy > 0 && !p.grounded;
    }
    step(g, { left: p.x > 1120, right: p.x < 1090, run: true, jump });
    flaps += Number(g.events.includes("flap"));
    if (g.collected.has("2-seal") && p.grounded) {
      landed = true;
      break;
    }
  }
  assert.ok(launched);
  assert.ok(flaps >= 3);
  assert.ok(landed);
  assert.equal(g.player.y, 76);
  assert.equal(g.deaths, 0);
  assert.equal(g.level.pickups.filter((p) => p.kind === "mote").length, 28);
  assert.equal(g.level.pickups.filter((p) => p.kind === "seal").length, 1);
});
