import test from "node:test";
import assert from "node:assert/strict";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const bus=await import("../js/systems/eventBus.js");
const guard=await import("../js/systems/saveGuard.js");
const resetManager=await import("../js/systems/resetManager.js");

test("performReset emit APP_RESET",async()=>{
  let received=null;
  const unsubscribe=bus.on(bus.events.APP_RESET,payload=>{received=payload;});
  const storage=new Map();
  globalThis.localStorage={
    getItem:key=>storage.get(key)??null,
    setItem:(key,value)=>storage.set(key,String(value)),
    removeItem:key=>storage.delete(key)
  };
  storage.set("codeEmpireSave","{}");
  const originalReload=globalThis.location?.reload;
  globalThis.location={reload:()=>{}};
  await new Promise(resolve=>setTimeout(resolve,1600));
  const result=await resetManager.performReset({reload:false,reason:"test"});
  unsubscribe();
  assert.equal(result.ok,true);
  assert.ok(received);
  assert.equal(received.reason,"test");
  assert.equal(storage.has("codeEmpireSave"),false);
  if(originalReload)globalThis.location.reload=originalReload;
});

test("performReset mencegah double reset",async()=>{
  let calls=0;
  const unsubscribe=bus.on(bus.events.APP_RESET,()=>{calls++;});
  const storage=new Map();
  globalThis.localStorage={
    getItem:key=>storage.get(key)??null,
    setItem:(key,value)=>storage.set(key,String(value)),
    removeItem:key=>storage.delete(key)
  };
  globalThis.location={reload:()=>{}};
  await new Promise(resolve=>setTimeout(resolve,1600));
  const first=await resetManager.performReset({reload:false});
  const second=await resetManager.performReset({reload:false});
  unsubscribe();
  assert.equal(first.ok,true);
  assert.equal(second.ok,false);
  assert.ok(calls>=1);
  assert.ok(calls<=2);
});

test("performReset menghapus settings & backup",async()=>{
  const storage=new Map();
  globalThis.localStorage={
    getItem:key=>storage.get(key)??null,
    setItem:(key,value)=>storage.set(key,String(value)),
    removeItem:key=>storage.delete(key)
  };
  storage.set("codeEmpireSettings","{}");
  storage.set("codeEmpireSettingsBackup","{}");
  globalThis.location={reload:()=>{}};
  await new Promise(resolve=>setTimeout(resolve,1600));
  await resetManager.performReset({reload:false});
  assert.equal(storage.has("codeEmpireSettings"),false);
  assert.equal(storage.has("codeEmpireSettingsBackup"),false);
});

test("eventBus.clear() menghapus seluruh listener",()=>{
  let count=0;
  bus.on("test:clear",()=>count++);
  bus.clear();
  bus.emit("test:clear");
  assert.equal(count,0);
});

test("bindResetListener menerima event",()=>{
  let received=null;
  const unsubscribe=resetManager.bindResetListener(payload=>{received=payload;});
  bus.emit(bus.events.APP_RESET,{reason:"hook"});
  unsubscribe();
  assert.ok(received);
  assert.equal(received.reason,"hook");
});
