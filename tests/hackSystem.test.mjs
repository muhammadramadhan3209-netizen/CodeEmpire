import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

const storage = new Map();
globalThis.localStorage = {
  getItem(key) { return storage.get(key) ?? null; },
  setItem(key, value) { storage.set(key, String(value)); },
  removeItem(key) { storage.delete(key); },
  clear() { storage.clear(); }
};

const stateModule = await import("../js/state.js");
const hackSystem = await import("../js/systems/hackSystem.js");
const clientSystem = await import("../js/systems/clientSystem.js");
const economy = await import("../js/economy.js");

beforeEach(() => {
  storage.clear();
  stateModule.resetState();
});

test("save lama mendapat default Hacker tanpa kehilangan progress", () => {
  localStorage.setItem("codeEmpireSave", JSON.stringify({
    money: 420,
    level: 4,
    skills: { frontend: 9 }
  }));
  stateModule.loadState();

  assert.equal(stateModule.state.money, 420);
  assert.equal(stateModule.state.skills.frontend, 9);
  assert.equal(stateModule.state.skills.security, 1);
  assert.equal(stateModule.state.hacker.heat, 0);
  assert.deepEqual(stateModule.state.hacker.toolsOwned, []);
});

test("job dengan minigame sukses memberi bonus dan Dark Rep", () => {
  const accepted = hackSystem.acceptHackJob("relay_trace");
  assert.equal(accepted.ok, true);
  assert.equal(hackSystem.resolveHackMinigame(true).success, true);
  stateModule.state.hacker.activeJob.duration = 1;

  const result = hackSystem.tickHackJob();
  assert.equal(result.type, "completed");
  assert.equal(result.reward, 312);
  assert.equal(stateModule.state.hacker.darkRep, 1);
  assert.equal(stateModule.state.hacker.completedJobs, 1);
  assert.equal(stateModule.state.hacker.activeJob, null);
});

test("ethical choice menaikkan Clean Rep dan menurunkan Heat", () => {
  stateModule.state.skills.security = 3;
  stateModule.state.hacker.heat = 12;
  assert.equal(hackSystem.acceptHackJob("ghost_api").ok, true);
  hackSystem.resolveHackMinigame(true);
  stateModule.state.hacker.activeJob.duration = 1;

  const pending = hackSystem.tickHackJob();
  assert.equal(pending.type, "moral");
  const result = hackSystem.resolveMoralChoice("ethical");

  assert.equal(result.type, "ethical");
  assert.ok(stateModule.state.hacker.cleanRep >= 4);
  assert.equal(stateModule.state.hacker.heat, 4);
  assert.equal(stateModule.state.reputation, stateModule.state.hacker.cleanRep);
});

test("Dark Market memakai Dark Rep dan mencegah pembelian ganda", () => {
  stateModule.state.hacker.darkRep = 20;
  const first = hackSystem.buyHackTool("phantom_proxy");
  const second = hackSystem.buyHackTool("phantom_proxy");

  assert.equal(first.ok, true);
  assert.equal(stateModule.state.hacker.darkRep, 12);
  assert.equal(second.ok, false);
});

test("Heat 60 memicu investigasi", () => {
  stateModule.state.skills.security = 4;
  stateModule.state.hacker.heat = 59;
  assert.equal(hackSystem.acceptHackJob("mirror_node").ok, true);
  hackSystem.resolveHackMinigame(true);
  stateModule.state.hacker.activeJob.duration = 1;
  hackSystem.tickHackJob();

  assert.equal(stateModule.state.hacker.pendingHeatEvent?.type, "investigation");
});

test("status Wanted memblokir client premium tetapi tidak client kecil", () => {
  clientSystem.generateClients();
  stateModule.state.hacker.wanted = true;

  assert.equal(clientSystem.acceptClient("shop").ok, false);
  assert.equal(clientSystem.acceptClient("coffee").ok, true);
});

test("office freeze menghentikan passive income", () => {
  stateModule.state.moneyPerSecond = 10;
  stateModule.state.hacker.officeFreezeUntil = Date.now() + 60_000;
  economy.passiveTick();
  assert.equal(stateModule.state.money, 0);

  stateModule.state.hacker.officeFreezeUntil = 0;
  economy.passiveTick();
  assert.equal(stateModule.state.money, 10);
});
