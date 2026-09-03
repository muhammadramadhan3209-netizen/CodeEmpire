import {state,addMoney,addXP} from "../state.js";
import {achievementDefs} from "../data/achievements.js";
import {getCareerTier} from "../data/careerTiers.js";

const extendedDefs = [
  {id:"millionaire",name:"Millionaire",description:"Kumpulkan $1.000.000.",category:"business",condition:state=>state.stats.totalEarned>=1_000_000,reward:{money:25_000,xp:500,badge:"Millionaire"}},
  {id:"startup_king",name:"Startup King",description:"Capai career tier Startup Founder.",category:"business",condition:state=>["startup","ceo","techCompany","globalCorporation"].includes(getCareerTier(state.level,state.reputation).id),reward:{money:5000,xp:300,badge:"Startup King"}},
  {id:"product_master",name:"Product Master",description:"Rilis 5 produk sukses.",category:"development",condition:state=>state.stats.productsLaunched>=5,reward:{money:7500,xp:400,badge:"Product Master"}},
  {id:"clean_company",name:"Clean Company",description:"Capai 50 Clean Rep dengan 0 Hack Job.",category:"legit",condition:state=>state.hacker.cleanRep>=50&&state.stats.hackJobsCompleted===0,reward:{money:6000,xp:350,badge:"Pure Path"}},
  {id:"hacker_legend",name:"Hacker Legend",description:"Selesaikan 25 hack job.",category:"hacking",condition:state=>state.stats.hackJobsCompleted>=25,reward:{money:12_000,xp:600,badge:"Legend"}},
  {id:"productivity_master",name:"Productivity Master",description:"Capai 5 produk dengan kualitas 80+.",category:"development",condition:state=>state.products.filter(product=>product.quality>=80).length>=5,reward:{money:6000,xp:400,badge:"Quality Owner"}},
  {id:"tycoon",name:"Tech Tycoon",description:"Capai career tier Global Corporation.",category:"business",condition:state=>getCareerTier(state.level,state.reputation).id==="globalCorporation",reward:{money:50_000,xp:1500,badge:"Tycoon"}}
];

const allDefs = [...achievementDefs,...extendedDefs];

export function checkAchievements(){
  const unlocked=[];
  allDefs.forEach(achievement=>{
    if(state.achievements[achievement.id]||!achievement.condition(state))return;
    if(achievement.reward.money)addMoney(achievement.reward.money);
    if(achievement.reward.xp)addXP(achievement.reward.xp);
    state.achievements[achievement.id]={unlockedAt:Date.now(),badge:achievement.reward.badge};
    unlocked.push(achievement);
  });
  return unlocked;
}

export function getAchievementProgress(){
  const unlocked=allDefs.filter(achievement=>state.achievements[achievement.id]).length;
  return {unlocked,total:allDefs.length,percent:Math.round(unlocked/allDefs.length*100)};
}

export function getAllAchievementDefs(){return allDefs;}
