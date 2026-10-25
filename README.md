# Lantern Vale

A complete original browser platformer: guide Mica, a little courier with a coral scarf, through six distinct trails and the Dawn Engine finale. Restore seven lanterns, find optional moon seals, and bring morning home.

The inspiration is the feel of a classic world-map platform adventure. All characters, scenery, layouts, graphics and procedural sound effects are original. No Nintendo assets, names, music, or layouts are included in the game.

## Play

The production build is served at **http://127.0.0.1:5209**. This is a loopback-only session process. It has no boot or login autostart and does not publish the game online. The repository is private.

- Walk: **A / D** or **left / right arrows**. Hold **Shift / X** or the **Hold Run** button to accelerate and fill run power.
- Jump: **Space / W / Up**. Hold for a high jump, release for a hop.
- With a sail feather and full run power, jump while running, then tap jump repeatedly for three seconds of powered ascent. Hold jump while falling to glide after power ends.
- Glass Orchard has an optional cloud landing and moon seal above the lower route.
- Pause: **P / Escape** or the Pause button.
- Restart clears the current expedition. World map cancels the expedition.
- Touch/pointer controls are below the game. Mute and reduced-motion controls are in the header.

There are no limited lives. Falls restore the current waystone. Collected expedition rewards and the sail remain after retry. Completed lanterns, best mote totals and earned moon seals save on this browser/device. Each unlocked trail can be replayed. Optional collectibles are never required to unlock a trail.

## Local commands

Requires Node 24 and npm. From this directory:

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run serve:detached
```

Exact restart/start command, after a machine restart or server exit:

```sh
cd /Users/intrepion/Documents/Codex/2026-10-11/task-25/kata-inspired-by-super-mario-bros-3-codex-dot && npm run build && npm run serve:detached
```

The detached starter reports an existing Lantern Vale server without creating a duplicate. The server reads the current `dist` files on every request, so rebuilding updates the running production server. Logs: `/tmp/lantern-vale-5209.log`. Session PID: `/tmp/lantern-vale-5209.pid`. To run in a terminal instead, use `npm run preview` after port 5209 is free. Development: `npm run dev` (same strict port; stop the production process first). Other projects and ports 5173–5208 are untouched.

## Campaign

| Trail          | Lesson                                               |
| -------------- | ---------------------------------------------------- |
| First Light    | Running, variable jumps, beetle stomps               |
| Reedwater      | Safe spring introduction, then water crossings       |
| Glass Orchard  | Sail feather, airborne wind, optional high route     |
| Clockwork Rise | Conveyors in both directions                         |
| Ember Kiln     | Crumbling ledges over safe floor; timed cinder vents |
| Moonwood       | Springs, gaps, enemies and alternate canopy route    |
| Dawn Engine    | Three beacons and the campaign ending                |

## Engineering evidence

[Run/flight fidelity evidence and normal-input acceptance](docs/FLIGHT_FIDELITY.md), [Specification](docs/SPEC.md), [domain glossary](GLOSSARY.md), [decision record](docs/adr/0001-deterministic-campaign.md), [QA evidence and limits](docs/QA.md), and [independent reviews](docs/REVIEWS.md).

`src/simulation.ts` is the deterministic public simulation boundary. `src/levels.ts` defines original trails; rendering, audio and persistence live in separate modules. The 120 Hz clock caps elapsed time and drops its accumulator on pause. The browser clears key and pointer input on blur/visibility loss and requires explicit resume. Rectangular collision surfaces use substeps no longer than eight pixels. Slopes and moving platforms are intentionally outside this compact campaign.

GitHub Actions runs tests, strict type checking, a production build, and dependency audit on every push.

## Play online

[Play the hosted game](https://intrepion.github.io/kata-inspired-by-super-mario-bros-3-codex-dot/)
