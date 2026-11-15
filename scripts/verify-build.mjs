import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const required = [
  "dist/index.html", "dist/styles.css", "dist/data.js", "dist/v4-scenes.js",
  "dist/game.js", "dist/nasa-snapshot.json",
  "dist/assets/vn/v4/menu-emergency.webp",
  "dist/assets/vn/v4/sleep-night.webp",
  "dist/assets/vn/v4/sleep-dawn.webp"
];

await Promise.all(required.map(file => access(path.join(root, file))));
const [html, game, styles, vercelSource] = await Promise.all([
  readFile(path.join(root, "dist/index.html"), "utf8"),
  readFile(path.join(root, "dist/game.js"), "utf8"),
  readFile(path.join(root, "dist/styles.css"), "utf8"),
  readFile(path.join(root, "vercel.json"), "utf8")
]);
for (const marker of ["v4-scenes.js", "Saved Games", "mission-chip", "quick-menu"]) {
  if (!html.includes(marker)) throw new Error(`Missing HTML marker: ${marker}`);
}
if (/qrbLjbqTbcMpLJLpBgrjLJfhQGFKTrJwnGbf7hnF/.test(html + game)) {
  throw new Error("NASA API key must never ship to the browser.");
}
if (!game.includes("data-resource-room") || !styles.includes("scene-council.scene-dialogue .character-layer")) {
  throw new Error("Resource travel or Council character visibility regression.");
}
const vercel = JSON.parse(vercelSource);
if (vercel.outputDirectory !== "dist") throw new Error("Vercel must publish dist/.");
console.log(`Verified ${required.length} deployment files and browser-secret safety.`);
