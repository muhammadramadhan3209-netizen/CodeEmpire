import {state} from "../state.js";
import {completeCurrentStepByAction} from "./tutorialSystem.js";
import {registerProgress} from "./questSystem.js";

export const officeTiers=[
  {name:"Kamar Kos",cost:0,capacity:2},
  {name:"Studio Office",cost:1200,capacity:4},
  {name:"Small Startup",cost:3500,capacity:7},
  {name:"Creative Hub",cost:8000,capacity:11},
  {name:"Growth Office",cost:18000,capacity:16},
  {name:"Tech Campus",cost:40000,capacity:24},
  {name:"Innovation Tower",cost:85000,capacity:34},
  {name:"Regional HQ",cost:170000,capacity:48},
  {name:"Global Campus",cost:350000,capacity:70},
  {name:"Empire City",cost:750000,capacity:100}
];

export const departmentDefs={
  development:{label:"Development",roles:["frontend","backend","ai","contractor"]},
  marketing:{label:"Marketing",roles:["marketing","contractor"]},
  sales:{label:"Sales",roles:["sales","contractor"]},
  security:{label:"Security / IT",roles:["security","contractor"]}
};

export function getOfficeCapacity(){return officeTiers[Math.min(officeTiers.length-1,state.officeLevel-1)]?.capacity||2;}
export function officeName(){return officeTiers[Math.min(officeTiers.length-1,state.officeLevel-1)]?.name||officeTiers.at(-1).name;}
export function getNextOffice(){return officeTiers[state.officeLevel]||null;}

export function upgradeOffice(){
  const next=getNextOffice();
  if(!next)return {ok:false,reason:"Office sudah mencapai level maksimum."};
  if(state.money<next.cost)return {ok:false,reason:`Butuh $${next.cost.toLocaleString("en-US")} untuk upgrade office.`};
  state.money-=next.cost;
  state.officeLevel++;
  completeCurrentStepByAction("office");
  return {ok:true,office:next,message:`Office naik menjadi ${next.name}.`};
}

export function assignEmployee(employeeId,departmentName){
  const employee=state.team.find(item=>item.id===employeeId);
  const department=state.departments[departmentName];
  const definition=departmentDefs[departmentName];
  if(!employee)return {ok:false,reason:"Employee tidak ditemukan."};
  if(!department||!definition)return {ok:false,reason:"Department tidak ditemukan."};
  if(!definition.roles.includes(employee.role))return {ok:false,reason:`Role ${employee.role} tidak cocok untuk ${definition.label}.`};
  unassignEmployee(employeeId);
  employee.assignedTo=departmentName;
  department.assigned.push(employeeId);
  return {ok:true,employee,message:`${employee.name} ditempatkan di ${definition.label}.`};
}

export function unassignEmployee(employeeId){
  const employee=state.team.find(item=>item.id===employeeId);
  if(!employee)return {ok:false,reason:"Employee tidak ditemukan."};
  Object.values(state.departments).forEach(department=>department.assigned=department.assigned.filter(id=>id!==employeeId));
  const previous=employee.assignedTo;
  employee.assignedTo=null;
  return {ok:true,employee,message:previous?`${employee.name} dilepas dari department.`:`${employee.name} belum memiliki department.`};
}

export function getDepartmentUpgradeCost(name){
  const department=state.departments[name];
  return department?Math.ceil(1400*department.level**2.15):0;
}

export function getDepartmentRequiredStaff(name){
  const department=state.departments[name];
  return department?Math.min(4,Math.max(1,Math.ceil(department.level/2))):0;
}

export function upgradeDepartment(name){
  const department=state.departments[name];
  if(!department)return {ok:false,reason:"Department tidak ditemukan."};
  if(department.level>=10)return {ok:false,reason:"Department sudah mencapai level maksimum."};
  const required=getDepartmentRequiredStaff(name);
  if(department.assigned.length<required)return {ok:false,reason:`Butuh ${required} employee yang ditugaskan ke department ini.`};
  const cost=getDepartmentUpgradeCost(name);
  if(state.money<cost)return {ok:false,reason:`Butuh $${cost.toLocaleString("en-US")} untuk upgrade department.`};
  state.money-=cost;
  department.level++;
  registerProgress("departmentUpgrades",1);
  return {ok:true,department,message:`${departmentDefs[name].label} naik ke level ${department.level}.`};
}

export function departmentEffect(name){
  const department=state.departments[name];
  if(!department)return 1;
  if(name==="security")return Math.min(.3,(department.level-1)*.04+department.assigned.length*.015);
  return 1+(department.level-1)*.12+department.assigned.length*.025;
}

export function officeAssetKey(){
  if(state.officeLevel>=10)return "level10";
  if(state.officeLevel>=5)return "level5";
  return "level1";
}
