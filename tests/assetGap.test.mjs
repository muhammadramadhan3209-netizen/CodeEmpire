import test from "node:test";
import assert from "node:assert/strict";

globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
const gapReport=await import("../js/data/assetGapReport.js");
const assetMap=await import("../js/data/assetMap.js");
const manifest=await import("../js/data/assetManifest.js");

test("buildAssetReport mengembalikan struktur valid",()=>{
  const report=gapReport.buildAssetReport();
  assert.ok(report);
  assert.ok(typeof report.total==="number");
  assert.ok(Array.isArray(report.usingFallback));
  assert.ok(Array.isArray(report.manifestGaps));
  assert.ok(report.summary);
});

test("ASSET_FALLBACK_PATH menunjuk ke ui-unknown.svg",()=>{
  assert.equal(gapReport.ASSET_FALLBACK_PATH,"assets/ui-unknown.svg");
});

test("assetMap memuat key untuk personality, tier, event baru",()=>{
  assert.ok(assetMap.assetMap.personality);
  assert.ok(assetMap.assetMap.tier);
  assert.ok(assetMap.assetMap.event.big_client);
  assert.ok(assetMap.assetMap.nav.quests);
  assert.ok(assetMap.assetMap.nav.settings);
});

test("manifest menghitung total kebutuhan",()=>{
  const total=manifest.countTotalAssets();
  assert.ok(total>=50);
});
