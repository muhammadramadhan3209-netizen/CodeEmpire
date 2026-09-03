import test from "node:test";
import assert from "node:assert/strict";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const stateFile=await import("../js/state.js");
const careerTiers=await import("../js/data/careerTiers.js");
const quest=await import("../js/systems/questSystem.js");
const business=await import("../js/systems/businessEventSystem.js");

stateFile.resetState();

test("careerTiers memiliki 5 tier dengan unlockStory",()=>{
  assert.equal(careerTiers.careerTiers.length,5);
  careerTiers.careerTiers.forEach(tier=>{
    assert.ok(tier.unlockStory);
    assert.ok(tier.description);
  });
});

test("getCareerTierById dan getUnlockRequirements konsisten",()=>{
  const tier=careerTiers.getCareerTierById("ceo");
  const req=careerTiers.getUnlockRequirements("ceo");
  assert.equal(tier.id,"ceo");
  assert.equal(req.level,tier.minLevel);
  assert.equal(req.reputation,tier.minReputation);
  assert.equal(req.description,tier.unlockStory);
});

test("quest baru ter-load setelah reset",()=>{
  stateFile.resetState();
  quest.rolloverQuests();
  const list=quest.getQuestList();
  assert.ok(list.length>=12);
  assert.ok(list.some(q=>q.id==="daily_earn"));
  assert.ok(list.some(q=>q.id==="daily_office_upgrade"));
  assert.ok(list.some(q=>q.id==="weekly_team_grow"));
  assert.ok(list.some(q=>q.id==="weekly_maintain_all"));
});

test("registerProgress departmentUpgrades menambah counter",()=>{
  stateFile.resetState();
  quest.rolloverQuests();
  quest.registerProgress("departmentUpgrades",2);
  const list=quest.getQuestList();
  const officeQuest=list.find(q=>q.id==="daily_office_upgrade");
  assert.ok(officeQuest.progress>=2);
});

test("businessEventDef bertambah menjadi minimal 12",()=>{
  const defs=business.getBusinessEventDefs();
  assert.ok(defs.length>=12);
  assert.ok(defs.some(d=>d.id==="mentor_offer"));
  assert.ok(defs.some(d=>d.id==="open_source_request"));
  assert.ok(defs.some(d=>d.id==="audit_request"));
  assert.ok(defs.some(d=>d.id==="media_buzz"));
});
