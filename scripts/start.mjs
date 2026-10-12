import { spawn } from "node:child_process";
import { openSync, writeFileSync } from "node:fs";
const port = Number(process.env.PORT || 5209);
try {
  const response = await fetch(`http://127.0.0.1:${port}`, {
    signal: AbortSignal.timeout(1000),
  });
  const html = await response.text();
  if (html.includes("Lantern Vale")) {
    console.log(`Already running: http://127.0.0.1:${port}`);
    process.exit(0);
  }
  throw new Error(
    `Port ${port} belongs to another server; it has not been changed.`,
  );
} catch (error) {
  if (error.message.includes("belongs to another")) throw error;
}
const log = openSync(`/tmp/lantern-vale-${port}.log`, "a");
const child = spawn(process.execPath, ["serve.mjs"], {
  cwd: new URL("..", import.meta.url),
  detached: true,
  stdio: ["ignore", log, log],
  env: { ...process.env, PORT: String(port) },
});
child.unref();
writeFileSync(`/tmp/lantern-vale-${port}.pid`, String(child.pid));
console.log(
  `Started session-only server ${child.pid}: http://127.0.0.1:${port}`,
);
