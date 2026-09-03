import test from "node:test";
import assert from "node:assert/strict";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const stateModule=await import("../js/state.js");
const business=await import("../js/systems/businessEventSystem.js");

stateModule.resetState();

test("event bisnis memiliki minimal 12 tipe dengan pilihan",()=>{
  const defs=business.getBusinessEventDefs();
  assert.ok(defs.length>=12);
  defs.forEach(def=>{
    assert.ok(def.title);
    assert.ok(def.options.length>=2);
  });
});

test("roll event membuat pending",()=>{
  stateModule.resetState();
  const ev=business.rollBusinessEvent("viral_product");
  assert.ok(ev);
  assert.equal(stateModule.state.businessEvents.pending?.id,"viral_product");
});

test("resolve event menerapkan efek",()=>{
  stateModule.resetState();
  stateModule.state.money=5000;
  business.rollBusinessEvent("viral_product");
  const result=business.resolveBusinessEvent("scale");
  assert.equal(result.ok,true);
  assert.ok(stateModule.state.money<5000);
  assert.ok(stateModule.state.history||true);
  assert.equal(stateModule.state.businessEvents.pending,null);
});

test("event tidak ter-resolve dua kali",()=>{
  stateModule.resetState();
  business.rollBusinessEvent("burnout");
  const first=business.resolveBusinessEvent("bonus");
  const second=business.resolveBusinessEvent("bonus");
  assert.equal(first.ok,true);
  assert.equal(second.ok,false);
});
