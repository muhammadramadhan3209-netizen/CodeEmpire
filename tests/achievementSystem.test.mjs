import assert from "node:assert/strict";
import {beforeEach,test} from "node:test";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const stateModule=await import("../js/state.js");
const achievements=await import("../js/systems/achievementSystem.js");
let state;
beforeEach(()=>{stateModule.resetState();state=stateModule.state;});

test("achievement memberi reward satu kali",()=>{
  state.clientRating.count=1;
  const first=achievements.checkAchievements();
  const moneyAfter=state.money;
  const second=achievements.checkAchievements();
  assert.ok(first.some(item=>item.id==="first_client"));
  assert.equal(second.length,0);
  assert.equal(state.money,moneyAfter);
  assert.equal(state.achievements.first_client.badge,"Trusted Starter");
});

test("achievement dual path terbuka saat reputasi seimbang",()=>{
  state.hacker.cleanRep=12;state.hacker.darkRep=10;
  assert.ok(achievements.checkAchievements().some(item=>item.id==="grey_balance"));
});
