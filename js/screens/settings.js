import {state} from "../state.js";
import {getAsset} from "../data/assetMap.js";
import {clearAllSaves,getStorageSnapshot} from "../systems/saveGuard.js";
import {setSoundEnabled,setVibrationEnabled} from "../systems/feedbackSystem.js";
import {notificationManager,storageManager,isNative} from "../systems/nativeBridge.js";
import {emit,events} from "../systems/eventBus.js";
import {performReset} from "../systems/resetManager.js";

function esc(value){
  return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
}

function img(category,key,className){
  if(!className)className="asset-icon";
  const src=getAsset(category,key);
  return `<img class="${className}" src="${src}" data-asset="${esc(category)}-${esc(key)}" alt="" loading="lazy">`;
}

function toggleRow(row){
  const id=row.id;
  const label=row.label;
  const description=row.description;
  const checked=row.checked;
  return `<article class="card setting-row" data-setting="${esc(id)}">
    <div class="row">
      <div class="big-icon">${img("ui",id)}</div>
      <div class="grow">
        <div class="name">${esc(label)}</div>
        <div class="muted">${esc(description)}</div>
      </div>
      <label class="toggle"><input type="checkbox" data-setting-toggle="${esc(id)}" ${checked?"checked":""}><span class="toggle-slider"></span></label>
    </div>
  </article>`;
}

function infoCard(title,rows){
  const items=rows.map(row=>{
    const k=row[0];
    const v=row[1];
    return `<li><span>${esc(k)}</span><b>${esc(v)}</b></li>`;
  }).join("");
  return `<article class="card info-card">
    <div class="name">${esc(title)}</div>
    <ul class="info-list">${items}</ul>
  </article>`;
}

function formatMoney(value){
  const num=Math.floor(Number(value)||0);
  return "$ " + num.toLocaleString("en-US");
}

function renderDangerCard(){
  return `<article class="card danger-zone">
    <div class="row">
      <div class="big-icon">${img("ui","reset")}</div>
      <div class="grow">
        <div class="name">Reset Save</div>
        <div class="muted">Menghapus seluruh progress, backup, dan pengaturan. Tidak dapat dibatalkan.</div>
      </div>
      <button class="danger-btn" id="resetSaveBtn">RESET</button>
    </div>
  </article>`;
}

export function settingsScreen(){
  const s=state.settings||{};
  const notifEnabled=s.notifEnabled!==false;
  const notifStatus=notificationManager.permission||"default";
  const snapshot=getStorageSnapshot();
  const buildInfo=[
    ["Versi","0.1.6"],
    ["Native",isNative?"Ya (Capacitor)":"Web"],
    ["Primary save",snapshot.primary?"Ada":"Kosong"],
    ["Backup",snapshot.backup?"Ada":"Tidak ada"],
    ["Permission notif",notifStatus]
  ];
  const moneyLabel=state.money?formatMoney(state.money):"$ 0";
  const parts=[];
  parts.push(`<section class="hero">`);
  parts.push(`<div class="money">${moneyLabel}</div>`);
  parts.push(`<div class="money-label">SETTINGS</div>`);
  parts.push(`</section>`);
  parts.push(`<div class="section-title">AUDIO AND FEEDBACK</div>`);
  parts.push(toggleRow({id:"sound",label:"Sound Effect",description:"Suara ketika tap, level up, event, dan achievement.",checked:s.soundEnabled!==false}));
  parts.push(toggleRow({id:"vibration",label:"Vibration",description:"Getaran saat tap penting dan event kritis.",checked:s.vibrationEnabled!==false}));
  parts.push(`<div class="section-title">NOTIFICATIONS</div>`);
  parts.push(toggleRow({id:"notification",label:"Notifikasi in-app dan sistem",description:"Aktifkan untuk melihat toast penting walau WebView di background.",checked:notifEnabled}));
  parts.push(`<div class="section-title">INFO</div>`);
  parts.push(infoCard("Build dan Save",buildInfo));
  parts.push(`<div class="section-title">DANGER ZONE</div>`);
  parts.push(renderDangerCard());
  return parts.join("");
}

export function bindSettingsEvents(layer){
  if(!layer)return;
  const inputs=layer.querySelectorAll("[data-setting-toggle]");
  inputs.forEach(input=>{
    input.onchange=()=>{
      const id=input.dataset.settingToggle;
      const value=input.checked;
      if(id==="sound"){
        setSoundEnabled(value);
      }else if(id==="vibration"){
        setVibrationEnabled(value);
        if(value){
          try{globalThis.navigator?.vibrate?.(20);}catch{/* ignore */}
        }
      }else if(id==="notification"){
        if(value)notificationManager.requestPermission();
        state.settings.notifEnabled=value;
      }
      if(id==="sound")state.settings.soundEnabled=value;
      if(id==="vibration")state.settings.vibrationEnabled=value;
      storageManager.set("codeEmpireSettings",{...state.settings});
      emit(events.SETTINGS_CHANGED,{id,value});
    };
  });
  const resetBtn=layer.querySelector("#resetSaveBtn");
  if(resetBtn)resetBtn.onclick=()=>showResetConfirm();
}

export function showResetConfirm(){
  const layer=document.getElementById("modal-layer");
  if(!layer)return;
  const parts=[];
  parts.push(`<div class="game-modal danger-modal" role="dialog" aria-modal="true">`);
  parts.push(`<div class="modal-asset">${img("ui","reset")}</div>`);
  parts.push(`<div class="eyebrow">CONFIRM RESET</div>`);
  parts.push(`<h2>Reset seluruh progress?</h2>`);
  parts.push(`<p>Tindakan ini menghapus save, backup, dan pengaturan. Tidak dapat dibatalkan.</p>`);
  parts.push(`<div class="modal-actions">`);
  parts.push(`<button class="danger-btn" id="confirmResetBtn">YA, RESET</button>`);
  parts.push(`<button class="secondary" id="cancelResetBtn">BATAL</button>`);
  parts.push(`</div>`);
  parts.push(`</div>`);
  layer.innerHTML=parts.join("");
  const cancelBtn=layer.querySelector("#cancelResetBtn");
  if(cancelBtn)cancelBtn.onclick=()=>{layer.innerHTML="";};
  const confirmBtn=layer.querySelector("#confirmResetBtn");
  if(confirmBtn)confirmBtn.onclick=()=>{
    confirmBtn.disabled=true;
    confirmBtn.textContent="MERESET...";
    performReset({reload:true,reason:"user"}).then(result=>{
      if(!result?.ok&&result?.reason){
        confirmBtn.disabled=false;
        confirmBtn.textContent="YA, RESET";
        if(typeof window!=="undefined"&&typeof window.alert==="function"){
          window.alert(result.reason);
        }
      }
    }).catch(error=>{
      console.warn("Reset error.",error);
      confirmBtn.disabled=false;
      confirmBtn.textContent="YA, RESET";
    });
  };
}
