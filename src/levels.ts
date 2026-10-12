export type Rect = { x: number; y: number; w: number; h: number };
export type Surface = Rect & {
  kind?: "spring" | "conveyor" | "crumble";
  direction?: number;
  broken?: number;
};
export type Pickup = Rect & {
  id: string;
  kind: "mote" | "seal" | "sail" | "heart" | "beacon";
};
export type Enemy = Rect & {
  origin: number;
  range: number;
  speed: number;
  alive: boolean;
};
export type Hazard = Rect & { period?: number };
export type Level = {
  name: string;
  subtitle: string;
  hint: string;
  sky: string;
  ink: string;
  leaf: string;
  accent: string;
  width: number;
  platforms: Surface[];
  pickups: Pickup[];
  enemies: Enemy[];
  hazards: Hazard[];
  wind: number;
  exit: number;
  checkpoint: number;
};
const themes = [
  [
    "First Light",
    "01 · Sunpetal meadow",
    "Build speed, then jump. Landing on beetles gives you a bounce.",
    "#d4f4e4",
    "#235b56",
    "#5c9c68",
    "#f8d978",
  ],
  [
    "Reedwater",
    "02 · The stepping stones",
    "Jump the little gaps. Pink spring pads launch you higher.",
    "#c7eff0",
    "#245b76",
    "#5a9c97",
    "#ffb0a2",
  ],
  [
    "Glass Orchard",
    "03 · A windborne shortcut",
    "Find a sail feather. Hold jump while falling to glide.",
    "#e4ddfa",
    "#574b86",
    "#9477b1",
    "#ffcca6",
  ],
  [
    "Clockwork Rise",
    "04 · The brass gardens",
    "Striped belts carry you. Push against them or ride the flow.",
    "#fae9c7",
    "#735c50",
    "#a39166",
    "#efb06f",
  ],
  [
    "Ember Kiln",
    "05 · The cooling furnaces",
    "Cracked ledges crumble; the floor is safe. Cinder vents blink — cross when dark.",
    "#f6cfbc",
    "#763f52",
    "#af7063",
    "#ffd685",
  ],
  [
    "Moonwood",
    "06 · The midnight canopy",
    "Combine everything you learned. The high road hides a moon seal.",
    "#293852",
    "#bac9dd",
    "#527381",
    "#b9e4dc",
  ],
  [
    "Dawn Engine",
    "07 · Bring the morning home",
    "Touch all three blue beacons, then restore the Dawn Engine.",
    "#a9dce8",
    "#34556e",
    "#668da4",
    "#ffe39d",
  ],
];
export function makeLevel(index: number): Level {
  const t = themes[index];
  const width = 2160;
  const platforms: Surface[] = [{ x: 0, y: 450, w: width, h: 130 }];
  if (index === 1 || index === 5) {
    platforms.splice(
      0,
      1,
      ...[
        [0, 540],
        [620, 540],
        [1240, 920],
      ].map(([x, w]) => ({ x, y: 450, w, h: 130 })),
    );
  }
  const ledges: Surface[] = [
    { x: 320, y: 358, w: 150, h: 22 },
    { x: 590, y: 288, w: 150, h: 22 },
    { x: 870, y: 350, w: 170, h: 22 },
    { x: 1190, y: 315, w: 160, h: 22 },
    { x: 1490, y: 360, w: 150, h: 22 },
    { x: 1760, y: 290, w: 170, h: 22 },
  ];
  // Each trail has its own upper-route rhythm; the water crossings keep clear headroom.
  const profiles: Record<number, number[][]> = {
    1: [
      [260, 350, 150],
      [630, 280, 150],
      [870, 340, 160],
      [1270, 320, 140],
      [1520, 360, 160],
      [1800, 285, 160],
    ],
    2: [
      [310, 350, 170],
      [560, 280, 190],
      [880, 315, 190],
      [1190, 275, 180],
      [1490, 345, 150],
      [1760, 275, 190],
    ],
    3: [
      [290, 365, 180],
      [590, 300, 150],
      [860, 345, 210],
      [1160, 290, 160],
      [1460, 350, 180],
      [1770, 280, 180],
    ],
    4: [
      [320, 355, 140],
      [570, 295, 190],
      [880, 350, 180],
      [1160, 315, 190],
      [1490, 355, 140],
      [1740, 290, 190],
    ],
    5: [
      [260, 350, 150],
      [630, 280, 150],
      [870, 340, 160],
      [1270, 300, 140],
      [1530, 355, 160],
      [1780, 280, 170],
    ],
    6: [
      [280, 365, 160],
      [560, 295, 150],
      [850, 355, 200],
      [1170, 295, 180],
      [1480, 355, 160],
      [1760, 285, 190],
    ],
  };
  profiles[index]?.forEach(([x, y, w], i) =>
    Object.assign(ledges[i], { x, y, w }),
  );
  platforms.push(...ledges);
  if (index === 1 || index === 5)
    platforms.push(
      { x: 170, y: 437, w: 30, h: 13, kind: "spring" },
      { x: 510, y: 437, w: 30, h: 13, kind: "spring" },
      { x: 1370, y: 437, w: 65, h: 13, kind: "spring" },
    );
  if (index === 3) {
    platforms.push(
      { x: 470, y: 437, w: 340, h: 13, kind: "conveyor", direction: 1 },
      { x: 1330, y: 437, w: 300, h: 13, kind: "conveyor", direction: -1 },
    );
  }
  if (index === 4) ledges.forEach((p) => (p.kind = "crumble"));
  const pickups: Pickup[] = [];
  for (let i = 0; i < 22; i++) {
    const x = 160 + i * 85;
    pickups.push({
      id: `${index}-m${i}`,
      x,
      y: 407,
      w: 16,
      h: 16,
      kind: "mote",
    });
  }
  ledges.forEach((p, i) =>
    pickups.push({
      id: `${index}-u${i}`,
      x: p.x + 60,
      y: p.y - 38,
      w: 16,
      h: 16,
      kind: "mote",
    }),
  );
  pickups.push({
    id: `${index}-seal`,
    x: ledges[5].x + 65,
    y: ledges[5].y - 45,
    w: 22,
    h: 22,
    kind: "seal",
  });
  if (index >= 2)
    pickups.push({
      id: `${index}-sail`,
      x: 220,
      y: 400,
      w: 25,
      h: 26,
      kind: "sail",
    });
  pickups.push({
    id: `${index}-heart`,
    x: 1120,
    y: 398,
    w: 22,
    h: 22,
    kind: "heart",
  });
  if (index === 6)
    for (let i = 0; i < 3; i++)
      pickups.push({
        id: `beacon${i}`,
        x: 490 + i * 620,
        y: 394,
        w: 28,
        h: 40,
        kind: "beacon",
      });
  const enemies: Enemy[] =
    index === 6
      ? []
      : [730, 1550].map((x, i) => ({
          x,
          y: 425,
          w: 34,
          h: 25,
          origin: x,
          range: 55,
          speed: (i ? -1 : 1) * 35,
          alive: true,
        }));
  const hazards: Hazard[] =
    index === 4
      ? [
          { x: 850, y: 426, w: 48, h: 24, period: 3 },
          { x: 1680, y: 426, w: 48, h: 24, period: 3 },
        ]
      : [];
  return {
    name: t[0],
    subtitle: t[1],
    hint: t[2],
    sky: t[3],
    ink: t[4],
    leaf: t[5],
    accent: t[6],
    width,
    platforms,
    pickups,
    enemies,
    hazards,
    wind: index === 2 ? 22 : 0,
    exit: 2050,
    checkpoint: 1080,
  };
}
export const LEVEL_NAMES = themes.map((t) => t[0]);
