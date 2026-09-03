import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {normalizeState} from "../js/state.js";
import {assetMap} from "../js/data/assetMap.js";
import {generateClients} from "../js/systems/clientSystem.js";
import {generateRecruitPool} from "../js/systems/recruitSystem.js";
import {initializeMarket} from "../js/systems/marketSystem.js";
import * as screens from "../js/screens.js";

test("semua screen Phase 4 dapat dirender dengan marker aset",()=>{
  normalizeState({money:25_000,level:10,reputation:20,clientRating:{average:4,count:3}});
  generateClients(true);
  generateRecruitPool();
  initializeMarket();
  const names=["home","work","projects","office","shop","clients","company","hackerHub","recruitment","productDev","achievements"];
  names.forEach(name=>{
    const html=screens[name]();
    assert.equal(typeof html,"string");
    assert.ok(html.length>100,`${name} menghasilkan HTML`);
    assert.match(html,/data-asset=/,`${name} memakai asset registry`);
  });
});

test("screens tidak menanam placeholder asset langsung",async()=>{
  const source=await readFile(new URL("../js/screens.js",import.meta.url),"utf8");
  Object.values(assetMap).flatMap(group=>Object.values(group)).forEach(placeholder=>{
    assert.equal(source.includes(placeholder),false,`placeholder ${placeholder} hanya boleh berada di assetMap`);
  });
});
