import {state} from "../state.js";

const DEFAULT_DURATION=600_000;
const DEFAULT_AMOUNT=5;
const MIN_REPUTATION=0;
const MAX_REPUTATION=100;
const TICK_INTERVAL=1000;

function ensureMarketFlags(){
  if(!state.market)state.market={};
  if(typeof state.market.reputationDecayUntil!=="number")state.market.reputationDecayUntil=0;
  if(typeof state.market.reputationDecayAmount!=="number")state.market.reputationDecayAmount=0;
  if(typeof state.market.reputationDecayStartedAt!=="number")state.market.reputationDecayStartedAt=0;
  if(typeof state.market.reputationDecayOriginalAmount!=="number")state.market.reputationDecayOriginalAmount=0;
}

export function startReputationDecay(amount=DEFAULT_AMOUNT,duration=DEFAULT_DURATION){
  ensureMarketFlags();
  if(!Number.isFinite(amount)||amount<=0)return {ok:false,reason:"Amount harus > 0."};
  if(!Number.isFinite(duration)||duration<=0)return {ok:false,reason:"Duration harus > 0."};
  state.market.reputationDecayAmount=amount;
  state.market.reputationDecayOriginalAmount=amount;
  state.market.reputationDecayStartedAt=Date.now();
  state.market.reputationDecayUntil=Date.now()+duration;
  return {ok:true,amount,duration,until:state.market.reputationDecayUntil};
}

export function isReputationDecayActive(now=Date.now()){
  ensureMarketFlags();
  return now<state.market.reputationDecayUntil;
}

export function getReputationDecayProgress(now=Date.now()){
  ensureMarketFlags();
  const total=state.market.reputationDecayUntil-state.market.reputationDecayStartedAt;
  const remaining=Math.max(0,state.market.reputationDecayUntil-now);
  if(total<=0)return {percent:0,remainingMs:0,totalMs:0,amountRemaining:state.market.reputationDecayAmount};
  const percent=Math.min(100,Math.round(((total-remaining)/total)*100));
  return {
    percent:100-percent,
    remainingMs:remaining,
    totalMs:total,
    amountRemaining:state.market.reputationDecayAmount,
    active:isReputationDecayActive(now)
  };
}

export function tickReputationDecay(now=Date.now()){
  ensureMarketFlags();
  if(!isReputationDecayActive(now)){
    if(state.market.reputationDecayAmount>0||state.market.reputationDecayOriginalAmount>0){
      state.market.reputationDecayAmount=0;
      state.market.reputationDecayOriginalAmount=0;
    }
    return {active:false,applied:0,message:null};
  }
  const remaining=state.market.reputationDecayUntil-now;
  const total=state.market.reputationDecayUntil-state.market.reputationDecayStartedAt;
  if(total<=0)return {active:false,applied:0,message:null};
  const original=state.market.reputationDecayOriginalAmount;
  const perMs=original/total;
  const elapsedMs=Math.max(0,total-remaining);
  const target=Math.max(0,original-perMs*elapsedMs);
  const previous=state.market.reputationDecayAmount;
  const applied=Math.max(0,previous-target);
  state.market.reputationDecayAmount=target;
  if(applied<=0)return {active:true,applied:0,message:null};
  const before=state.reputation||0;
  const after=Math.max(MIN_REPUTATION,Math.min(MAX_REPUTATION,before-applied));
  const realApplied=before-after;
  state.reputation=after;
  if(realApplied>0){
    return {active:true,applied:realApplied,message:`Reputation -${realApplied.toFixed(1)} karena efek pers negatif.`};
  }
  return {active:true,applied:0,message:null};
}

export function clearReputationDecay(){
  ensureMarketFlags();
  state.market.reputationDecayAmount=0;
  state.market.reputationDecayOriginalAmount=0;
  state.market.reputationDecayUntil=0;
  state.market.reputationDecayStartedAt=0;
  return {ok:true};
}

export const REPUTATION_DECAY_CONSTANTS={DEFAULT_DURATION,DEFAULT_AMOUNT,MIN_REPUTATION,MAX_REPUTATION,TICK_INTERVAL};
