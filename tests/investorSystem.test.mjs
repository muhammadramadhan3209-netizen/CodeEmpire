import test from "node:test";
import assert from "node:assert/strict";
import {normalizeState,state} from "../js/state.js";
import {offerInvestor,acceptInvestorOffer,buybackShares,calculateCompanyValue,handleExposedInvestorRisk} from "../js/systems/investorSystem.js";

function richCompany(){
  normalizeState({money:50_000,moneyPerSecond:30,level:12,reputation:45,clientRating:{average:4.4,count:5},team:[{id:"dev-1",name:"Alya",role:"frontend",level:4,salary:100,morale:80}],equity:{playerShare:100}});
}

test("investor memberi modal dengan imbalan saham dan saham dapat dibeli kembali",()=>{
  richCompany();
  const value=calculateCompanyValue();
  assert.ok(value>0);
  const offered=offerInvestor(true);
  assert.equal(offered.ok,true);
  const beforeMoney=state.money;
  const accepted=acceptInvestorOffer();
  assert.equal(accepted.ok,true);
  const soldShare=accepted.investor.share;
  assert.equal(state.equity.playerShare,100-soldShare);
  assert.ok(state.money>beforeMoney);
  state.money=1_000_000;
  const bought=buybackShares(accepted.investor.id,2);
  assert.equal(bought.ok,true);
  assert.equal(state.equity.playerShare,100-soldShare+2);
});

test("investor terbesar keluar saat identitas hacker exposed",()=>{
  richCompany();
  offerInvestor(true);
  acceptInvestorOffer();
  state.hacker.identity="exposed";
  const result=handleExposedInvestorRisk();
  assert.equal(result.type,"investor_exit");
  assert.equal(state.equity.investors.length,0);
  assert.equal(state.equity.valuePenalty,.62);
});
