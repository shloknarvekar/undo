// Copies Bryntum Scheduler's prebuilt files into public/bryntum so the browser loads them as static files.
// Bundling the 4.6 MB library instead pushes the production build past 8 GB of memory.
import { cpSync, mkdirSync } from "node:fs";

const from = "node_modules/@bryntum/scheduler";
const to = "public/bryntum";

mkdirSync(to, { recursive: true });
for (const file of ["scheduler.module.js", "scheduler.css", "svalbard-dark.css"]) cpSync(`${from}/${file}`, `${to}/${file}`);
// Font Awesome's CSS points at ../webfonts, so the two folders keep their layout.
for (const file of ["fontawesome.css", "solid.css"]) {
  mkdirSync(`${to}/fontawesome/css`, { recursive: true });
  cpSync(`${from}/fontawesome/css/${file}`, `${to}/fontawesome/css/${file}`);
}
mkdirSync(`${to}/fontawesome/webfonts`, { recursive: true });
for (const file of ["fa-solid-900.woff2", "fa-solid-900.ttf"]) cpSync(`${from}/fontawesome/webfonts/${file}`, `${to}/fontawesome/webfonts/${file}`);
