import assert from "node:assert/strict";
import {beforeEach,test} from "node:test";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const stateModule=await import("../js/state.js");
const recruit=await import("../js/systems/recruitSystem.js");
let state;
beforeEach(()=>{stateModule.resetState();state=stateModule.state;});

test("generate pool dan hire kandidat",()=>{
  state.money=100000;
  const generated=recruit.generateRecruitPool();
  assert.equal(generated.ok,true);
  assert.equal(state.recruitPool.length,4);
  const candidate=state.recruitPool[0];
  const hired=recruit.hireCandidate(candidate.id);
  assert.equal(hired.ok,true);
  assert.equal(state.team.length,1);
  assert.equal(state.recruitPool.length,3);
});

test("refresh berbayar ditolak saat uang kurang",()=>{
  recruit.generateRecruitPool();
  state.money=0;
  assert.equal(recruit.refreshRecruitPool(true).ok,false);
});
