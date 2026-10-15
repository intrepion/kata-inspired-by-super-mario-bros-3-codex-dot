# Super Mario Bros. 3 focused native acceptance — 2026-10-15

Origin: http://fidelity-oblivion-20261015.localhost:5209/. Dedicated Chrome QA tab 222225555; existing user/root/Witness tabs and saves untouched. Side-following camera with visible vertical follow during high ascent. Ordinary A/D walking, Shift/X running, Space variable jump, fresh Space flaps, held falling Space gliding, Escape pause and rendered map/restart buttons. No page/game-state injection, time manipulation or source changes during acceptance.

From the fresh map, completed First Light with ordinary run/jumps: 21/28 motes, zero retries, seven seconds, three hearts. Completed Reedwater: 17/28, zero retries, seven seconds, two hearts. These legitimate wins unlocked Glass Orchard. Screenshots: first-light-complete.jpg and reedwater-complete.jpg.

In Glass Orchard, running acquired the feather and built full power. An inspection/release between separate native holds drained power before takeoff; that attempt produced a regular jump. A second exploratory hold sequence also failed to express the continuous run-up. Restart trail was used for clean attempts, preserving completed-trail progress. Physics was unchanged. The supported same-call queued native presses below preserved the run-up into the jump and visibly produced FLIGHT 2.9s, sail and three hearts (queued-takeoff.jpg):

```js
const runUp = qaTab.pressKey(null, 'd+x', { durationMs: 1700 });
const takeoff = qaTab.pressKey(null, 'd+x+space', { durationMs: 100 });
await Promise.all([runUp, takeoff]);
await qaTab.pressKey(null, 'Escape');
await qaTab.getAXState();
```

Both calls are documented normal native pressKey inputs, queued through the same supported API. No hidden events, direct model calls or alternate input transport were used. After resuming, seven right/run flap cycles (70ms with Space, 140ms released) visibly ascended to the cloud height; FLIGHT decreased to 0.9s (powered-ascent.jpg). Two left/run flap cycles braked the courier, then held Space glided down. The courier visibly landed on the cream one-way cloud; power/flight reset to RUN 0%, sail remained and three hearts remained (cloud-landing.jpg). A brief left walk on the cloud and a running held-Space jump to the exit completed the route.

The actual result read “Glass Orchard is restored. A new path is waiting.”, “8 / 28 motes · Moon seal found” and “0 retries · 9 seconds” (glass-orchard-complete.jpg). The seal toast was not captured in isolation; the completion result is the explicit reward evidence. World map, then actual browser reload, retained 3/7 lit, 46 motes, 1/7 seals, Glass Orchard 8 motes/seal found, First Light 21 and Reedwater 17, and newly available Clockwork Rise (map-reloaded.jpg).

Existing checks: 35 tests, strict TypeScript, production build and diff check passed; independent Standards and Specification reviews passed. Seven-exit and movement-only cloud solvers are separate automated evidence. Native coverage is the first two legitimate unlocks and powered ascent→cloud landing/seal→exit→reload. Manual exploratory Restart trail attempts are described above; the successful Glass Orchard expedition itself reported zero retries. Native fall/retry retention, simultaneous pointer/keyboard Run, all touch controls, denied standing/air takeoff and all seven levels were not exhaustively replayed; strict edge coverage remains automated/review evidence. No full campaign or exact original physics claim. Dedicated QA tab was closed after verification, browser access explicitly released and previews left running.


## Local evidence locations

Evidence directory: `qa/fidelity-2026-10-15/`. The record above is copied from the central project acceptance file.

- [queued-takeoff.jpg](qa/fidelity-2026-10-15/queued-takeoff.jpg)
- [glass-orchard-complete.jpg](qa/fidelity-2026-10-15/glass-orchard-complete.jpg)
- [map-reloaded.jpg](qa/fidelity-2026-10-15/map-reloaded.jpg)

## Included native captures

- [queued-takeoff.jpg](qa/fidelity-2026-10-15/queued-takeoff.jpg)
- [glass-orchard-complete.jpg](qa/fidelity-2026-10-15/glass-orchard-complete.jpg)
- [map-reloaded.jpg](qa/fidelity-2026-10-15/map-reloaded.jpg)
