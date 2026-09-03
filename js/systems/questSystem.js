import {state,addMoney,addXP} from "../state.js";
import {dailyQuestDefs,weeklyQuestDefs,allQuestDefs,getDailyResetAt,getWeeklyResetAt} from "../data/quests.js";
import {feedback} from "./feedbackSystem.js";

function ensureQuestSlot(questId,definition){
  if(state.quests.active[questId])return state.quests.active[questId];
  state.quests.active[questId]={id:questId,target:definition.target,reward:definition.reward,period:definition.period,type:definition.type,label:definition.label};
  state.quests.progress[questId]=state.quests.progress[questId]||0;
  return state.quests.active[questId];
}

export function rolloverQuests(now=Date.now()){
  const dailyReset=getDailyResetAt(now);
  const weeklyReset=getWeeklyResetAt(now);
  if(state.quests.lastDailyReset!==dailyReset){
    dailyQuestDefs.forEach(quest=>{
      delete state.quests.active[quest.id];
      delete state.quests.progress[quest.id];
    });
    state.quests.lastDailyReset=dailyReset;
  }
  if(state.quests.lastWeeklyReset!==weeklyReset){
    weeklyQuestDefs.forEach(quest=>{
      delete state.quests.active[quest.id];
      delete state.quests.progress[quest.id];
    });
    state.quests.lastWeeklyReset=weeklyReset;
  }
  allQuestDefs.forEach(definition=>ensureQuestSlot(definition.id,definition));
}

export function registerProgress(type,amount=1){
  if(!state.quests)return;
  rolloverQuests();
  const counters={
    taps:()=>state.quests.taps+=amount,
    projects:()=>state.quests.projects+=amount,
    skillTrainings:()=>state.quests.skillTrainings+=amount,
    hires:()=>state.quests.hires+=amount,
    maintenances:()=>state.quests.maintenances+=amount,
    departmentUpgrades:()=>state.quests.departmentUpgrades=(state.quests.departmentUpgrades||0)+amount,
    passiveEarned:()=>state.quests.passiveEarned+=amount,
    clientsCompleted:()=>state.quests.clientsCompleted+=amount,
    productsLaunched:()=>state.quests.productsLaunched+=amount
  };
  counters[type]?.();
  Object.values(state.quests.active).forEach(quest=>{
    if(quest.type!==type)return;
    state.quests.progress[quest.id]=state.quests[quest.type]||0;
  });
}

export function registerMoney(amount){
  if(amount>0)state.stats.totalEarned+=Math.floor(amount);
  registerProgress("passiveEarned",Math.max(0,amount));
}

export function checkQuestCompletions(){
  rolloverQuests();
  const completed=[];
  Object.values(state.quests.active).forEach(quest=>{
    if(state.quests.completed[quest.id])return;
    const progress=state.quests.progress[quest.id]||0;
    if(progress>=quest.target){
      state.quests.completed[quest.id]=Date.now();
      completed.push(quest);
    }
  });
  return completed;
}

export function claimQuestReward(questId){
  rolloverQuests();
  const quest=state.quests.active[questId];
  if(!quest)return {ok:false,reason:"Quest tidak ditemukan."};
  if(!state.quests.completed[questId])return {ok:false,reason:"Quest belum selesai."};
  if(state.quests.claimed[questId])return {ok:false,reason:"Reward sudah diklaim."};
  const reward=quest.reward;
  if(reward.money)addMoney(reward.money);
  if(reward.xp)addXP(reward.xp);
  if(reward.reputation)state.reputation=Math.min(100,state.reputation+reward.reputation);
  state.quests.claimed[questId]=Date.now();
  feedback("levelUp",{sound:false});
  return {ok:true,reward,message:`Reward ${quest.label} diklaim.`};
}

export function getQuestList(){
  rolloverQuests();
  return Object.values(state.quests.active).map(quest=>({
    ...quest,
    progress:state.quests.progress[quest.id]||0,
    completed:Boolean(state.quests.completed[quest.id]),
    claimed:Boolean(state.quests.claimed[quest.id])
  }));
}
