import test from "node:test";
import assert from "node:assert/strict";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const stateFile=await import("../js/state.js");
const decay=await import("../js/systems/reputationDecay.js");

test("startReputationDecay menyimpan config decay",()=>{
  stateFile.resetState();
  const result=decay.startReputationDecay(10,60_000);
  assert.equal(result.ok,true);
  assert.equal(decay.isReputationDecayActive(),true);
});

test("startReputationDecay menolak input invalid",()=>{
  stateFile.resetState();
  const r1=decay.startReputationDecay(0,1000);
  assert.equal(r1.ok,false);
  const r2=decay.startReputationDecay(5,0);
  assert.equal(r2.ok,false);
});

test("tickReputationDecay mengurangi reputation sesuai durasi",()=>{
  stateFile.resetState();
  stateFile.state.reputation=80;
  decay.startReputationDecay(20,2000);
  const r1=decay.tickReputationDecay(Date.now()+1000);
  assert.equal(r1.active,true);
  assert.ok(r1.applied>0);
  assert.ok(stateFile.state.reputation<80);
});

test("tickReputationDecay berhenti setelah durasi habis",()=>{
  stateFile.resetState();
  stateFile.state.reputation=50;
  decay.startReputationDecay(10,1000);
  const future=Date.now()+5000;
  decay.tickReputationDecay(future);
  assert.equal(decay.isReputationDecayActive(future),false);
  assert.equal(stateFile.state.market.reputationDecayAmount,0);
});

test("tickReputationDecay tidak membuat reputation negatif",()=>{
  stateFile.resetState();
  stateFile.state.reputation=3;
  decay.startReputationDecay(50,2000);
  decay.tickReputationDecay(Date.now()+1500);
  assert.ok(stateFile.state.reputation>=0);
});

test("getReputationDecayProgress mengembalikan info benar",()=>{
  stateFile.resetState();
  decay.startReputationDecay(20,10_000);
  const progress=decay.getReputationDecayProgress();
  assert.ok(progress);
  assert.equal(progress.active,true);
  assert.ok(progress.percent>=0&&progress.percent<=100);
});

test("clearReputationDecay mereset state",()=>{
  stateFile.resetState();
  decay.startReputationDecay(10,5000);
  decay.clearReputationDecay();
  assert.equal(decay.isReputationDecayActive(),false);
});
