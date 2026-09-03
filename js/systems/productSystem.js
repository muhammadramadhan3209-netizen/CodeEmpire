import {state,addXP} from "../state.js";
import {productCategories} from "../data/productCategories.js";
import {departmentEffect} from "./officeSystem.js";
import {departmentStaffOutput} from "./employeeSystem.js";
import {getPersonality} from "../data/personality.js";
import {registerProgress} from "./questSystem.js";
import {tickBusinessEvents} from "./businessEventSystem.js";

const makeId=category=>`product-${category}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;

function categoryById(id){return productCategories.find(category=>category.id===id);}
function skillMatch(category){
  const entries=Object.entries(category.required);
  return entries.reduce((sum,[skill,required])=>sum+Math.min(1,(state.skills[skill]||0)/required),0)/entries.length;
}

function averagePersonalityInnovation(){
  const devs=state.team.filter(employee=>employee.assignedTo==="development");
  if(!devs.length)return 0;
  return devs.reduce((sum,employee)=>sum+(getPersonality(employee.personality).effects.innovation||0),0)/devs.length;
}

export function startProductDev(categoryId){
  const category=categoryById(categoryId);
  if(!category)return {ok:false,reason:"Kategori produk tidak ditemukan."};
  if(state.activeProductDev)return {ok:false,reason:"Selesaikan produk aktif terlebih dahulu."};
  if(departmentStaffOutput("development")<=0)return {ok:false,reason:"Tugaskan minimal satu employee ke Development."};
  if(state.money<category.cost)return {ok:false,reason:`Butuh $${category.cost.toLocaleString("en-US")} untuk memulai produk.`};
  state.money-=category.cost;
  state.activeProductDev={...category,progress:0,startedAt:Date.now(),skillMatch:skillMatch(category)};
  return {ok:true,product:state.activeProductDev,message:`Development ${category.name} dimulai.`};
}

export function tickProductDev(){
  const active=state.activeProductDev;
  if(!active)return null;
  const staffBonus=1+departmentStaffOutput("development")*.035;
  const speed=departmentEffect("development")*staffBonus*(.55+active.skillMatch*.45);
  active.progress=Math.min(100,active.progress+(100/active.duration)*speed);
  if(active.progress<100)return null;
  const sequence=state.products.filter(product=>product.category===active.id).length+1;
  const personalityBoost=averagePersonalityInnovation();
  const product={
    id:makeId(active.id),
    name:`${active.name} ${sequence}`,
    category:active.id,
    baseIncome:active.baseIncome,
    quality:55+active.skillMatch*30,
    innovation:Math.min(100,40+personalityBoost*100+active.skillMatch*30),
    marketDemand:50+Math.floor(Math.random()*20),
    createdAt:Date.now(),
    lastMaintainedAt:Date.now(),
    health:100
  };
  state.products.push(product);
  state.activeProductDev=null;
  state.stats.productsLaunched=(state.stats.productsLaunched||0)+1;
  registerProgress("productsLaunched",1);
  addXP(120+active.duration);
  return {ok:true,type:"product_completed",product,message:`${product.name} berhasil dirilis. +$${product.baseIncome}/detik.`};
}

export function getProductMultiplier(product,at=Date.now()){
  const decaySteps=Math.floor(Math.max(0,at-product.lastMaintainedAt)/120_000);
  const maintenanceMultiplier=Math.max(.25,1-decaySteps*.12);
  const penalty=state.market.categoryPenalties?.[product.category];
  const marketMultiplier=penalty&&penalty.expiresAt>at?penalty.multiplier:1;
  const qualityMultiplier=1+(product.quality-50)/100;
  const innovationBonus=(product.innovation/100)*.3;
  const demandBonus=(product.marketDemand-50)/200;
  product.health=Math.round(maintenanceMultiplier*100);
  return Math.max(.1,maintenanceMultiplier*marketMultiplier*qualityMultiplier+innovationBonus+demandBonus);
}

export function getProductIncomePerSecond(at=Date.now()){
  return state.products.reduce((sum,product)=>sum+product.baseIncome*getProductMultiplier(product,at),0);
}

export function productIncome(){
  if(Date.now()<(state.hacker?.officeFreezeUntil||0))return {gross:0,net:0};
  const gross=getProductIncomePerSecond();
  const net=gross*Math.max(0,Math.min(1,state.equity.playerShare/100));
  state.money+=net;
  return {gross,net};
}

export function maintainProduct(id){
  const product=state.products.find(item=>item.id===id);
  if(!product)return {ok:false,reason:"Produk tidak ditemukan."};
  const cost=Math.ceil(product.baseIncome*18);
  if(state.money<cost)return {ok:false,reason:`Butuh $${cost.toLocaleString("en-US")} untuk maintenance.`};
  state.money-=cost;
  product.lastMaintainedAt=Date.now();
  product.health=100;
  product.quality=Math.min(100,product.quality+5);
  registerProgress("maintenances",1);
  return {ok:true,product,message:`${product.name} kembali ke kondisi optimal.`};
}

export const productTypes=Object.fromEntries(productCategories.map(category=>[category.id,category]));
export function createProduct(type){return startProductDev(type);}
