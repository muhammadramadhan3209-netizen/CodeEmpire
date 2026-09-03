import assert from "node:assert/strict";
import {beforeEach,test} from "node:test";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const stateModule=await import("../js/state.js");
const employees=await import("../js/systems/employeeSystem.js");
const makeEmployee=()=>({id:"e1",name:"Alya",role:"security",tier:"Junior",level:1,xp:0,salary:100,morale:60,trait:"Fast Learner",assignedTo:"security",training:null,isLead:false});
let state;
beforeEach(()=>{stateModule.resetState();state=stateModule.state;state.team.push(makeEmployee());state.departments.security.assigned=["e1"];});

test("training menaikkan level employee",()=>{
  state.money=5000;
  assert.equal(employees.trainEmployee("e1").ok,true);
  state.team[0].training.duration=1;
  assert.equal(employees.tickEmployeeTraining().length,1);
  assert.equal(state.team[0].level,2);
});

test("promosi dan bonus memperbarui tier serta morale",()=>{
  state.money=5000;
  state.team[0].level=3;
  assert.equal(employees.promoteEmployee("e1").ok,true);
  assert.equal(state.team[0].tier,"Senior");
  state.team[0].morale=40;
  assert.equal(employees.giveBonus("e1").ok,true);
  assert.ok(state.team[0].morale>40);
});

test("payroll gagal menurunkan morale",()=>{
  state.money=0;
  const result=employees.paySalary();
  assert.equal(result.ok,false);
  assert.ok(state.team[0].morale<60);
});
