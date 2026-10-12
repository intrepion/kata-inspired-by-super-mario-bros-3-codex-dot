export type Progress = {
  version: 1;
  completed: number[];
  best: number[];
  seals: number[];
};
export const freshProgress = (): Progress => ({
  version: 1,
  completed: [],
  best: Array(7).fill(0),
  seals: [],
});
export function parseProgress(raw: string | null): Progress {
  try {
    const value = JSON.parse(raw ?? "null");
    if (
      !value ||
      value.version !== 1 ||
      !Array.isArray(value.completed) ||
      !Array.isArray(value.best) ||
      !Array.isArray(value.seals)
    )
      return freshProgress();
    const valid = (n: unknown) =>
      Number.isInteger(n) && Number(n) >= 0 && Number(n) < 7;
    const completed = [...new Set<number>(value.completed.filter(valid))].sort(
      (a, b) => a - b,
    );
    // Reject impossible progress rather than accidentally skipping a campaign.
    if (completed.some((n, i) => n !== i)) return freshProgress();
    return {
      version: 1,
      completed,
      best: Array.from({ length: 7 }, (_, i) =>
        typeof value.best[i] === "number" && Number.isFinite(value.best[i])
          ? Math.max(0, Math.min(28, Math.floor(value.best[i])))
          : 0,
      ),
      seals: [
        ...new Set<number>(
          value.seals.filter(
            (n: unknown) => valid(n) && completed.includes(Number(n)),
          ),
        ),
      ],
    };
  } catch {
    return freshProgress();
  }
}
export function recordWin(
  progress: Progress,
  index: number,
  motes: number,
  seal: boolean,
): Progress {
  if (
    index < 0 ||
    index > 6 ||
    !Number.isInteger(index) ||
    index > progress.completed.length
  )
    return progress;
  const next = structuredClone(progress);
  if (!next.completed.includes(index)) next.completed.push(index);
  next.best[index] = Math.max(next.best[index], Math.min(28, motes));
  if (seal && !next.seals.includes(index)) next.seals.push(index);
  return next;
}
export const isUnlocked = (p: Progress, index: number) =>
  index === 0 || p.completed.includes(index - 1);
