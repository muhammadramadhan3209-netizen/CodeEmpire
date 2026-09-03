import {state} from "../state.js";

const competitorSeeds=[
  {id:"nova",name:"Nova Stack",baseGrowth:38},
  {id:"pixel",name:"Pixel Forge",baseGrowth:31},
  {id:"quantum",name:"Quantum Works",baseGrowth:45},
  {id:"orbit",name:"Orbit Labs",baseGrowth:35}
];

export function initializeMarket(){
  if(state.market.competitors.length)return state.market.competitors;
  state.market.competitors=competitorSeeds.map((company,index)=>({...company,companyValue:3000+index*2200,lastGrowthAt:Date.now()}));
  state.market.lastTickAt=Date.now();
  return state.market.competitors;
}

function cleanupPenalties(now){
  Object.entries(state.market.categoryPenalties).forEach(([category,penalty])=>{if(penalty.expiresAt<=now)delete state.market.categoryPenalties[category];});
}

function triggerMarketEvent(type){
  if(type==="steal_client"&&state.availableClients.length){
    const stolen=state.availableClients.pop();
    return {type,message:`Kompetitor merebut client ${stolen.name}.`};
  }
  const category=state.products[0]?.category||"productivity";
  state.market.categoryPenalties[category]={multiplier:.72,expiresAt:Date.now()+90_000};
  return {type:"product_rival",message:`Produk rival menekan income kategori ${category} selama 90 detik.`};
}

export function tickMarket({forceEvent=null}={}){
  const competitors=initializeMarket();
  const now=Date.now();
  cleanupPenalties(now);
  competitors.forEach(company=>{
    const variance=.85+Math.random()*.3;
    company.companyValue+=company.baseGrowth*variance;
    company.lastGrowthAt=now;
  });
  let event=null;
  if(forceEvent)event=triggerMarketEvent(forceEvent);
  else if(now-state.market.lastTickAt>=30_000){
    state.market.lastTickAt=now;
    if(Math.random()<.12)event=triggerMarketEvent(Math.random()<.5?"steal_client":"product_rival");
  }
  if(event)state.market.lastEvent={...event,at:now};
  return event;
}

export function getLeaderboard(){
  const rows=[{id:"player",name:"Code Empire",companyValue:state.equity.companyValue,isPlayer:true},...initializeMarket()];
  return rows.sort((a,b)=>b.companyValue-a.companyValue).map((company,index)=>({...company,rank:index+1}));
}
