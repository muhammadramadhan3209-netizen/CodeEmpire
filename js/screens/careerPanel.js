import {state} from "../state.js";
import {money} from "../ui.js";
import {getAsset} from "../data/assetMap.js";
import {getCurrentCareerTier,getNextCareerTierInfo} from "../systems/careerSystem.js";
import {getProductIncomePerSecond} from "../systems/productSystem.js";
import {getPassiveIncomePerSecond} from "../economy.js";

function esc(value){
  return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
}

function progressBar(value,className=""){
  const safe=Math.max(0,Math.min(100,Number(value)||0));
  return `<div class="progress-track ${className}"><div class="progress-fill" style="width:${safe}%"></div></div>`;
}

function img(category,key,className="asset-icon"){
  return `<img class="${className}" src="${getAsset(category,key)}" data-asset="${esc(category)}-${esc(key)}" alt="" loading="lazy">`;
}

function metric(label,current,target,format=String){
  const safeTarget=Math.max(1,Number(target)||1);
  const safeCurrent=Math.max(0,Number(current)||0);
  const percent=Math.min(100,Math.round((safeCurrent/safeTarget)*100));
  return `<div class="career-metric"><div class="career-metric-head"><span>${esc(label)}</span><b>${esc(format(safeCurrent))} / ${esc(format(safeTarget))}</b></div>${progressBar(percent)}<div class="career-metric-foot"><span>${percent}%</span></div></div>`;
}

function formatMoney(value){return money(value);}

function bonusList(bonuses){
  return Object.entries(bonuses).map(([key,value])=>{
    const labelMap={
      clientSlots:"Client slots tambahan",
      productSlots:"Product slots tambahan",
      investorChance:"Peluang investor",
      productQualityCap:"Kualitas produk max",
      globalMultiplier:"Pengali global income"
    };
    let display=value;
    if(key==="globalMultiplier"||key==="investorChance")display=`+${Math.round((value-1)*100)}%`;
    else if(key==="productQualityCap")display=`${value}/100`;
    else display=`+${value}`;
    return `<li><b>${esc(labelMap[key]||key)}</b><span>${esc(display)}</span></li>`;
  }).join("");
}

export function careerPanel(){
  const tier=getCurrentCareerTier();
  const next=getNextCareerTierInfo();
  const passive=getPassiveIncomePerSecond();
  const product=getProductIncomePerSecond();
  const totalIncome=passive+product;
  const revenueTarget=Math.max(1,totalIncome*600||1);
  return `<section class="career-tier-card" data-tier="${esc(tier.id)}">
    <div class="career-tier-head">
      <div class="career-tier-icon">${img("tier",tier.id,"tier-sprite")}</div>
      <div class="career-tier-meta">
        <span class="eyebrow">CURRENT TIER</span>
        <div class="career-tier-name">${esc(tier.label)}</div>
        <div class="career-tier-track">${esc(state.career.title||"Junior Developer")} • Track ${esc(state.career.track||"legit")}</div>
      </div>
      <span class="tier-badge">${esc(tier.id.toUpperCase())}</span>
    </div>
    <p class="career-tier-desc">${esc(tier.description)}</p>
    <div class="career-section-title">METRICS</div>
    <div class="career-metric-grid">
      ${metric("Revenue (annualized)",totalIncome,revenueTarget,formatMoney)}
      ${metric("Reputation",state.reputation,tier.minReputation+5)}
      ${metric("Player Level",state.level,tier.minLevel+2)}
      ${metric("Employees",state.team.length,Math.min(100,Math.max(2,tier.minLevel*2)))}
    </div>
    <div class="career-section-title">ACTIVE BONUS</div>
    <ul class="career-bonus-list">${bonusList(tier.bonuses)}</ul>
    ${next?`<div class="career-section-title">NEXT TIER</div>
      <article class="career-next-card">
        <div class="career-tier-head">
          <div class="career-tier-icon small">${img("tier",next.id,"tier-sprite")}</div>
          <div class="career-tier-meta">
            <span class="eyebrow">REQUIREMENTS</span>
            <div class="career-tier-name">${esc(next.label)}</div>
            <div class="career-tier-track">Level ≥ ${next.minLevel} • Reputation ≥ ${next.minReputation}</div>
          </div>
        </div>
        <p class="career-tier-desc">${esc(next.description)}</p>
        <div class="career-section-title">UNLOCKS</div>
        <ul class="career-bonus-list">${bonusList(next.bonuses)}</ul>
      </article>`:`<div class="empty-state">Tier tertinggi tercapai. Pertahankan dominasi.</div>`}
  </section>`;
}
