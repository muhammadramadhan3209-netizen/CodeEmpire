import test from "node:test";
import assert from "node:assert/strict";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const bridge=await import("../js/systems/nativeBridge.js");

test("nativeBridge menyimpan default",()=>{
  assert.equal(bridge.isNative,false);
  assert.ok(bridge.nativeBridge.storage);
  assert.ok(bridge.nativeBridge.audio);
  assert.ok(bridge.nativeBridge.notifications);
});

test("storageManager.set/get di web fallback",()=>{
  const storage=new Map();
  globalThis.localStorage={
    getItem:key=>storage.get(key)??null,
    setItem:(key,value)=>storage.set(key,String(value)),
    removeItem:key=>storage.delete(key)
  };
  bridge.storageManager.set("testKey",{hello:"world"});
  const raw=bridge.storageManager.get("testKey");
  assert.match(raw,/"hello"/);
});

test("audioManager.init mendeteksi environment",()=>{
  bridge.audioManager.init();
  assert.equal(typeof bridge.audioManager.isAvailable,"boolean");
});

test("notificationManager.init mendeteksi Notification API",()=>{
  bridge.notificationManager.init();
  assert.equal(typeof bridge.notificationManager.isAvailable,"boolean");
});
