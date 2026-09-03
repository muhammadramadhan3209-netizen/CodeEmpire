import test from "node:test";
import assert from "node:assert/strict";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const stateFile=await import("../js/state.js");
const careerTiers=await import("../js/data/careerTiers.js");
const employee=await import("../js/systems/employeeSystem.js");
const personality=await import("../js/data/personality.js");

stateFile.resetState();

test("careerTier progression valid",()=>{
  assert.equal(careerTiers.getCareerTier(1,0).id,"freelancer");
  stateFile.state.level=8;
  stateFile.state.reputation=20;
  assert.equal(careerTiers.getCareerTier(stateFile.state.level,stateFile.state.reputation).id,"startup");
  stateFile.state.level=20;
  stateFile.state.reputation=50;
  assert.equal(careerTiers.getCareerTier(stateFile.state.level,stateFile.state.reputation).id,"ceo");
  stateFile.state.level=40;
  stateFile.state.reputation=90;
  assert.equal(careerTiers.getCareerTier(stateFile.state.level,stateFile.state.reputation).id,"globalCorporation");
});

test("getEmployeeDetails mengembalikan summary personality",()=>{
  stateFile.state.team=[{id:"emp1",name:"Worker",role:"backend",tier:"Senior",level:5,xp:0,salary:200,morale:80,stress:20,loyalty:70,personality:"hardWorker",assignedTo:"development",training:null,isLead:false}];
  const details=employee.getEmployeeDetails("emp1");
  assert.ok(details);
  assert.equal(details.employee.name,"Worker");
  assert.equal(details.personality.id,"hardWorker");
  assert.match(details.summary,/produktivitas/);
});

test("personality effects konsisten",()=>{
  Object.keys(personality.personalityDefs).forEach(id=>{
    const def=personality.personalityDefs[id];
    assert.ok(def.label);
    assert.ok(def.description);
    assert.ok(def.effects);
  });
});
