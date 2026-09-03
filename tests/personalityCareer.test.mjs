import test from "node:test";
import assert from "node:assert/strict";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const stateModule=await import("../js/state.js");
const personality=await import("../js/data/personality.js");
const careerTiers=await import("../js/data/careerTiers.js");

test("personality menyediakan 8 archetype",()=>{
  assert.equal(Object.keys(personality.personalityDefs).length,8);
});

test("careerTiers memiliki 5 tier",()=>{
  assert.equal(careerTiers.careerTiers.length,5);
  assert.equal(careerTiers.careerTiers.at(-1).id,"globalCorporation");
});

test("career tier unlock mengikuti level & reputation",()=>{
  assert.equal(careerTiers.getCareerTier(1,0).id,"freelancer");
  assert.equal(careerTiers.getCareerTier(5,15).id,"startup");
  assert.equal(careerTiers.getCareerTier(35,90).id,"globalCorporation");
});

test("personality random picker mengembalikan id valid",()=>{
  for(let i=0;i<20;i++){
    const id=personality.pickRandomPersonality();
    assert.ok(personality.personalityDefs[id]);
  }
});
