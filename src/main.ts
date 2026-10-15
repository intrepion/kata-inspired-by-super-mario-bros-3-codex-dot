import "./style.css";
import {
  createGame,
  step,
  FixedClock,
  type Game,
  type Input,
} from "./simulation.ts";
import {
  freshProgress,
  parseProgress,
  recordWin,
  isUnlocked,
  type Progress,
} from "./save.ts";
import { LEVEL_NAMES } from "./levels.ts";
import { renderGame, renderMap, nodes } from "./render.ts";
import { tone } from "./audio.ts";
const $ = <T extends HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const canvas = $<HTMLCanvasElement>("game"),
  ctx = canvas.getContext("2d")!;
const overlay = $("overlay");
let progress: Progress = freshProgress();
let storageWorks = true;
try {
  progress = parseProgress(localStorage.getItem("lantern-vale-v1"));
} catch {
  storageWorks = false;
}
let game: Game | undefined;
let mode: "map" | "play" | "pause" | "win" = "map";
let sound = false;
let reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clock = new FixedClock();
const held = new Map<string, string>();
const pointers = new Map<number, string>();
let last = performance.now(),
  toastUntil = 0;
function clearInputs() {
  held.clear();
  pointers.clear();
  document
    .querySelectorAll("[data-key]")
    .forEach((el) => el.classList.remove("active"));
  if (game) game.jumpHeld = false;
  clock.reset();
}
function showToast(text: string) {
  $("toast").textContent = text;
  $("toast").classList.add("visible");
  toastUntil = performance.now() + 2300;
}
function persist() {
  try {
    localStorage.setItem("lantern-vale-v1", JSON.stringify(progress));
  } catch {
    storageWorks = false;
    showToast("Storage unavailable — keep this tab open for your journey.");
  }
}
function stats() {
  if (!game) return;
  $("hearts").textContent =
    "♥ ".repeat(game.player.hearts) + "♡ ".repeat(3 - game.player.hearts);
  $("motes").textContent =
    `✦ ${game.level.pickups.filter((p) => p.kind === "mote" && game!.collected.has(p.id)).length}`;
  const p = game.player;
  $("power").textContent =
    p.flight > 0
      ? `FLIGHT ${p.flight.toFixed(1)}s · TAP JUMP`
      : p.power === 1
        ? p.sail
          ? "POWER FULL · TAP JUMP"
          : "POWER FULL · NO SAIL"
        : `RUN ${Math.floor(p.power * 100)}% · ${p.sail ? "SAIL" : "NO SAIL"}`;
  $("power").setAttribute(
    "aria-label",
    p.flight > 0
      ? `Powered flight ${p.flight.toFixed(1)} seconds remaining. Tap jump to flap.`
      : `Run power ${Math.floor(p.power * 100)} percent. ${p.sail ? "Sail equipped." : "Find a sail feather to fly."}`,
  );
}
function map() {
  clearInputs();
  game = undefined;
  mode = "map";
  $("trail-number").textContent = "YOUR JOURNEY";
  $("trail-name").textContent = "The paths of Lantern Vale";
  $("hearts").textContent = `${progress.completed.length} / 7 lit`;
  $("motes").textContent = `✦ ${progress.best.reduce((a, b) => a + b, 0)}`;
  $("power").textContent = `☾ ${progress.seals.length} / 7`;
  $("hint").textContent =
    "Choose a trail. Your completed paths are always open for another visit.";
  overlay.innerHTML = `<div class="map-panel"><div class="map-heading"><p class="eyebrow">A COURIER’S FIELD MAP</p><h2>${progress.completed.length === 7 ? "Morning has come home." : "Follow the little lights."}</h2><p>${storageWorks ? "Your lanterns are saved on this device." : "Saving unavailable in this browser."}<br>Moon seals are optional. Curiosity is always welcome.</p></div>${LEVEL_NAMES.map((name, i) => `<button class="map-node ${progress.completed.includes(i) ? "completed" : ""}" data-level="${i}" style="left:${nodes[i][0]}%;top:${nodes[i][1]}%" ${isUnlocked(progress, i) ? "" : "disabled"} aria-label="${progress.completed.includes(i) ? "Replay" : "Enter"} ${name}"><span class="n">${progress.completed.includes(i) ? "✓" : i + 1}</span><span>${name}<small>${progress.completed.includes(i) ? `${progress.best[i]} motes · ${progress.seals.includes(i) ? "seal found" : "explore again"}` : isUnlocked(progress, i) ? "ENTER TRAIL" : "RESTORE PREVIOUS LANTERN"}</small></span></button>`).join("")}<span class="map-caption">THE LANTERN VALE POSTAL ROUTE · SEVEN PLACES TO FIND THE MORNING</span></div>`;
  overlay
    .querySelectorAll<HTMLButtonElement>("[data-level]")
    .forEach((b) =>
      b.addEventListener("click", () => start(Number(b.dataset.level))),
    );
  buttons();
}
function start(index: number) {
  if (!isUnlocked(progress, index)) return;
  clearInputs();
  game = createGame(index);
  mode = "play";
  overlay.innerHTML = "";
  $("trail-number").textContent =
    `TRAIL ${String(index + 1).padStart(2, "0")} / 07`;
  $("trail-name").textContent = game.level.name;
  $("hint").textContent = game.level.hint;
  stats();
  buttons();
  canvas.focus();
}
function buttons() {
  ($("pause") as HTMLButtonElement).disabled = !game || mode === "win";
  $("pause").textContent = mode === "pause" ? "Resume" : "Pause";
  ($("restart") as HTMLButtonElement).disabled = !game;
}
function pause() {
  if (!game || mode === "win") return;
  if (mode === "pause") {
    mode = "play";
    overlay.innerHTML = "";
    clearInputs();
    last = performance.now();
    canvas.focus();
  } else {
    mode = "pause";
    clearInputs();
    overlay.innerHTML =
      '<div class="panel"><p class="eyebrow">TAKE A BREATH</p><h2>The valley can wait.</h2><p>Your courier is safe. Resume when you are ready.</p><button id="resume" class="primary">Resume journey</button> <button id="cancel">Return to map</button></div>';
    $("resume").onclick = pause;
    $("cancel").onclick = map;
  }
  buttons();
}
function win() {
  if (!game) return;
  clearInputs();
  mode = "win";
  const motes = game.level.pickups.filter(
      (p) => p.kind === "mote" && game!.collected.has(p.id),
    ).length,
    seal = game.collected.has(`${game.index}-seal`);
  progress = recordWin(progress, game.index, motes, seal);
  persist();
  const finale = game.index === 6;
  overlay.innerHTML = `<div class="panel"><p class="eyebrow">${finale ? "ALL SEVEN LANTERNS RESTORED" : "A LITTLE MORE MORNING"}</p><h2>${finale ? "You brought the dawn home." : "One more light in the valley."}</h2><p>${finale ? "Mica’s satchel is empty. The valley is full of light.<br>Thank you for taking the long way home." : `${game.level.name} is restored. A new path is waiting.`}</p><p>✦ ${motes} / 28 motes &nbsp; · &nbsp; ${seal ? "☾ Moon seal found" : "☾ A moon seal still waits"}<br>${game.deaths} retries · ${Math.floor(game.time)} seconds</p><button id="next" class="primary">${finale ? "Explore the valley again" : "Continue journey"}</button> <button id="winmap">World map</button></div>`;
  $("next").onclick = () => (finale ? map() : start(game!.index + 1));
  $("winmap").onclick = map;
  buttons();
}
$("pause").onclick = pause;
$("restart").onclick = () => {
  if (game) start(game.index);
};
$("map").onclick = map;
$("sound").onclick = () => {
  sound = !sound;
  $("sound").textContent = sound ? "Sound on" : "Sound off";
  $("sound").setAttribute("aria-pressed", String(sound));
  tone("mote", sound);
  if (mode === "play") canvas.focus();
};
function motionLabel() {
  $("motion").textContent = reduced ? "Motion reduced" : "Motion on";
  $("motion").setAttribute("aria-pressed", String(reduced));
}
motionLabel();
$("motion").onclick = () => {
  reduced = !reduced;
  motionLabel();
  if (mode === "play") canvas.focus();
};
const keyMap: Record<string, string> = {
  ArrowLeft: "left",
  a: "left",
  A: "left",
  ArrowRight: "right",
  d: "right",
  D: "right",
  " ": "jump",
  ArrowUp: "jump",
  w: "jump",
  W: "jump",
  Shift: "run",
  x: "run",
  X: "run",
};
addEventListener("keydown", (e) => {
  if ((e.target as HTMLElement).tagName === "BUTTON" && e.key === " ") return;
  if (e.key === "Escape" || e.key.toLowerCase() === "p") {
    if (!e.repeat) pause();
    e.preventDefault();
    return;
  }
  const action = keyMap[e.key];
  if (action && mode === "play") {
    e.preventDefault();
    held.set(e.code, action);
  }
});
addEventListener("keyup", (e) => held.delete(e.code));
function input(): Input {
  const keys = [...held.values()];
  const values = [...keys, ...pointers.values()];
  return {
    left: values.includes("left"),
    right: values.includes("right"),
    jump: values.includes("jump"),
    run: values.includes("run"),
  };
}
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-key]")) {
  b.onpointerdown = (e) => {
    if (mode !== "play") return;
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, b.dataset.key!);
    b.classList.add("active");
  };
  const release = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    b.classList.remove("active");
  };
  b.onpointerup = release;
  b.onpointercancel = release;
  b.onlostpointercapture = release;
}
function focusLoss() {
  clearInputs();
  if (mode === "play") pause();
  last = performance.now();
}
addEventListener("blur", focusLoss);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) focusLoss();
});
canvas.tabIndex = 0;
map();
function frame(now: number) {
  const elapsed = (now - last) / 1000;
  last = now;
  if (mode === "play" && game && !document.hidden) {
    clock.advance(elapsed, (dt) => {
      if (mode !== "play" || !game) return;
      step(game, input(), dt);
      for (const event of game.events) {
        tone(event, sound);
        if (event === "sail")
          showToast(
            "Sail found! Run to full power, then jump and tap jump to fly.",
          );
        if (event === "power-ready" && game.player.sail)
          showToast(
            "Power full! Jump, then tap jump to flap for three seconds.",
          );
        if (event === "seal")
          showToast("Moon seal found — a secret worth the climb.");
        if (event === "checkpoint")
          showToast("Waystone lit — you will return here.");
        if (event === "beacon")
          showToast(`Dawn beacon ${game.beacons} / 3 restored`);
        if (event === "retry")
          showToast("A fresh start. The waystone remembers.");
      }
      if (game.status === "won") win();
    });
    stats();
  }
  if (game) renderGame(ctx, game, reduced);
  else renderMap(ctx, progress, reduced, now / 1000);
  if (now > toastUntil) $("toast").classList.remove("visible");
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
