import {state,addMoney} from "../state.js";
import {getProductIncomePerSecond} from "./productSystem.js";

const investors=[
  {name:"Nusa Angel Fund",type:"angel"},
  {name:"Meridian Ventures",type:"venture"},
  {name:"Atlas Strategic",type:"strategic"},
  {name:"Umbra Capital",type:"shadow"}
];

export function calculateCompanyValue(){
  const recurring=state.moneyPerSecond+getProductIncomePerSecond();
  const raw=recurring*600+state.clientRating.average*1200+state.products.length*3500+state.team.length*1200+state.level*500+state.reputation*90;
  const exposurePenalty=state.hacker.identity==="exposed"?0.62:1;
  state.equity.valuePenalty=Math.min(state.equity.valuePenalty||1,exposurePenalty);
  state.equity.companyValue=Math.max(500,Math.floor(raw*state.equity.valuePenalty));
  return state.equity.companyValue;
}

export function offerInvestor(force=false){
  const value=calculateCompanyValue();
  if(state.equity.pendingOffer)return {ok:false,reason:"Masih ada tawaran investor yang menunggu."};
  if(state.equity.investors.length>=4)return {ok:false,reason:"Slot investor sudah penuh."};
  if(!force&&(value<8000||Date.now()-state.equity.lastOfferAt<120_000))return {ok:false,reason:"Belum ada investor baru."};
  const profile=investors[state.equity.investors.length%investors.length];
  const share=Math.min(18,8+state.equity.investors.length*3);
  const amount=Math.floor(value*(share/100)*1.8);
  state.equity.pendingOffer={id:`investor-${Date.now()}`,name:profile.name,type:profile.type,amount,share,createdAt:Date.now()};
  state.equity.lastOfferAt=Date.now();
  return {ok:true,offer:state.equity.pendingOffer,message:`${profile.name} menawarkan $${amount.toLocaleString("en-US")} untuk ${share}% saham.`};
}

export function acceptInvestorOffer(){
  const offer=state.equity.pendingOffer;
  if(!offer)return {ok:false,reason:"Tidak ada tawaran investor."};
  if(state.equity.playerShare<offer.share)return {ok:false,reason:"Saham pemain tidak cukup."};
  addMoney(offer.amount);
  state.equity.playerShare-=offer.share;
  state.equity.investors.push({...offer,investedAt:Date.now()});
  state.equity.pendingOffer=null;
  return {ok:true,investor:state.equity.investors.at(-1),message:`Pendanaan ${offer.name} diterima.`};
}

export function declineInvestorOffer(){
  if(!state.equity.pendingOffer)return {ok:false,reason:"Tidak ada tawaran investor."};
  const name=state.equity.pendingOffer.name;
  state.equity.pendingOffer=null;
  return {ok:true,message:`Tawaran ${name} ditolak.`};
}

export function buybackShares(investorId,amount){
  const investor=state.equity.investors.find(item=>item.id===investorId);
  const share=Math.max(0,Number(amount)||0);
  if(!investor)return {ok:false,reason:"Investor tidak ditemukan."};
  if(share<=0||share>investor.share)return {ok:false,reason:"Jumlah saham buyback tidak valid."};
  const cost=Math.ceil(calculateCompanyValue()*(share/100)*1.2);
  if(state.money<cost)return {ok:false,reason:`Butuh $${cost.toLocaleString("en-US")} untuk buyback.`};
  state.money-=cost;
  investor.share-=share;
  state.equity.playerShare+=share;
  if(investor.share<=0)state.equity.investors=state.equity.investors.filter(item=>item.id!==investorId);
  return {ok:true,cost,share,message:`${share}% saham berhasil dibeli kembali.`};
}

export function handleExposedInvestorRisk(){
  if(state.hacker.identity!=="exposed"){state.equity.exposureHandled=false;return null;}
  if(state.equity.exposureHandled||!state.equity.investors.length)return null;
  const investor=[...state.equity.investors].sort((a,b)=>b.share-a.share)[0];
  const penalty=Math.min(state.money,Math.floor(investor.amount*.2));
  state.money-=penalty;
  state.equity.playerShare+=investor.share;
  state.equity.investors=state.equity.investors.filter(item=>item.id!==investor.id);
  state.equity.valuePenalty=Math.min(state.equity.valuePenalty,.62);
  state.equity.exposureHandled=true;
  return {ok:true,type:"investor_exit",message:`${investor.name} keluar setelah identitasmu exposed. Biaya krisis $${penalty.toLocaleString("en-US")}.`};
}
