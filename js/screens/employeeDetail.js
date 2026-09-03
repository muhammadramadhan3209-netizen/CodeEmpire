import {state} from "../state.js";
import {money} from "../ui.js";
import {getAsset} from "../data/assetMap.js";
import {getPersonality,personalityDefs} from "../data/personality.js";
import {getEmployeeDetails} from "../systems/employeeSystem.js";
import {roleLabels} from "../data/candidates.js";
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

function statRow(label,current,target=100,invert=false){
  const percent=Math.min(100,Math.max(0,Math.round((current/target)*100)));
  const tone=invert
    ?percent<35?"good":percent<70?"warn":"bad"
    :percent<35?"bad":percent<70?"warn":"good";
  return `<div class="emp-stat">
    <div class="emp-stat-head"><span>${esc(label)}</span><b>${esc(Math.round(current))}${target===100?"%":""}</b></div>
    ${progressBar(percent,`tone-${tone}`)}
  </div>`;
}

export function employeeDetailPanel(employeeId){
  const details=getEmployeeDetails(employeeId);
  if(!details)return "";
  const {employee,personality,mood,output,summary}=details;
  emit(events.EMPLOYEE_DETAIL_OPENED,{id:employee.id,name:employee.name});
  return `<article class="employee-detail-panel" data-employee-id="${esc(employee.id)}">
    <header class="emp-detail-head">
      <div class="emp-detail-avatar">${img("avatar",employee.role,"avatar-sprite")}</div>
      <div class="emp-detail-meta">
        <div class="eyebrow">EMPLOYEE</div>
        <div class="emp-detail-name">${esc(employee.name)}</div>
        <div class="muted">${esc(roleLabels[employee.role]||employee.role)} • ${esc(employee.tier)} L${esc(employee.level)}</div>
        <span class="personality-tag ${esc(personality.id)}">${esc(personality.label)}</span>
      </div>
      <div class="emp-detail-mood mood-${esc(mood)}">${img("ui",mood==="happy"?"success":mood==="stressed"?"warning":mood==="burnout"?"error":"info","mood-icon")}</div>
    </header>
    <div class="emp-stat-grid">
      ${statRow("Morale",employee.morale)}
      ${statRow("Stress",employee.stress,100,true)}
      ${statRow("Loyalty",employee.loyalty)}
    </div>
    <div class="emp-detail-section">
      <div class="emp-detail-section-title">PERSONALITY</div>
      <div class="emp-personality-card">
        <div class="emp-personality-icon">${img("personality",personality.id,"personality-sprite")}</div>
        <div class="grow">
          <div class="name">${esc(personality.label)}</div>
          <div class="muted">${esc(personality.description)}</div>
          <div class="accent">${esc(summary)}</div>
        </div>
      </div>
    </div>
    <div class="emp-detail-section">
      <div class="emp-detail-section-title">CONTRIBUTION</div>
      <div class="row">
        <div class="big-icon">${img("stat","coding")}</div>
        <div class="grow"><div class="muted">Output / cycle</div><b>${esc(output.toFixed(2))}</b></div>
      </div>
      <div class="row" style="margin-top:8px">
        <div class="big-icon">${img("stat","money")}</div>
        <div class="grow"><div class="muted">Salary</div><b>${money(employee.salary)}</b></div>
      </div>
      <div class="row" style="margin-top:8px">
        <div class="big-icon">${img("stat","office")}</div>
        <div class="grow"><div class="muted">Department</div><b>${esc(employee.assignedTo||"Unassigned")}</b></div>
      </div>
    </div>
  </article>`;
}

export function renderEmployeeDetailModal(employeeId){
  const panel=employeeDetailPanel(employeeId);
  if(!panel)return;
  const layer=document.getElementById("modal-layer");
  if(!layer)return;
  layer.innerHTML=`<div class="game-modal emp-detail-modal" role="dialog" aria-modal="true">${panel}<div class="modal-actions"><button class="secondary" id="closeEmpDetail">TUTUP</button></div></div>`;
  layer.querySelector("#closeEmpDetail").onclick=()=>{layer.innerHTML="";};
}

export function attachEmployeeClicks(root=globalThis.document){
  if(!root?.querySelectorAll)return;
  root.querySelectorAll("[data-employee-id]").forEach(card=>{
    if(card.dataset.clickBound)return;
    card.dataset.clickBound="1";
    card.addEventListener("click",event=>{
      const interactive=event.target.closest("button,select,a,input,label,option");
      if(interactive)return;
      renderEmployeeDetailModal(card.dataset.employeeId);
    });
    card.style.cursor="pointer";
  });
}
