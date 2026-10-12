# Lantern Vale specification

Authorized defaults replace the Grill interview; the user explicitly requested autonomous decisions. Design tree: original courier/valley → seven sequential trails → base-jump-winnable routes → optional sail shortcuts → deterministic simulation → saved completed trails, replay and optional seals. No unresolved design questions.

## Campaign
1. First Light: teach acceleration, variable jump, motes and stomping beetles.
2. Reedwater: teach short gaps and springs before combining them.
3. The Glass Orchard: teach sail power on an optional upper route; base route stays accessible.
4. Clockwork Rise: teach conveyors, then staggered ledges.
5. Ember Kiln: teach crumble ledges above a safe floor, then timed cinder vents.
6. Moonwood: combine safe gaps, enemies, springs and sail shortcuts.
7. The Dawn Engine: restore three beacons along the final trail, then reach the engine to end the campaign.

## Movement and contacts
120 Hz simulation; speed approaches 290 px/s with acceleration and braking. Jump speed 570, gravity 1500; early release cuts upward velocity. Coyote time 100 ms, jump buffer 120 ms. Falling with sail and held jump caps speed at 120. Axis movement substeps at most 8 px prevent tunneling. Downward contact lands, upward contact stops at a ceiling, side contact cannot penetrate a wall. Downward enemy contact bounces and defeats it; side contact costs a heart with 1.4 seconds protection. Hazards use the same protection. Zero hearts or falls restore the waystone, hearts, and temporary invulnerability. No lives limit.

## Progress and interface
Exit unlocks the next trail, preserves completed trails and best mote/seal results. Map replay remains available. Three finale beacons required for ending. Optional collectibles are unnecessary for unlocks. Corrupt or incompatible saves reset gracefully. No storage availability must never block play. Restart creates a fresh expedition; return to map cancels an attempt. Pause is explicit after focus loss; clear keys and accumulated time. No time advancement while paused/hidden. Keyboard A/D or arrows, Space/W/Up jump, P/Escape pause. Touch controls have pointer capture/cancel handling. Buttons remain accessible in narrow layout. Reduced motion and mute are available.

## Agreed test seams
Simulation public createGame/step, FixedClock, and save parse/record functions. Red/green slices verify collisions and progression before rendering. Tests cover input interruption, time caps, jump buffering/coyote, contacts, invulnerability, powers, retries, exits, collectible identity, beacons and corrupt saves. Scripted route simulations are distinct from actual Chrome gameplay; browser completion uses ordinary controls without hidden-state changes.

## Standards
Strict TypeScript, simulation/render/input/persistence boundaries, no external runtime dependencies or copyrighted assets. Never modify another project's servers. QA reports limitations candidly.
