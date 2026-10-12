# Lantern Vale QA evidence

Execution date: 2026-10-12. Supported local Chrome, ordinary visible arrow/Space controls and on-screen controls, production build served from loopback port 5209. No hidden state, localStorage edits, teleports, or injected completion were used for browser play. Automated native input timings and chords assisted the visible playthrough. Raw CDP key holds were attempted but rejected by the supported browser capability; they did not control or modify gameplay.

## Visible campaign play

| Trail          | Observed exit evidence                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| First Light    | 18/28 motes, 0 retries; later upper-route replay earned moon seal with 17 motes                                 |
| Reedwater      | 17/28 motes, 0 retries; final revised safe-spring route replay: 14 motes, 0 retries                             |
| Glass Orchard  | 19/28 motes on initial play; post-wind-correction replay completed with 16 motes, 0 retries                     |
| Clockwork Rise | 22/28 motes, 0 retries; both conveyor directions inspected                                                      |
| Ember Kiln     | 20/28 motes, 0 retries; safe crumble ledge stood on, active vents inspected, damage and heart recovery observed |
| Moonwood       | 15/28 motes, 1 deliberate retry; waystone lit, walked into second gap, restored at checkpoint, then exited      |
| Dawn Engine    | 3/3 beacons, 22/28 motes, 0 retries; “You brought the dawn home” ending displayed                               |

Map then showed 7/7 lanterns, 133 best motes, and all seven replay buttons. Reload retained 7/7 progress. A later reload retained First Light's moon seal while preserving the higher previous mote best. The ending is a three-beacon restoration finale, not a combat boss.

## Interaction and visual checks

- Inspected screenshots of world map, meadow, water crossing, orchard, conveyor gardens, kiln, Moonwood checkpoint retry, all three dawn beacons and ending.
- Followed First Light's two final high ledges and collected its optional moon seal through jumping controls. Orchard's initial upper ledges were climbed; not every optional seal was collected.
- Sail pickups visibly change HUD to SAIL READY. Held jump sequences exercised powered movement; slow-fall mechanics additionally tested deterministically. A screenshot captured after native key release does not independently prove held-glide art, so do not claim every animation frame was visually checked.
- Persistent Pause → Resume button → Space visibly jumped after the review fix. P/Escape pause exercised. Restart visibly reset expedition motes to zero. Pause rejected further right input without moving or changing collectibles. Return-to-map cancellation and replay were exercised; repeated right presses collected motes normally.
- At 390×844, inspected phone map, game, controls and notes. Initial crowded map was replaced by a larger two-column trail grid. On-screen Move right held 900 ms collected four motes; Jump/Glide control raised the courier visibly. Pointer release ended movement; multi-touch hardware and OS-generated pointer cancellation were not available for direct physical-device testing.
- Reduced-motion and sound toggles were exercised visibly, with correct labels and continued controls. Procedural audio generation inspected in code; output is optional and off by default. Physical sound output was not independently measured.
- Actual native Chrome app surface is available. Attempted native OS/window/tab focus switches did not generate a verifiable pause; browser automation appears to emulate focus. Native focus-loss remains an explicit QA limit. Implementation clears held keys/pointers and the clock on blur/visibility loss, and requires explicit resume.

## Automated simulation evidence

28 behavioral tests pass: acceleration/braking, variable jump release, coyote expiration, buffered landing jump, repeated held input, ground landing, wall/ceiling tunneling boundaries, stomp/side/head contacts, hazard activation and protection, sail speed, heart cap, unique pickups, fall/checkpoint restoration and reward retention, spring entry and launch, conveyors including smaller steps, crumble disappearance/return, finale gating, fixed-clock time cap/reset, idle wind, corrupt saves, map unlocks and replay best preservation.

Seven additional tests within that count drive each trail from entry to exit through simulation inputs with sail pickups removed. These establish base-route feasibility and are distinct from the Chrome playthrough. They observe simulation coordinates to choose jumps; this assistance was never used to mutate browser game state.

Targeted red/green records: unsafe checkpoint restoration failed (580 vs safe 620), fixed safe-ground restoration; pad-entry running test failed, fixed spring/conveyor side handling; half-step conveyor test failed (500.75 vs500.375), fixed actual-dt usage; grounded wind test failed (280 vs60), fixed airborne-only wind. Initial movement smoke test and the broader regression suite were also used, without claiming every test was authored before implementation.

No slopes or moving platforms are included. Saves are local to the browser, with graceful fallback when unavailable; cross-browser/cloud sync is outside scope. All required routes were completed, but exhaustive collection of all 196 motes and seven seals was not claimed.
