import test from "node:test";
import assert from "node:assert/strict";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const stateFile=await import("../js/state.js");
const careerPanel=await import("../js/screens/careerPanel.js");
const employeeDetail=await import("../js/screens/employeeDetail.js");

stateFile.resetState();

test("careerPanel render menampilkan tier saat ini",()=>{
  const html=careerPanel.careerPanel();
  assert.match(html,/CURRENT TIER/);
  assert.match(html,/Freelancer|Startup Founder|CEO|Tech Company|Global Corporation/);
});

test("careerPanel menampilkan next tier",()=>{
  const html=careerPanel.careerPanel();
  assert.match(html,/NEXT TIER/);
  assert.match(html,/UNLOCKS/);
});

test("careerPanel menampilkan metric grid",()=>{
  const html=careerPanel.careerPanel();
  assert.match(html,/METRICS/);
  assert.match(html,/career-metric-grid/);
});

test("careerPanel berubah ketika player level naik",()=>{
  stateFile.state.level=5;
  stateFile.state.reputation=20;
  const html=careerPanel.careerPanel();
  assert.match(html,/Startup Founder|CEO|Tech Company/);
});

test("employeeDetailPanel render untuk employee valid",()=>{
  stateFile.state.team=[{id:"emp1",name:"Test Dev",role:"frontend",tier:"Junior",level:3,xp:0,salary:120,morale:75,stress:30,loyalty:60,personality:"creative",assignedTo:null,training:null,isLead:false}];
  const html=employeeDetail.employeeDetailPanel("emp1");
  assert.match(html,/Test Dev/);
  assert.match(html,/Creative/);
  assert.match(html,/PERSONALITY/);
  assert.match(html,/CONTRIBUTION/);
});

test("employeeDetailPanel return kosong untuk id invalid",()=>{
  const html=employeeDetail.employeeDetailPanel("nonexistent");
  assert.equal(html,"");
});
