import assert from "node:assert/strict";
import {beforeEach,test} from "node:test";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const stateModule=await import("../js/state.js");
const career=await import("../js/systems/careerSystem.js");
let state;
beforeEach(()=>{stateModule.resetState();state=stateModule.state;});

test("career mengikuti jalur dominan",()=>{
  state.level=18;state.hacker.darkRep=30;state.hacker.cleanRep=3;
  const result=career.updateCareerTitle();
  assert.equal(result.track,"hacker");
  assert.equal(state.career.title,"Black Hat Architect");
});
