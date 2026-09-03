import assert from "node:assert/strict";
import {beforeEach,test} from "node:test";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const stateModule=await import("../js/state.js");
const office=await import("../js/systems/officeSystem.js");
let state;
beforeEach(()=>{stateModule.resetState();state=stateModule.state;state.team.push({id:"dev1",name:"Dev",role:"frontend",tier:"Junior",level:2,salary:100,morale:80,assignedTo:null});state.money=10000;});

test("assign employee dan upgrade department",()=>{
  assert.equal(office.assignEmployee("dev1","development").ok,true);
  assert.equal(state.team[0].assignedTo,"development");
  assert.equal(office.upgradeDepartment("development").ok,true);
  assert.equal(state.departments.development.level,2);
});

test("role yang salah ditolak department",()=>{
  assert.equal(office.assignEmployee("dev1","sales").ok,false);
});

test("upgrade office menambah kapasitas",()=>{
  const before=office.getOfficeCapacity();
  assert.equal(office.upgradeOffice().ok,true);
  assert.ok(office.getOfficeCapacity()>before);
});
