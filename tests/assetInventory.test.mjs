import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {join} from "node:path";

const projectRoot="/mnt/sdcard/Download/CodeEmpire/CodeEmpire_V0_1_Phase4_Complete_AssetReady";
const inventory=await import("../js/data/assetInventory.js");
const assetMap=await import("../js/data/assetMap.js");
const gapReport=await import("../js/data/assetGapReport.js");

test("assetInventory mendata 8 personality, 5 tier, 18 ui",()=>{
  assert.equal(inventory.assetInventory.personality.length,8);
  assert.equal(inventory.assetInventory.tier.length,5);
  assert.equal(inventory.assetInventory.ui.length,18);
});

test("file personality SVG tersedia",()=>{
  inventory.assetInventory.personality.forEach(item=>{
    const path=join(projectRoot,item.path);
    assert.ok(existsSync(path),`Missing ${item.path}`);
  });
});

test("file tier SVG tersedia",()=>{
  inventory.assetInventory.tier.forEach(item=>{
    const path=join(projectRoot,item.path);
    assert.ok(existsSync(path),`Missing ${item.path}`);
  });
});

test("file UI SVG baru tersedia",()=>{
  inventory.assetInventory.ui.forEach(item=>{
    const path=join(projectRoot,item.path);
    assert.ok(existsSync(path),`Missing ${item.path}`);
  });
});

test("updateInventoryStatus menandai available untuk file yang ada",()=>{
  const available=[];
  inventory.assetInventory.personality.forEach(item=>available.push(item.path));
  inventory.assetInventory.tier.forEach(item=>available.push(item.path));
  inventory.assetInventory.ui.forEach(item=>available.push(item.path));
  inventory.updateInventoryStatus(available);
  const report=inventory.getInventoryReport();
  assert.equal(report.total,31);
  assert.equal(report.available,31);
  assert.equal(report.missing,0);
});

test("assetMap mengarah ke folder personality/tier/ui baru",()=>{
  assert.match(assetMap.assetMap.personality.creative,/assets\/personality\//);
  assert.match(assetMap.assetMap.tier.freelancer,/assets\/tier\//);
  assert.match(assetMap.assetMap.ui.quest,/assets\/ui\/ui-quest\.svg/);
});

test("gapReport menghitung tanpa key fallback (semua sudah ada)",()=>{
  const report=gapReport.buildAssetReport();
  assert.ok(report);
  const realFallbacks=report.usingFallback.filter(item=>item.key!=="unknown");
  assert.equal(realFallbacks.length,0);
});
