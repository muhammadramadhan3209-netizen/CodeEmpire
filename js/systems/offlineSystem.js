import {state,addMoney} from "../state.js";
import {getPassiveIncomePerSecond} from "../economy.js";
import {getProductIncomePerSecond} from "./productSystem.js";
import {registerMoney} from "./questSystem.js";

export const MAX_OFFLINE_SECONDS=14_400;
export const OFFLINE_EFFICIENCY=.6;

export function calculateOfflineIncome(now=Date.now()){
  const seconds=Math.max(0,Math.min(MAX_OFFLINE_SECONDS,Math.floor((now-state.lastActiveTimestamp)/1000)));
  const share=Math.max(0,Math.min(1,state.equity.playerShare/100));
  const passive=getPassiveIncomePerSecond();
  const products=getProductIncomePerSecond(now)*share;
  const earnings=Math.floor((passive+products)*OFFLINE_EFFICIENCY*seconds);
  return {
    seconds,
    earnings,
    passivePerSecond:passive,
    productPerSecond:products,
    hackJobPaused:Boolean(state.hacker.activeJob),
    productsLaunchedDuringOffline:state.stats.productsLaunched||0,
    clientsCompletedDuringOffline:state.stats.clientsCompleted||0
  };
}

export function claimOfflineIncome(earnings){
  const amount=Math.max(0,Math.floor(Number(earnings)||0));
  addMoney(amount);
  registerMoney(amount);
  state.offlineReport=state.offlineReport||{lastSummary:null,lastSeenAt:0,totalOfflineEarnings:0};
  state.offlineReport.totalOfflineEarnings+=amount;
  state.offlineReport.lastSeenAt=Date.now();
  state.offlineReport.lastSummary={amount,at:Date.now()};
  return {ok:true,amount,message:`Pendapatan offline $${amount.toLocaleString("en-US")} diklaim.`};
}

export function summarizeOfflineReport(now=Date.now()){
  return calculateOfflineIncome(now);
}
