import { cp, mkdir, rm } from "node:fs/promises";

const projectRoot = new URL("../", import.meta.url);
const output = new URL("../dist/", import.meta.url);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(new URL("index.html", projectRoot), new URL("index.html", output));
await cp(new URL("css", projectRoot), new URL("css", output), { recursive: true });
await cp(new URL("js", projectRoot), new URL("js", output), { recursive: true });
await cp(new URL("assets", projectRoot), new URL("assets", output), { recursive: true });

console.log("Build selesai di dist/");
