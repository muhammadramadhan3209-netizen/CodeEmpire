import {state,addXP} from "../state.js";

export const skillTypes=["frontend","backend","ai","security"];

export function getSkillTrainingCost(type){
  if(!skillTypes.includes(type))return 0;
  return Math.ceil(240*Math.pow(1.48,state.skills[type]-1));
}

export function trainSkill(type){
  if(!skillTypes.includes(type))return {ok:false,reason:"Skill tidak valid."};
  if(state.skillTraining)return {ok:false,reason:`Training ${state.skillTraining.type} masih berjalan.`};
  if(state.skills[type]>=15)return {ok:false,reason:"Skill sudah mencapai level maksimum."};
  const cost=getSkillTrainingCost(type);
  if(state.energy<15)return {ok:false,reason:"Butuh 15 Energy untuk training skill."};
  if(state.money<cost)return {ok:false,reason:`Butuh $${cost.toLocaleString("en-US")} untuk training.`};
  state.money-=cost;
  state.energy-=15;
  state.skillTraining={type,progress:0,duration:8+state.skills[type]*2,startedAt:Date.now()};
  return {ok:true,training:state.skillTraining,message:`Training ${type} dimulai.`};
}

export function tickSkillTraining(){
  const training=state.skillTraining;
  if(!training)return null;
  training.progress=Math.min(100,training.progress+100/training.duration);
  if(training.progress<100)return null;
  state.skills[training.type]++;
  addXP(25+state.skills[training.type]*5);
  const result={ok:true,type:training.type,level:state.skills[training.type],message:`Skill ${training.type} naik ke level ${state.skills[training.type]}.`};
  state.skillTraining=null;
  return result;
}

export function upgradeSkill(_state,type){return trainSkill(type);}
