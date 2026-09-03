import test from "node:test";
import assert from "node:assert/strict";
import {normalizeState,state} from "../js/state.js";
import {calculateOfflineIncome,claimOfflineIncome,MAX_OFFLINE_SECONDS} from "../js/systems/offlineSystem.js";

test("offline income memakai efisiensi, saham, dan tidak menyelesaikan hack job",()=>{
  const now=2_000_000;
  normalizeState({
    money:0,
    moneyPerSecond:10,
    lastActiveTimestamp:now-100_000,
    equity:{playerShare:50},
    hacker:{activeJob:{id:"relay_trace",progress:42}}
  });
  const before=structuredClone(state.hacker.activeJob);
  const result=calculateOfflineIncome(now);
  assert.equal(result.seconds,100);
  assert.equal(result.earnings,300);
  assert.equal(result.hackJobPaused,true);
  assert.deepEqual(state.hacker.activeJob,before);
  claimOfflineIncome(result.earnings);
  assert.equal(state.money,300);
});

test("durasi offline dibatasi empat jam",()=>{
  const now=20_000_000;
  normalizeState({moneyPerSecond:1,lastActiveTimestamp:1});
  const result=calculateOfflineIncome(now);
  assert.equal(result.seconds,MAX_OFFLINE_SECONDS);
  assert.equal(result.earnings,Math.floor(MAX_OFFLINE_SECONDS*.6));
});
