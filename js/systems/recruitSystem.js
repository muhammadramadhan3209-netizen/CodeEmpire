import {state} from "../state.js";
import {candidateTemplates,roleLabels} from "../data/candidates.js";
import {getOfficeCapacity} from "./officeSystem.js";
import {pickRandomPersonality} from "../data/personality.js";
import {registerProgress} from "./questSystem.js";
import {completeCurrentStepByAction} from "./tutorialSystem.js";

const REFRESH_INTERVAL=300_000;
const makeId=()=>globalThis.crypto?.randomUUID?.()||`candidate-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

export function getRecruitRefreshCost(){return 350+state.team.length*75;}

export function generateRecruitPool(){
  const templates=[...candidateTemplates].sort(()=>Math.random()-.5).slice(0,4);
  state.recruitPool=templates.map(template=>{
    const level=template.baseSkill+(Math.random()<.35?1:0);
    const salary=Math.round(template.baseSalary*(1+(level-template.baseSkill)*.18));
    return {
      id:makeId(),
      name:template.name,
      role:template.role,
      roleLabel:roleLabels[template.role],
      level,
      xp:0,
      salary,
      morale:80,
      stress:Math.random()<.2?Math.floor(Math.random()*20):0,
      loyalty:55+Math.floor(Math.random()*30),
      personality:pickRandomPersonality(),
      signingCost:salary*6,
      expiresAt:Date.now()+REFRESH_INTERVAL
    };
  });
  state.recruitRefreshAt=Date.now()+REFRESH_INTERVAL;
  return {ok:true,pool:state.recruitPool,message:"Kandidat baru tersedia."};
}

export function refreshRecruitPool(force=false){
  if(!force&&state.recruitPool.length&&Date.now()<state.recruitRefreshAt)return {ok:true,pool:state.recruitPool,message:"Pool kandidat masih aktif."};
  if(force){
    const cost=getRecruitRefreshCost();
    if(state.money<cost)return {ok:false,reason:`Butuh $${cost.toLocaleString("en-US")} untuk refresh kandidat.`};
    state.money-=cost;
  }
  return generateRecruitPool();
}

export function hireCandidate(candidateId){
  const candidate=state.recruitPool.find(item=>item.id===candidateId);
  if(!candidate)return {ok:false,reason:"Kandidat sudah tidak tersedia."};
  if(state.team.length>=getOfficeCapacity())return {ok:false,reason:"Kapasitas kantor penuh. Upgrade office terlebih dahulu."};
  if(state.money<candidate.signingCost)return {ok:false,reason:`Butuh $${candidate.signingCost.toLocaleString("en-US")} untuk signing bonus.`};
  state.money-=candidate.signingCost;
  state.team.push({
    id:`employee-${candidate.id}`,
    name:candidate.name,
    role:candidate.role,
    tier:"Junior",
    level:candidate.level,
    xp:0,
    salary:candidate.salary,
    morale:candidate.morale,
    stress:candidate.stress,
    loyalty:candidate.loyalty,
    personality:candidate.personality,
    assignedTo:null,
    training:null,
    isLead:false
  });
  state.recruitPool=state.recruitPool.filter(item=>item.id!==candidateId);
  registerProgress("hires",1);
  completeCurrentStepByAction("hire");
  return {ok:true,employee:state.team.at(-1),message:`${candidate.name} bergabung sebagai ${candidate.roleLabel}.`};
}
