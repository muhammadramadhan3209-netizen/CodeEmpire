import test from "node:test";
import assert from "node:assert/strict";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const stateModule=await import("../js/state.js");
const quests=await import("../js/systems/questSystem.js");

stateModule.resetState();

test("quest rollover mengisi slot harian",()=>{
  quests.rolloverQuests();
  const list=quests.getQuestList();
  assert.ok(list.length>=5);
  assert.ok(list.some(quest=>quest.period==="daily"));
  assert.ok(list.some(quest=>quest.period==="weekly"));
});

test("progress quest naik dengan action",()=>{
  stateModule.resetState();
  quests.rolloverQuests();
  quests.registerProgress("taps",10);
  const list=quests.getQuestList();
  const dailyCode=list.find(quest=>quest.id==="daily_code_3");
  assert.ok(dailyCode.progress>=10);
});

test("quest completion terdeteksi dan reward diklaim",()=>{
  stateModule.resetState();
  quests.rolloverQuests();
  quests.registerProgress("hires",1);
  const completed=quests.checkQuestCompletions();
  assert.ok(completed.some(quest=>quest.id==="daily_hire"));
  const beforeMoney=stateModule.state.money;
  const result=quests.claimQuestReward("daily_hire");
  assert.equal(result.ok,true);
  assert.ok(stateModule.state.money>beforeMoney);
});
