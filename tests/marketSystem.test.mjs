import test from "node:test";
import assert from "node:assert/strict";
import {normalizeState,state} from "../js/state.js";
import {initializeMarket,tickMarket,getLeaderboard} from "../js/systems/marketSystem.js";

test("market membuat empat kompetitor dan leaderboard menyertakan pemain",()=>{
  normalizeState({equity:{companyValue:12_000}});
  assert.equal(initializeMarket().length,4);
  const rows=getLeaderboard();
  assert.equal(rows.length,5);
  assert.ok(rows.some(row=>row.isPlayer&&row.name==="Code Empire"));
  assert.deepEqual(rows.map(row=>row.rank),[1,2,3,4,5]);
});

test("event kompetitor dapat merebut client dan menekan kategori produk",()=>{
  normalizeState({
    availableClients:[{id:"shop",name:"Toko Maju"}],
    products:[{id:"product-1",name:"Suite",category:"productivity",baseIncome:20,lastMaintainedAt:Date.now()}]
  });
  const stolen=tickMarket({forceEvent:"steal_client"});
  assert.equal(stolen.type,"steal_client");
  assert.equal(state.availableClients.length,0);
  const rival=tickMarket({forceEvent:"product_rival"});
  assert.equal(rival.type,"product_rival");
  assert.equal(state.market.categoryPenalties.productivity.multiplier,.72);
});
