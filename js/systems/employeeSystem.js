import {state,addXP} from "../state.js";
import {getPersonality} from "../data/personality.js";

function findEmployee(id){return state.team.find(employee=>employee.id===id);}
function trainingCost(employee){
  const personality=getPersonality(employee.personality);
  const cost=Math.ceil(320*employee.level**1.45);
  return Math.ceil(cost*(personality.effects.trainingCost||1));
}

export function trainEmployee(id){
  const employee=findEmployee(id);
  if(!employee)return {ok:false,reason:"Employee tidak ditemukan."};
  if(employee.training)return {ok:false,reason:"Employee sedang mengikuti training."};
  const cost=trainingCost(employee);
  if(state.money<cost)return {ok:false,reason:`Butuh $${cost.toLocaleString("en-US")} untuk training.`};
  state.money-=cost;
  const personality=getPersonality(employee.personality);
  const durationMultiplier=1-(personality.effects.trainingSpeed||0);
  employee.training={progress:0,duration:Math.max(2,(8+employee.level*2)*durationMultiplier),cost};
  return {ok:true,employee,message:`Training ${employee.name} dimulai.`};
}

export function tickEmployeeTraining(){
  const completed=[];
  state.team.forEach(employee=>{
    if(!employee.training)return;
    employee.training.progress=Math.min(100,employee.training.progress+100/employee.training.duration);
    if(employee.training.progress<100)return;
    employee.training=null;
    employee.level++;
    employee.xp=0;
    employee.morale=Math.min(100,employee.morale+8);
    employee.stress=Math.max(0,employee.stress-5);
    addXP(20+employee.level*4);
    completed.push(employee);
  });
  return completed;
}

export function promoteEmployee(id){
  const employee=findEmployee(id);
  if(!employee)return {ok:false,reason:"Employee tidak ditemukan."};
  const next=employee.tier==="Junior"&&employee.level>=3?"Senior":employee.tier==="Senior"&&employee.level>=6?"Lead":null;
  if(!next)return {ok:false,reason:employee.tier==="Lead"?"Employee sudah berada di tier Lead.":"Level employee belum memenuhi syarat promosi."};
  const cost=Math.ceil(employee.salary*5);
  if(state.money<cost)return {ok:false,reason:`Butuh $${cost.toLocaleString("en-US")} untuk promosi.`};
  state.money-=cost;
  employee.tier=next;
  employee.isLead=next==="Lead";
  employee.salary=Math.ceil(employee.salary*1.15);
  employee.morale=100;
  employee.loyalty=Math.min(100,employee.loyalty+10);
  return {ok:true,employee,message:`${employee.name} dipromosikan menjadi ${next}.`};
}

export function giveBonus(id){
  const employee=findEmployee(id);
  if(!employee)return {ok:false,reason:"Employee tidak ditemukan."};
  const cost=Math.ceil(employee.salary*2);
  if(state.money<cost)return {ok:false,reason:`Butuh $${cost.toLocaleString("en-US")} untuk bonus.`};
  state.money-=cost;
  employee.morale=Math.min(100,employee.morale+35);
  employee.stress=Math.max(0,employee.stress-10);
  employee.loyalty=Math.min(100,employee.loyalty+5);
  return {ok:true,employee,message:`Bonus diberikan. Morale ${employee.name} naik.`};
}

export function paySalary(){
  const total=state.team.reduce((sum,employee)=>sum+employee.salary,0);
  if(total<=0)return {ok:true,total:0,message:null};
  if(state.money>=total){
    state.money-=total;
    state.team.forEach(employee=>{
      const personality=getPersonality(employee.personality);
      const loyaltyResist=personality.effects.payrollResistance||0;
      const moraleGain=1+loyaltyResist*1.2;
      employee.morale=Math.min(100,employee.morale+moraleGain);
    });
    return {ok:true,total,message:`Payroll $${total.toLocaleString("en-US")} dibayar.`};
  }
  const available=state.money;
  state.money=0;
  state.team.forEach(employee=>{
    const personality=getPersonality(employee.personality);
    const loyaltyResist=personality.effects.payrollResistance||0;
    const penalty=Math.max(2,12-loyaltyResist*15);
    employee.morale=Math.max(0,employee.morale-penalty);
    employee.stress=Math.min(100,employee.stress+5);
  });
  return {ok:false,total,shortage:total-available,message:"Kas tidak cukup untuk payroll. Morale tim menurun."};
}

