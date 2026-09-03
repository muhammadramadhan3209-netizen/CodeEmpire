import { state, addMoney, addXP } from "./state.js";
import {registerProgress,registerMoney,checkQuestCompletions} from "./systems/questSystem.js";
import {completeCurrentStepByAction,tickTutorial} from "./systems/tutorialSystem.js";
import {feedback} from "./systems/feedbackSystem.js";

export function codeOnce(){
  addMoney(state.moneyPerTap);
  addXP(5);
  state.stats.totalTaps=(state.stats.totalTaps||0)+1;
  state.stats.totalEarned=(state.stats.totalEarned||0)+state.moneyPerTap;
  registerProgress("taps",1);
  registerMoney(state.moneyPerTap);
  completeCurrentStepByAction("code");
  tickTutorial();
  feedback("money",{sound:false});
  return checkQuestCompletions();
}

export function buyCodingUpgrade(){
  if(state.money < state.upgradeCost) return false;
  state.money -= state.upgradeCost;
  state.codingLevel++;
  state.moneyPerTap++;
  if(state.codingLevel % 3 === 0) state.moneyPerSecond++;
  state.upgradeCost = Math.ceil(state.upgradeCost * 1.5);
  addXP(20);
  completeCurrentStepByAction("upgrade");
  feedback("levelUp",{sound:false});
  return true;
}

export function passiveTick(){
  if(Date.now() < (state.hacker?.officeFreezeUntil || 0)) return {gross:0,net:0};
  const gross=state.moneyPerSecond;
  const net=gross*Math.max(0,Math.min(1,state.equity.playerShare/100));
  if(net>0){
    addMoney(net);
    registerMoney(net);
  }
  return {gross,net};
}

export function getPassiveIncomePerSecond(){return state.moneyPerSecond*Math.max(0,Math.min(1,state.equity.playerShare/100));}

export function buyItem(type){
  const items = {
    laptop:{cost:100, label:"Basic Laptop", effect:"+1 Coding"},
    monitor:{cost:500, label:"Second Monitor", effect:"+10% project speed"},
    keyboard:{cost:1200, label:"Mechanical Keyboard", effect:"+3 Coding"}
  };
  const item = items[type];
  if(!item || state.ownedItems[type] || state.money < item.cost) return false;
  state.money -= item.cost;
  state.ownedItems[type] = true;
  if(type==="laptop") state.moneyPerTap += 1;
  if(type==="keyboard") state.moneyPerTap += 3;
  feedback("click",{sound:false});
  return item;
}
