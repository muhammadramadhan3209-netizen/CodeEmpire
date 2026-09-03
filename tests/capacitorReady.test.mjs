import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {join} from "node:path";

const projectRoot="/mnt/sdcard/Download/CodeEmpire/CodeEmpire_V0_1_Phase4_Complete_AssetReady";

test("capacitor.config.json ada dan valid JSON",()=>{
  const path=join(projectRoot,"capacitor.config.json");
  assert.ok(existsSync(path));
  const config=JSON.parse(readFileSync(path,"utf8"));
  assert.equal(config.appId,"com.codeempire.app");
  assert.equal(config.webDir,"dist");
  assert.ok(config.plugins);
  assert.ok(config.plugins.SplashScreen);
});

test(".caprc.json ada dan menunjuk webDir dist",()=>{
  const path=join(projectRoot,".caprc.json");
  assert.ok(existsSync(path));
  const config=JSON.parse(readFileSync(path,"utf8"));
  assert.equal(config.web_dir,"dist");
  assert.equal(config.orientation,"landscape");
  assert.equal(config.fullscreen,true);
});

test("index.html tidak bergantung pada fitur yang hilang di WebView",()=>{
  const html=readFileSync(join(projectRoot,"index.html"),"utf8");
  assert.ok(!/window\.alert/.test(html));
  assert.ok(!/document\.write/.test(html));
});

test("nativeBridge.detect tidak error di environment test",async()=>{
  const bridge=await import("../js/systems/nativeBridge.js");
  assert.equal(bridge.isNative,false);
  assert.ok(bridge.nativeBridge.backHandlers);
  assert.equal(typeof bridge.nativeBridge.pushBackHandler,"function");
});

test("nativeBridge.pushBackHandler mengembalikan unsubscribe",async()=>{
  const bridge=await import("../js/systems/nativeBridge.js");
  const handler=()=>true;
  const unsub=bridge.nativeBridge.pushBackHandler(handler);
  assert.equal(typeof unsub,"function");
  assert.ok(bridge.nativeBridge.backHandlers.includes(handler));
  unsub();
  assert.ok(!bridge.nativeBridge.backHandlers.includes(handler));
});
