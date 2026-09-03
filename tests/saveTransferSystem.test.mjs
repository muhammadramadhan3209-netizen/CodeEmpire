import test from "node:test";
import assert from "node:assert/strict";

const storage=new Map();
globalThis.localStorage={
  getItem:key=>storage.get(key)??null,
  setItem:(key,value)=>storage.set(key,value),
  removeItem:key=>storage.delete(key)
};

const stateModule=await import("../js/state.js");
const {normalizeState}=stateModule;
const {exportSave,importSave}=await import("../js/systems/saveTransferSystem.js");

test("save dapat diekspor dan diimpor termasuk teks UTF-8",()=>{
  normalizeState({money:7654,career:{title:"Arsitek Bayangan",track:"grey"}});
  const code=exportSave();
  normalizeState({money:0});
  const result=importSave(code);
  assert.equal(result.ok,true);
  assert.equal(stateModule.state.money,7654);
  assert.equal(stateModule.state.career.title,"Arsitek Bayangan");
  assert.ok(storage.get("codeEmpireSave"));
});

test("save rusak ditolak tanpa melempar error",()=>{
  normalizeState({money:99});
  const result=importSave("bukan-save-valid");
  assert.equal(result.ok,false);
  assert.equal(stateModule.state.money,99);
});
