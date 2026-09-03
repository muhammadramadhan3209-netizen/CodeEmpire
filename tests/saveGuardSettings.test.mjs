import test from "node:test";
import assert from "node:assert/strict";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const guard=await import("../js/systems/saveGuard.js");
const stateFile=await import("../js/state.js");

test("saveGuardKeys memuat settings + settingsBackup",()=>{
  assert.equal(guard.saveGuardKeys.settings,"codeEmpireSettings");
  assert.equal(guard.saveGuardKeys.settingsBackup,"codeEmpireSettingsBackup");
  assert.ok(Array.isArray(guard.saveGuardKeys.all));
  assert.equal(guard.saveGuardKeys.all.length,4);
});

test("writeBackup menyalin settings ke backup",()=>{
  const storage=new Map();
  globalThis.localStorage={
    getItem:key=>storage.get(key)??null,
    setItem:(key,value)=>storage.set(key,String(value)),
    removeItem:key=>storage.delete(key)
  };
  storage.set("codeEmpireSave","{\"money\":500}");
  storage.set("codeEmpireSettings","{\"soundEnabled\":false}");
  const ok=guard.writeBackup();
  assert.equal(ok,true);
  assert.equal(storage.has("codeEmpireSaveBackup"),true);
  assert.equal(storage.has("codeEmpireSettingsBackup"),true);
});

test("loadSettingsBackup mengembalikan object valid",()=>{
  const storage=new Map();
  globalThis.localStorage={
    getItem:key=>storage.get(key)??null,
    setItem:(key,value)=>storage.set(key,String(value)),
    removeItem:key=>storage.delete(key)
  };
  storage.set("codeEmpireSettingsBackup","{\"soundEnabled\":false}");
  const data=guard.loadSettingsBackup();
  assert.equal(data.soundEnabled,false);
});

test("clearAllSaves menghapus seluruh key termasuk settings",()=>{
  const storage=new Map();
  globalThis.localStorage={
    getItem:key=>storage.get(key)??null,
    setItem:(key,value)=>storage.set(key,String(value)),
    removeItem:key=>storage.delete(key)
  };
  storage.set("codeEmpireSave","x");
  storage.set("codeEmpireSaveBackup","y");
  storage.set("codeEmpireSettings","z");
  storage.set("codeEmpireSettingsBackup","w");
  const result=guard.clearAllSaves();
  assert.equal(result.primary,true);
  assert.equal(result.backup,true);
  assert.equal(result.settings,true);
  assert.equal(result.settingsBackup,true);
  assert.equal(storage.size,0);
});

test("getStorageSnapshot menampilkan settings & settingsBackup",()=>{
  const storage=new Map();
  globalThis.localStorage={
    getItem:key=>storage.get(key)??null,
    setItem:(key,value)=>storage.set(key,String(value))
  };
  storage.set("codeEmpireSave","{}");
  const snap=guard.getStorageSnapshot();
  assert.ok("settingsBackup" in snap);
  assert.equal(snap.primary,true);
  assert.equal(snap.settingsBackup,false);
});

test("save lama tanpa settings tetap valid",()=>{
  stateFile.resetState();
  stateFile.state.money=2000;
  stateFile.saveState();
  stateFile.loadState();
  assert.equal(stateFile.state.money,2000);
  assert.ok(stateFile.state.settings,"settings otomatis ter-normalize");
});
