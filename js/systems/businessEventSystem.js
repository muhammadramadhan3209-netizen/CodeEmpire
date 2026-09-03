import {state,addMoney,addXP} from "../state.js";
import {feedback} from "./feedbackSystem.js";
import {startReputationDecay} from "./reputationDecay.js";
import {tickTutorial,completeCurrentStepByAction} from "./tutorialSystem.js";
import {registerProgress} from "./questSystem.js";

const businessEventDefs = [
  {
    id:"big_client",
    title:"Client besar datang",
    description:"Sebuah enterprise membutuhkan jasa cepat. Tawarkan premium atau tolak dengan aman.",
    icon:"client",
    options:[
      {id:"accept",label:"TERIMA (+uang, -reputation kalau gagal)",effects:{money:3500,reputation:4,heat:-2}},
      {id:"decline",label:"DEKLINASI (aman)",effects:{reputation:1}}
    ]
  },
  {
    id:"viral_product",
    title:"Produk kamu viral",
    description:"Salah satu produkmu trending. Tambah server atau biarkan viral berlalu.",
    icon:"viral",
    options:[
      {id:"scale",label:"TINGKATKAN SERVER (-uang, +reputation)",effects:{money:-1800,reputation:8}},
      {id:"ignore",label:"ABAIKAN (resiko)",effects:{reputation:-2,moraleDelta:-3}}
    ]
  },
  {
    id:"server_error",
    title:"Server error",
    description:"Downtime membuat client menunggu. Tangani darurat atau terima penalti.",
    icon:"outage",
    options:[
      {id:"emergency",label:"TIM DARURAT (-uang, +reputation)",effects:{money:-1200,reputation:3}},
      {id:"accept",label:"TERIMA PENALTI",effects:{money:-800,reputation:-4}}
    ]
  },
  {
    id:"burnout",
    title:"Employee burnout",
    description:"Beberapa anggota tim kelelahan. Beri bonus atau rotasi.",
    icon:"burnout",
    options:[
      {id:"bonus",label:"BONUS TIM (-uang, +morale)",effects:{money:-1500,moraleDelta:12}},
      {id:"rest",label:"HARI LIBUR (-produktivitas 1 menit)",effects:{moraleDelta:6,productivityPenalty:60_000}}
    ]
  },
  {
    id:"rival_attack",
    title:"Kompetitor menyerang",
    description:"Rival meluncurkan produk mirip. Counter dengan diskon atau inovasi.",
    icon:"warning",
    options:[
      {id:"counter_innovate",label:"INOVASI CEPAT (-uang, +innovation)",effects:{money:-2000,innovationDelta:8}},
      {id:"price_war",label:"PERANG HARGA (-uang, +marketDemand)",effects:{money:-1200,marketDemandDelta:6}}
    ]
  },
  {
    id:"investor_interest",
    title:"Investor tertarik",
    description:"Sebuah VC ingin bertemu. Buka pintu atau fokus pada tim.",
    icon:"sponsor",
    options:[
      {id:"open_door",label:"BUKA PINTU (+reputation, +offer chance)",effects:{reputation:5,investorBoost:1}},
      {id:"focus",label:"FOKUS TIM (+loyalty)",effects:{reputation:1,loyaltyDelta:8}}
    ]
  },
  {
    id:"cash_crunch",
    title:"Krisis keuangan",
    description:"Cashflow negatif bulan ini. Cari talangan atau kurangi biaya.",
    icon:"insight",
    options:[
      {id:"loan",label:"CARI PINJAMAN (+uang, +heat)",effects:{money:2200,heat:8}},
      {id:"cut_cost",label:"POTONG BIAYA (-morale, -reputation)",effects:{moraleDelta:-8,reputation:-3}}
    ]
  },
  {
    id:"product_breakthrough",
    title:"Terobosan produk",
    description:"Tim R&D menemukan optimasi besar.",
    icon:"insight",
    options:[
      {id:"ship",label:"RELEASE SEGERA (+uang, -kualitas)",effects:{money:2400,qualityDelta:-5}},
      {id:"polish",label:"POLISH DULU (-uang, +kualitas)",effects:{money:-900,qualityDelta:8}}
    ]
  },
  {
    id:"mentor_offer",
    title:"Tawaran mentor",
    description:"Seorang senior ingin membimbing tim 1 minggu. Pilih fokus.",
    icon:"insight",
    options:[
      {id:"tech",label:"FOKUS TEKNIS (+5% dev speed)",effects:{reputation:3,productivityPenalty:0}},
      {id:"culture",label:"FOKUS BUDAYA (+15% morale)",effects:{moraleDelta:15}},
      {id:"skip",label:"TOLAK",effects:{reputation:-1}}
    ]
  },
  {
    id:"open_source_request",
    title:"Permintaan open source",
    description:"Komunitas meminta kontribusi. Pilih dampak.",
    icon:"sponsor",
    options:[
      {id:"donate",label:"DONASI WAKTU (+reputation)",effects:{reputation:6,money:-200}},
      {id:"monetize",label:"MONETISASI (+uang, -reputation)",effects:{money:1800,reputation:-3}}
    ]
  },
  {
    id:"audit_request",
    title:"Audit keamanan",
    description:"Client besar meminta audit. Pilih strategi.",
    icon:"warning",
    options:[
      {id:"full",label:"AUDIT PENUH (-uang, +reputation besar)",effects:{money:-3500,reputation:12}},
      {id:"basic",label:"AUDIT DASAR (+sedikit reputation)",effects:{money:-900,reputation:4}}
    ]
  },
  {
    id:"media_buzz",
    title:"Media meliput",
    description:"Jurnalis ingin cerita. Pilih angle.",
    icon:"sponsor",
    options:[
      {id:"positive",label:"CERITA POSITIF (+reputation)",effects:{reputation:8}},
      {id:"controversial",label:"CERITA KONTROVERSIAL (+reputation besar, -kredibilitas)",effects:{reputation:14,reputationDecay:5}}
    ]
  }
];

