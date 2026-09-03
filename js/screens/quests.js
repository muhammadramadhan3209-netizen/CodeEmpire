import {state} from "../state.js";
import {money} from "../ui.js";
import {getAsset} from "../data/assetMap.js";
import {getQuestList,claimQuestReward,rolloverQuests,checkQuestCompletions} from "../systems/questSystem.js";
import {emit,events} from "../systems/eventBus.js";

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

function questCard(quest){
  const percent=Math.min(100,Math.round((quest.progress/quest.target)*100));
  const rewardLabel=`${money(quest.reward.money)} • ${quest.reward.xp} XP${quest.reward.reputation?` • +${quest.reward.reputation} Rep`:""}`;
  const status=quest.claimed?"claimed":quest.completed?"completed":"active";
  const action=quest.claimed
    ?`<span class="badge success-badge">${img("ui","check","asset-icon-inline")}KLAIM</span>`
    :quest.completed
      ?`<button class="primary claim-btn" data-quest-claim="${esc(quest.id)}">${img("ui","claim","asset-icon-inline")}CLAIM</button>`
      :`<span class="badge">${quest.percent||0}%</span>`;
  return `<article class="quest-card ${status}" data-quest-id="${esc(quest.id)}">
    <div class="quest-icon">${img("ui",quest.period==="daily"?"training":"tier")}</div>
    <div class="quest-body">
      <div class="name">${esc(quest.label)}</div>
      <div class="muted">${quest.progress}/${quest.target} • ${esc(rewardLabel)}</div>
      ${progressBar(percent)}
    </div>
    <div class="quest-action">${action}</div>
  </article>`;
}

export function questsScreen(){
  rolloverQuests();
  const all=getQuestList();
  const daily=all.filter(quest=>quest.period==="daily");
  const weekly=all.filter(quest=>quest.period==="weekly");
  const dailyDone=daily.filter(quest=>quest.completed).length;
  const weeklyDone=weekly.filter(quest=>quest.completed).length;
  const lastCompleted=checkQuestCompletions();
  if(lastCompleted.length){
    emit(events.QUEST_COMPLETED,{count:lastCompleted.length,ids:lastCompleted.map(quest=>quest.id)});
  }
  const dailyCards=daily.length?daily.map(questCard).join(""):`<div class="empty-state">Belum ada quest harian.</div>`;
  const weeklyCards=weekly.length?weekly.map(questCard).join(""):`<div class="empty-state">Belum ada quest mingguan.</div>`;
  return `<section class="hero">
    <div class="money">${money(state.money)}</div>
    <div class="money-label">QUEST CENTER</div>
    <div class="stat-row">
      <div class="stat">${img("stat","level")}<b>${dailyDone}/${daily.length||0}</b><span>DAILY DONE</span></div>
      <div class="stat">${img("stat","office")}<b>${weeklyDone}/${weekly.length||0}</b><span>WEEKLY DONE</span></div>
      <div class="stat">${img("stat","rating")}<b>${state.stats.totalEarned?money(state.stats.totalEarned):"$ 0"}</b><span>TOTAL EARNED</span></div>
    </div>
  </section>
  <div class="section-title">DAILY QUESTS</div>
  <div class="quest-grid">${dailyCards}</div>
  <div class="section-title">WEEKLY QUESTS</div>
  <div class="quest-grid">${weeklyCards}</div>
  <div class="card notice">
    <b>Tips:</b> Quest reset harian setiap pukul 00:00 dan mingguan setiap Senin. Klaim reward sebelum reset untuk mengambil bonus.
  </div>`;
}

export function bindQuestEvents(layer){
  if(!layer)return;
  layer.querySelectorAll("[data-quest-claim]").forEach(btn=>{
    btn.onclick=()=>{
      const result=claimQuestReward(btn.dataset.questClaim);
      if(result.ok){
        emit(events.QUEST_COMPLETED,{count:1,ids:[btn.dataset.questClaim]});
        btn.outerHTML=`<span class="badge success-badge">${img("ui","check","asset-icon-inline")}KLAIM</span>`;
        const card=btn.closest(".quest-card");
        if(card)card.classList.add("claimed");
      }
      if(typeof window!=="undefined"&&window.toast){
        window.toast(result.message||result.reason);
      }
    };
  });
}
