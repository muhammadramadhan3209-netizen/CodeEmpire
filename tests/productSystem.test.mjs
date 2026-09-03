import assert from "node:assert/strict";
import {beforeEach,test} from "node:test";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const stateModule=await import("../js/state.js");
const products=await import("../js/systems/productSystem.js");
let state;
beforeEach(()=>{
  stateModule.resetState();state=stateModule.state;state.money=50000;state.skills={frontend:10,backend:10,ai:10,security:10};
  state.team.push({id:"dev",name:"Dev",role:"frontend",tier:"Senior",level:4,salary:100,morale:100,assignedTo:"development"});
  state.departments.development.assigned=["dev"];
});

test("development produk selesai dan menghasilkan passive income",()=>{
  assert.equal(products.startProductDev("productivity").ok,true);
  state.activeProductDev.duration=1;
  const completed=products.tickProductDev();
  assert.equal(completed.ok,true);
  assert.equal(state.products.length,1);
  const before=state.money;
  const income=products.productIncome();
  assert.ok(income.net>0);
  assert.ok(state.money>before);
});

test("maintenance mengembalikan health produk",()=>{
  state.products=[{id:"p1",name:"Old App",category:"productivity",baseIncome:20,lastMaintainedAt:Date.now()-600000,health:20}];
  products.getProductIncomePerSecond();
  assert.ok(state.products[0].health<100);
  assert.equal(products.maintainProduct("p1").ok,true);
  assert.equal(state.products[0].health,100);
});
