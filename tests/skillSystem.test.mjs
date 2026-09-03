import assert from "node:assert/strict";
import {beforeEach,test} from "node:test";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const stateModule=await import("../js/state.js");
const skills=await import("../js/systems/skillSystem.js");
let state;
beforeEach(()=>{stateModule.resetState();state=stateModule.state;state.money=10000;});

test("skill training berjalan dengan timer",()=>{
  assert.equal(skills.trainSkill("backend").ok,true);
  state.skillTraining.duration=1;
  const result=skills.tickSkillTraining();
  assert.equal(result.ok,true);
  assert.equal(state.skills.backend,2);
});