function applyEffects(effects={}){
  if(effects.money)addMoney(effects.money);
  if(effects.reputation)state.reputation=Math.min(100,Math.max(0,state.reputation+effects.reputation));
  if(effects.heat)state.hacker.heat=Math.min(100,Math.max(0,state.hacker.heat+effects.heat));
  if(effects.xp)addXP(effects.xp);
  if(effects.moraleDelta){
    state.team.forEach(employee=>{
      employee.morale=Math.min(100,Math.max(0,employee.morale+effects.moraleDelta));
    });
  }
  if(effects.loyaltyDelta){
    state.team.forEach(employee=>{
      employee.loyalty=Math.min(100,Math.max(0,employee.loyalty+effects.loyaltyDelta));
    });
  }
  if(effects.innovationDelta){
    state.products.forEach(product=>{
      product.innovation=Math.min(100,Math.max(0,product.innovation+effects.innovationDelta));
    });
  }
  if(effects.qualityDelta){
    state.products.forEach(product=>{
      product.quality=Math.min(100,Math.max(20,product.quality+effects.qualityDelta));
    });
  }
  if(effects.marketDemandDelta){
    state.products.forEach(product=>{
      product.marketDemand=Math.min(100,Math.max(0,product.marketDemand+effects.marketDemandDelta));
    });
  }
  if(effects.reputationDecay){
    startReputationDecay(Number(effects.reputationDecay)||5,effects.reputationDecayDuration||600_000);
  }
  if(effects.productivityPenalty){
    state.market=state.market||{};
    state.market.productivityPenaltyUntil=Date.now()+effects.productivityPenalty;
  }
  if(effects.investorBoost){
    state.equity=state.equity||{};
    state.equity.investorBoostUntil=Date.now()+180_000;
  }
}

export function rollBusinessEvent(forceId=null){
  const now=Date.now();
  if(state.businessEvents.pending)return null;
  if(!forceId&&now-state.businessEvents.lastEventAt<state.businessEvents.intervalMs)return null;
  if(!forceId&&Math.random()>.35)return null;
  const defs=businessEventDefs;
  const def=forceId?defs.find(item=>item.id===forceId):defs[Math.floor(Math.random()*defs.length)];
  if(!def)return null;
  state.businessEvents.pending={
    id:def.id,
    title:def.title,
    description:def.description,
    icon:def.icon,
    options:def.options,
    startedAt:now
  };
  state.businessEvents.lastEventAt=now;
  return state.businessEvents.pending;
}

export function resolveBusinessEvent(optionId){
  const pending=state.businessEvents.pending;
  if(!pending)return {ok:false,reason:"Tidak ada event aktif."};
  const option=pending.options.find(item=>item.id===optionId);
  if(!option)return {ok:false,reason:"Pilihan tidak valid."};
  applyEffects(option.effects||{});
  const record={id:pending.id,title:pending.title,choice:option.label,at:Date.now()};
  state.businessEvents.history=[record,...state.businessEvents.history].slice(0,30);
  state.businessEvents.pending=null;
  feedback("warning");
  return {ok:true,message:`${pending.title} • ${option.label}`};
}

export function dismissBusinessEvent(){
  if(!state.businessEvents.pending)return null;
  state.businessEvents.pending=null;
  return {ok:true};
}

export function tickBusinessEvents(){
  if(state.businessEvents.pending)return null;
  return rollBusinessEvent();
}

export function getBusinessEventDefs(){return businessEventDefs;}

export function getProductIncomeMultiplier(){
  let mult=1;
  if(state.market?.productivityPenaltyUntil>Date.now())mult*=.85;
  return mult;
}
