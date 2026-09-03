import test from "node:test";
import assert from "node:assert/strict";

test("entrypoint game dapat boot dan merender home",async()=>{
  const storage=new Map();
  globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};
  const elements=new Map();
  const screen={scrollTop:0,innerHTML:"",firstElementChild:null};
  const modal={innerHTML:"",firstElementChild:null,querySelector:()=>({onclick:null,addEventListener:()=>{},dataset:{},value:"",textContent:"",className:"",select:()=>{}}),querySelectorAll:()=>[]};
  const toastEl={textContent:"",classList:{add(){},remove(){},toggle(){}}};
  elements.set("screen",screen);
  elements.set("modal-layer",modal);
  elements.set("toast",toastEl);
  globalThis.document={
    getElementById:id=>elements.get(id)||null,
    querySelectorAll:()=>[],
    querySelector:()=>({onclick:null,addEventListener:()=>{},dataset:{},value:"",textContent:"",className:"",select:()=>{},appendChild:()=>{}}),
    createElement:()=>({className:"",textContent:"",style:{},remove(){}})
  };
  globalThis.window={setInterval:()=>1,setTimeout:(fn)=>fn&&fn(),setTimeout:()=>0};
  globalThis.confirm=()=>false;
  await import(`../js/game.js?smoke=${Date.now()}`);
  assert.match(screen.innerHTML,/TOTAL CASH/);
  assert.match(screen.innerHTML,/data-asset="character-idle"/);
});
