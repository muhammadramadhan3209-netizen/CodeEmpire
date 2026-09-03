import test from "node:test";
import assert from "node:assert/strict";

const storage=new Map();
globalThis.localStorage={
  getItem:key=>storage.get(key)??null,
  setItem:(key,value)=>storage.set(key,String(value)),
  removeItem:key=>storage.delete(key),
  clear:()=>storage.clear()
};
const stateFile=await import("../js/state.js");
const guard=await import("../js/systems/saveGuard.js");
const offline=await import("../js/systems/offlineSystem.js");

stateFile.resetState();

test("saveGuard dapat menulis backup",()=>{
  storage.clear();
  stateFile.state.money=4242;
  stateFile.saveState();
  const ok=guard.writeBackup();
  assert.equal(ok,true);
  assert.equal(guard.hasBackup(),true);
});

test("saveGuard loadBackup mengembalikan JSON valid",()=>{
  const data=guard.loadBackup();
  assert.ok(data&&typeof data==="object");
  assert.equal(data.money,4242);
});

test("offlineSystem.summary berisi field wajib",()=>{
  stateFile.state.lastActiveTimestamp=Date.now()-3_600_000;
  const summary=offline.calculateOfflineIncome();
  assert.ok(typeof summary.seconds==="number");
  assert.ok(typeof summary.earnings==="number");
  assert.ok(summary.passivePerSecond>=0);
});

test("offlineSystem.claim menambah money",()=>{
  stateFile.state.lastActiveTimestamp=Date.now()-3_600_000;
  const before=stateFile.state.money;
  const summary=offline.calculateOfflineIncome();
  offline.claimOfflineIncome(summary.earnings);
  assert.ok(stateFile.state.money>=before);
});
