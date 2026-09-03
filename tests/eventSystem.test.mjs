import assert from "node:assert/strict";
import {beforeEach,test} from "node:test";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const stateModule=await import("../js/state.js");
const events=await import("../js/systems/eventSystem.js");
let state;
beforeEach(()=>{stateModule.resetState();state=stateModule.state;state.money=10000;});

test("event paksa menerapkan efek",()=>{
  const before=state.money;
  assert.equal(events.tickEvents("sponsor").ok,true);
  assert.ok(state.money>before);
  assert.equal(state.lastEvent.id,"sponsor");
});
