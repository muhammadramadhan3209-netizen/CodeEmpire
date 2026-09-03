import test from "node:test";
import assert from "node:assert/strict";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const stateModule=await import("../js/state.js");
const achievements=await import("../js/systems/achievementSystem.js");

stateModule.resetState();

test("achievement millionaire terbuka saat totalEarned cukup",()=>{
  stateModule.state.stats.totalEarned=1_000_000;
  const unlocked=achievements.checkAchievements();
  assert.ok(unlocked.some(item=>item.id==="millionaire"));
});

test("achievement tycoon terbuka pada career max",()=>{
  stateModule.state.level=40;
  stateModule.state.reputation=90;
  const unlocked=achievements.checkAchievements();
  assert.ok(unlocked.some(item=>item.id==="tycoon"));
});

test("achievement tidak dobel reward",()=>{
  stateModule.resetState();
  stateModule.state.stats.totalEarned=1_000_000;
  const first=achievements.checkAchievements();
  const second=achievements.checkAchievements();
  assert.ok(first.some(item=>item.id==="millionaire"));
  assert.equal(second.filter(item=>item.id==="millionaire").length,0);
});

test("getAllAchievementDefs bertambah",()=>{
  const defs=achievements.getAllAchievementDefs();
  assert.ok(defs.length>=17);
});
