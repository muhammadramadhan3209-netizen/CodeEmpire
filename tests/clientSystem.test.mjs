import assert from "node:assert/strict";
import {beforeEach,test} from "node:test";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const stateModule=await import("../js/state.js");
const clientSystem=await import("../js/systems/clientSystem.js");
const {clients}=await import("../js/data/clients.js");
let state;
beforeEach(()=>{stateModule.resetState();state=stateModule.state;});

test("client selesai menghasilkan rating dan reward",()=>{
  state.level=20;
  state.skills={frontend:10,backend:10,ai:10,security:10};
  const client={...clients.find(item=>item.id==="coffee"),offerId:"test-offer"};
  state.availableClients=[client];
  assert.equal(clientSystem.acceptClient("coffee","custom").ok,true);
  state.activeClient.duration=1;
  const result=clientSystem.tickClient();
  assert.equal(result.ok,true);
  assert.ok(result.rating>=4);
  assert.equal(state.clientRating.count,1);
  assert.ok(state.money>0);
});

test("Wanted memblokir client premium",()=>{
  const client={...clients.find(item=>item.id==="shop"),offerId:"premium-offer"};
  state.availableClients=[client];
  state.hacker.wanted=true;
  assert.equal(clientSystem.acceptClient("shop").ok,false);
});

test("AI Assist butuh skill AI dan repeat business tetap masuk pool",()=>{
  state.level=20;
  const client={...clients.find(item=>item.id==="coffee"),offerId:"repeat-offer"};
  state.availableClients=[client];
  assert.equal(clientSystem.acceptClient("coffee","ai").ok,false);
  state.skills={frontend:10,backend:10,ai:2,security:10};
  const originalRandom=Math.random;
  Math.random=()=>0;
  try{
    assert.equal(clientSystem.acceptClient("coffee","ai").ok,true);
    state.activeClient.duration=1;
    clientSystem.tickClient();
  }finally{Math.random=originalRandom;}
  assert.equal(state.availableClients[0].status,"repeat");
  assert.ok(state.availableClients[0].budget>client.budget);
});
