import assert from "node:assert/strict";
import {beforeEach,test} from "node:test";

const storage=new Map();
globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value)),clear:()=>storage.clear()};
const stateModule=await import("../js/state.js");
beforeEach(()=>{storage.clear();stateModule.resetState();});

test("save Phase 3 mendapat seluruh default Phase 4",()=>{
  localStorage.setItem("codeEmpireSave",JSON.stringify({money:800,employees:2,skills:{frontend:8},hacker:{darkRep:9}}));
  stateModule.loadState();
  assert.equal(stateModule.state.money,800);
  assert.equal(stateModule.state.team.length,2);
  assert.equal(stateModule.state.employees,2);
  assert.equal(stateModule.state.departments.development.level,1);
  assert.equal(stateModule.state.clientRating.average,0);
  assert.equal(stateModule.state.equity.playerShare,100);
  assert.equal(stateModule.state.hacker.darkRep,9);
});

test("employees selalu mengikuti panjang team",()=>{
  stateModule.state.team.push({id:"one"});
  assert.equal(stateModule.state.employees,1);
  stateModule.state.employees=99;
  assert.equal(stateModule.state.employees,1);
});