export function employeeOutput(employee){
  if(!employee)return 0;
  const personality=getPersonality(employee.personality);
  const moraleMultiplier=.45+(employee.morale/100)*.55;
  const tierMultiplier=employee.tier==="Lead"?1.45:employee.tier==="Senior"?1.2:1;
  const personalityMultiplier=1+(personality.effects.productivity||0);
  const stressPenalty=1-(employee.stress/100)*.18;
  return employee.level*moraleMultiplier*tierMultiplier*personalityMultiplier*stressPenalty;
}

export function departmentStaffOutput(departmentName){
  let sum=state.team.filter(employee=>employee.assignedTo===departmentName).reduce((sum,employee)=>sum+employeeOutput(employee),0);
  state.team.filter(employee=>employee.assignedTo===departmentName).forEach(employee=>{
    const personality=getPersonality(employee.personality);
    if(personality.effects.moraleAura){
      state.team.filter(other=>other.assignedTo===departmentName&&other.id!==employee.id).forEach(other=>{
        other.morale=Math.min(100,other.morale+personality.effects.moraleAura);
      });
    }
  });
  return sum;
}

export function securityStaffBonus(){
  const output=state.team.filter(employee=>employee.role==="security"&&employee.assignedTo==="security").reduce((sum,employee)=>sum+employeeOutput(employee),0);
  return Math.min(.3,output*.018);
}

export function getEmployeeTrainingCost(id){
  const employee=findEmployee(id);
  return employee?trainingCost(employee):0;
}

export function tickEmployeeWellbeing(){
  state.team.forEach(employee=>{
    const personality=getPersonality(employee.personality);
    const stressGain=employee.assignedTo?.startsWith("development")?1.5:0.5;
    employee.stress=Math.min(100,employee.stress+stressGain);
    employee.morale=Math.max(0,employee.morale-(personality.effects.moraleDecay||0));
  });
  return state.team.length;
}

export function getEmployee(id){
  if(!id)return null;
  return state.team.find(employee=>employee.id===id)||null;
}

export function getEmployeeDetails(id){
  const employee=getEmployee(id);
  if(!employee)return null;
  const personality=getPersonality(employee.personality);
  return {
    employee,
    personality,
    mood:employee.stress>=70?"burnout":employee.morale>=75?"happy":employee.stress>=40||employee.morale<45?"stressed":"neutral",
    salaryGrowth:Math.max(0,employee.loyalty-50)/100,
    output:employeeOutput(employee),
    summary:`${personality.label} • ${roleSummary(personality)}`
  };
}

function roleSummary(personality){
  const effects=personality.effects;
  const parts=[];
  if(effects.productivity){
    const sign=effects.productivity>=0?"+":"";
    parts.push(`${sign}${Math.round(effects.productivity*100)}% produktivitas`);
  }
  if(effects.innovation)parts.push(`+${Math.round(effects.innovation*100)}% inovasi`);
  if(effects.trainingSpeed)parts.push(`+${Math.round(effects.trainingSpeed*100)}% training speed`);
  if(effects.trainingCost&&effects.trainingCost!==1)parts.push(`Training cost x${effects.trainingCost.toFixed(2)}`);
  if(effects.clientRating)parts.push(`+${effects.clientRating.toFixed(1)} rating client`);
  if(effects.moraleAura)parts.push(`+${Math.round(effects.moraleAura*100)}% morale aura`);
  if(effects.payrollResistance)parts.push(`+${Math.round(effects.payrollResistance*100)}% resistansi payroll`);
  if(effects.offlineBonus)parts.push(`+${Math.round(effects.offlineBonus*100)}% offline bonus`);
  if(effects.hackReward&&effects.hackReward!==1)parts.push(`x${effects.hackReward} hack reward`);
  if(effects.hackHeat&&effects.hackHeat!==1)parts.push(`x${effects.hackHeat} hack heat`);
  if(effects.moraleDecay)parts.push(`Morale decay x${effects.moraleDecay.toFixed(2)}`);
  if(!parts.length)return "Tidak ada efek khusus.";
  return parts.join(" • ");
}
