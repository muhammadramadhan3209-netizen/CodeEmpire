import {clients} from "../data/clients.js";
import {state,addXP} from "../state.js";
import {departmentEffect} from "./officeSystem.js";
import {getPersonality} from "../data/personality.js";
import {registerProgress} from "./questSystem.js";

const reviews={
  1:["Hasil belum sesuai kebutuhan kami.","Proyek selesai, tetapi banyak target terlewat."],
  2:["Masih perlu banyak perbaikan.","Komunikasi baik, hasil belum stabil."],
  3:["Cukup baik untuk versi pertama.","Target utama selesai dengan baik."],
  4:["Pengerjaan rapi dan tepat sasaran.","Kami puas dengan hasil tim ini."],
  5:["Luar biasa. Kami akan kembali lagi.","Hasil sangat kuat dan selesai tepat waktu."]
};

function unlockedClients(){
  const rating=state.clientRating.average||0;
  return clients.filter(client=>state.level>=client.minLevel&&rating>=client.minRating);
}

export function generateClients(force=false){
  if(!force&&state.availableClients.length)return state.availableClients;
  const count=Math.min(6,3+Math.floor((departmentEffect("marketing")-1)*4));
  const unlocked=unlockedClients();
  const ordered=[...unlocked].sort((a,b)=>a.difficulty-b.difficulty||Math.random()-.5);
  state.availableClients=ordered.slice(0,count).map(client=>({...client,status:"available",offerId:`${client.id}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`}));
  return state.availableClients;
}

export function acceptClient(id,mode="custom"){
  const client=generateClients().find(item=>item.id===id||item.offerId===id);
  if(!client)return {ok:false,reason:"Client tidak tersedia atau belum terbuka."};
  if(state.activeClient)return {ok:false,reason:"Selesaikan client aktif terlebih dahulu."};
  if(!["custom","quick","ai"].includes(mode))return {ok:false,reason:"Mode delivery tidak valid."};
  if(mode==="ai"&&(state.skills.ai||0)<2)return {ok:false,reason:"Butuh AI skill level 2 untuk AI Assist."};
  if(state.hacker?.wanted&&(client.budget>=4000||["premium","enterprise"].includes(client.tier)))return {ok:false,reason:"Client premium terkunci karena status Wanted."};
  const duration=mode==="quick"?Math.max(12,Math.ceil(client.deadline*.55)):mode==="ai"?Math.max(16,Math.ceil(client.deadline*.72)):client.deadline;
  state.activeClient={...client,mode,duration,elapsed:0,progress:0,startedAt:Date.now()};
  return {ok:true,client:state.activeClient,message:`Project ${client.project} dimulai.`};
}

function skillMatch(client){
  const entries=Object.entries(client.required||{});
  if(!entries.length)return 1;
  return entries.reduce((sum,[skill,required])=>sum+Math.min(1,(state.skills[skill]||0)/required),0)/entries.length;
}

function updateRating(rating,client,review){
  const previousCount=state.clientRating.count;
  state.clientRating.average=((state.clientRating.average*previousCount)+rating)/(previousCount+1);
  state.clientRating.count=previousCount+1;
  state.clientRating.history.push({clientId:client.id,name:client.name,rating,review,completedAt:Date.now()});
  state.clientRating.history=state.clientRating.history.slice(-20);
}

export function tickClient(){
  const project=state.activeClient;
  if(!project)return null;
  project.elapsed++;
  project.progress=Math.min(100,project.progress+100/project.duration);
  if(project.progress<100)return null;
  const match=skillMatch(project);
  const timeBonus=project.elapsed<=project.deadline?0.35:0;
  const modeModifier=project.mode==="quick"?-.45:project.mode==="ai"?Math.min(.35,(state.skills.ai||0)*.04):0;
  const randomFactor=(Math.random()-.5)*.45;
  const perfectionistBonus=state.team.some(employee=>employee.assignedTo==="development"&&getPersonality(employee.personality).effects.clientRating?getPersonality(employee.personality).effects.clientRating*.1:0);
  const rating=Math.max(1,Math.min(5,Math.round(1+match*3+timeBonus+modeModifier+randomFactor+perfectionistBonus)));
  const salesMultiplier=departmentEffect("sales");
  const reward=Math.floor(project.budget*(.58+match*.42)*salesMultiplier);
  const reviewPool=reviews[rating];
  const review=reviewPool[Math.floor(Math.random()*reviewPool.length)];
  state.money+=reward;
  state.reputation=Math.min(100,state.reputation+rating);
  state.hacker.cleanRep=Math.max(state.hacker.cleanRep,state.reputation);
  addXP(35+rating*15);
  updateRating(rating,project,review);
  state.availableClients=state.availableClients.filter(client=>client.offerId!==project.offerId);
  let repeatOffer=null;
  if(rating>=4&&Math.random()<.35)repeatOffer={...project,budget:Math.floor(project.budget*1.25),difficulty:project.difficulty+1,offerId:`${project.id}-repeat-${Date.now()}`,status:"repeat"};
  state.activeClient=null;
  if(state.availableClients.length<2)generateClients(true);
  if(repeatOffer)state.availableClients=[repeatOffer,...state.availableClients.filter(client=>client.id!==repeatOffer.id)].slice(0,6);
  state.stats.clientsCompleted=(state.stats.clientsCompleted||0)+1;
  registerProgress("clientsCompleted",1);
  return {ok:true,type:"client_completed",rating,reward,review,message:`${project.name}: ${rating}★ • ${review} +$${reward.toLocaleString("en-US")}`};
}
