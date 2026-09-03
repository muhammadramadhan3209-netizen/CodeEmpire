import test from "node:test";
import assert from "node:assert/strict";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const stateFile=await import("../js/state.js");
const assetMap=await import("../js/data/assetMap.js");
const manifest=await import("../js/data/assetManifest.js");

test("assetMap mendukung kategori personality dan tier",()=>{
  assert.ok(assetMap.assetMap.personality);
  assert.ok(assetMap.assetMap.tier);
  assert.ok(assetMap.assetMap.nav.quests);
  assert.ok(assetMap.assetMap.nav.settings);
  assert.ok(assetMap.assetMap.event.big_client);
});

test("getAsset selalu mengembalikan fallback untuk key invalid",()=>{
  const path=assetMap.getAsset("nonexistent","missing");
  assert.match(path,/assets\/ui-unknown\.svg/);
});

test("assetManifest menghitung total kebutuhan",()=>{
  const total=manifest.countTotalAssets();
  assert.ok(total>50);
  assert.ok(manifest.assetCategories.includes("employees"));
  assert.ok(manifest.assetCategories.includes("events"));
});
