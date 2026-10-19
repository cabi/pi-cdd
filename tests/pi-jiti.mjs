// Loads a .ts extension module the way pi loads extensions: through jiti
// with the @earendil-works aliases. The managed install is preferred (the
// real runtime); the repo's own node_modules (devDependencies jiti +
// @earendil-works/pi-tui) is the fallback that keeps CI green on runners
// with no pi install. Returns null when neither is present (callers
// decide: skip or plain-import).
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

export async function loadViaPi(tsPath) {
  const nodeModulesDirs = [];
  const roots = [process.env.PI_MANAGED_INSTALL_ROOT, path.join(os.homedir(), ".pi", "agent", "install")].filter(Boolean);
  for (const r of roots) {
    const rel = path.resolve(r, "releases");
    if (!fs.existsSync(rel)) continue;
    const ver = fs.readdirSync(rel).sort().at(-1);
    const nm = path.join(rel, ver, "node_modules");
    if (fs.existsSync(path.join(nm, "jiti", "lib", "jiti.mjs"))) nodeModulesDirs.push(nm);
  }
  const local = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "node_modules");
  if (fs.existsSync(path.join(local, "jiti", "lib", "jiti.mjs"))) nodeModulesDirs.push(local);

  for (const nm of nodeModulesDirs) {
    const { createJiti } = await import(path.join(nm, "jiti", "lib", "jiti.mjs"));
    const jiti = createJiti(import.meta.url, {
      alias: {
        "@earendil-works/pi-tui": path.join(nm, "@earendil-works", "pi-tui", "dist", "index.js"),
        "@earendil-works/pi-coding-agent": path.join(nm, "@earendil-works", "pi-coding-agent", "dist", "index.js"),
      },
    });
    return await jiti.import(tsPath);
  }
  return null;
}
