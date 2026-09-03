import {state,addMoney,addXP} from "../state.js";
import {feedback} from "./feedbackSystem.js";

export const tutorialSteps = [
  {
    id:"welcome",
    title:"Selamat datang di Code Empire",
    body:"Kamu adalah developer solo. Tap tombol CODE untuk menghasilkan uang dan XP. Bicara dari 'silence' jadi 'mulai'.",
    screen:"home",
    highlight:"codeBtn",
    reward:{money:50,xp:10},
    nextOnAction:["code"]
  },
  {
    id:"earn",
    title:"Hasilkan uang pertama",
    body:"Tap CODE 5 kali. Setiap tap memberi uang dan XP. Kumpulkan cukup untuk upgrade coding.",
    screen:"home",
    highlight:"codeBtn",
    reward:{money:50,xp:10},
    requires:{type:"taps",count:5}
  },
  {
    id:"upgrade",
    title:"Upgrade coding",
    body:"Klik tombol UPGRADE untuk menambah income per tap.",
    screen:"home",
    highlight:"upgradeBtn",
    reward:{money:100,xp:20},
    requires:{type:"upgrade",count:1}
  },
  {
    id:"project",
    title:"Mulai project pertama",
    body:"Buka Projects, lalu mulai Calculator App. Tunggu sampai selesai untuk passive income.",
    screen:"projects",
    highlight:'[data-project="calculator"]',
    reward:{money:200,xp:50},
    requires:{type:"projects",count:1}
  },
  {
    id:"recruit",
    title:"Rekrut tim pertama",
    body:"Buka Recruitment dan hire kandidat pertama. Kapasitas mengikuti office level.",
    screen:"recruitment",
    highlight:'[data-hire]',
    reward:{money:300,xp:80,reputation:2},
    requires:{type:"hires",count:1}
  },
  {
    id:"office",
    title:"Upgrade perusahaan",
    body:"Buka Office dan upgrade ke Studio Office untuk menambah kapasitas tim.",
    screen:"office",
    highlight:"officeBtn",
    reward:{money:500,xp:120,reputation:5},
    requires:{type:"office",count:1}
  },
  {
    id:"complete",
    title:"Tutorial selesai!",
    body:"Kamu sudah punya pondasi. Lanjutkan ke Client, Product Lab, dan Career path pilihanmu.",
    screen:"home",
    highlight:null,
    reward:{money:1000,xp:200,reputation:10},
    requires:{type:"any",count:0}
  }
];

export function startTutorial(){
  if(state.tutorial.completed)return {ok:false,reason:"Tutorial sudah selesai."};
  state.tutorial.active=true;
  state.tutorial.currentStep=0;
  state.tutorial.stepsCompleted=[];
  return {ok:true};
}

export function getCurrentStep(){
  if(!state.tutorial.active||state.tutorial.completed)return null;
  return tutorialSteps[state.tutorial.currentStep]||null;
}

export function isStepSatisfied(step){
  if(!step||!step.requires)return true;
  const {type,count}=step.requires;
  if(type==="any")return true;
  if(type==="taps")return state.stats.totalTaps>=count;
  if(type==="projects")return state.stats.projectsCompleted>=count;
  if(type==="hires")return state.stats.hackJobsCompleted>=0&&state.quests.hires>=count;
  if(type==="office")return state.officeLevel>=2&&state.officeLevel>1;
  if(type==="upgrade")return state.codingLevel>=2;
  return false;
}

function applyStepReward(step){
  if(!step?.reward)return;
  const reward=step.reward;
  if(reward.money)addMoney(reward.money);
  if(reward.xp)addXP(reward.xp);
  if(reward.reputation)state.reputation=Math.min(100,state.reputation+reward.reputation);
}

function advance(){
  const step=getCurrentStep();
  if(!step)return null;
  if(!isStepSatisfied(step))return null;
  applyStepReward(step);
  state.tutorial.stepsCompleted.push(step.id);
  state.tutorial.currentStep++;
  state.tutorial.lastRewardAt=Date.now();
  feedback("levelUp",{sound:false});
  if(state.tutorial.currentStep>=tutorialSteps.length){
    state.tutorial.completed=true;
    state.tutorial.active=false;
    addMoney(2000);
    addXP(300);
    state.reputation=Math.min(100,state.reputation+15);
    return {ok:true,completed:true,message:"Tutorial selesai! Bonus $2.000."};
  }
  return {ok:true,step:tutorialSteps[state.tutorial.currentStep]};
}

export function tickTutorial(){
  if(!state.tutorial.active||state.tutorial.completed)return null;
  return advance();
}

export function completeCurrentStepByAction(action){
  if(!state.tutorial.active)return null;
  const step=getCurrentStep();
  if(!step)return null;
  if(step.nextOnAction&&!step.nextOnAction.includes(action))return null;
  if(!isStepSatisfied(step)){
    if(step.requires?.type==="taps"&&action==="code"){
      state.stats.totalTaps++;
    }
  }
  return advance();
}

export function getTutorialProgress(){
  if(!state.tutorial.active&&!state.tutorial.completed)return {active:false,percent:0,current:0,total:tutorialSteps.length};
  return {
    active:state.tutorial.active,
    completed:state.tutorial.completed,
    current:state.tutorial.currentStep,
    total:tutorialSteps.length,
    percent:Math.round((state.tutorial.currentStep/tutorialSteps.length)*100)
  };
}
