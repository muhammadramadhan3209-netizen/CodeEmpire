import test from "node:test";
import assert from "node:assert/strict";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const stateModule=await import("../js/state.js");
const tutorial=await import("../js/systems/tutorialSystem.js");

stateModule.resetState();

test("tutorial dimulai saat pemain baru",()=>{
  tutorial.startTutorial();
  assert.equal(stateModule.state.tutorial.active,true);
  assert.equal(stateModule.state.tutorial.completed,false);
});

test("tutorial menyelesaikan step dengan taps",()=>{
  stateModule.resetState();
  tutorial.startTutorial();
  for(let i=0;i<6;i++)tutorial.completeCurrentStepByAction("code");
  assert.ok(stateModule.state.tutorial.currentStep>=1);
});

test("tutorial memberi reward setelah selesai",()=>{
  stateModule.resetState();
  tutorial.startTutorial();
  stateModule.state.stats.totalTaps=10;
  stateModule.state.codingLevel=2;
  stateModule.state.officeLevel=2;
  stateModule.state.quests.hires=1;
  stateModule.state.stats.projectsCompleted=1;
  for(let i=0;i<10;i++)tutorial.tickTutorial();
  const progress=tutorial.getTutorialProgress();
  assert.ok(progress.current>=4||progress.completed);
});

test("progress tutorial terukur dengan benar",()=>{
  stateModule.resetState();
  const progress=tutorial.getTutorialProgress();
  assert.equal(progress.total,7);
  assert.equal(progress.percent,0);
});
