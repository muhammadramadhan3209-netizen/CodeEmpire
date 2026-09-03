import test from "node:test";
import assert from "node:assert/strict";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const bus=await import("../js/systems/eventBus.js");
const resetManager=await import("../js/systems/resetManager.js");

test("performReset dapat emit APP_RESET 2 fase",async()=>{
  let startEvent=null;
  let completeEvent=null;
  const u1=bus.on(bus.events.APP_RESET,payload=>{
    if(payload?.phase==="start")startEvent=payload;
    if(payload?.phase==="complete")completeEvent=payload;
  });
  globalThis.localStorage={
    getItem:()=>null,setItem:()=>{},removeItem:()=>{}
  };
  globalThis.location={reload:()=>{}};
  await new Promise(r=>setTimeout(r,1600));
  await resetManager.performReset({reload:false,reason:"native-test"});
  u1();
  assert.ok(startEvent);
  assert.equal(startEvent.reason,"native-test");
  assert.ok(completeEvent);
  assert.ok(completeEvent.cleared);
});

test("reinitializeEventListeners emit event",()=>{
  let received=null;
  const unsub=bus.on(bus.events.APP_RESET,payload=>{if(payload?.phase==="reinit")received=payload;});
  resetManager.reinitializeEventListeners();
  unsub();
  assert.ok(received);
  assert.equal(received.phase,"reinit");
});

test("performReset dengan skipBusClear mempertahankan listener",async()=>{
  let preserved=null;
  const unsub=bus.on(bus.events.APP_RESET,payload=>{if(payload?.phase==="complete")preserved=payload;});
  globalThis.localStorage={
    getItem:()=>null,setItem:()=>{},removeItem:()=>{}
  };
  globalThis.location={reload:()=>{}};
  await new Promise(r=>setTimeout(r,1600));
  await resetManager.performReset({reload:false,skipBusClear:true});
  unsub();
  assert.ok(preserved);
  assert.ok(preserved.cleared);
});
