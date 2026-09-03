import {clearAllSaves,saveGuardKeys} from "./saveGuard.js";
import {storageManager,isNative} from "./nativeBridge.js";
import {emit,on,clear as clearBus,events} from "./eventBus.js";

const cooldown=Object.create(null);
const COOLDOWN_MS=1500;
const preserveChannels=new Set([events.APP_RESET,events.SETTINGS_CHANGED,events.TOAST]);

function onCooldown(key){
  const now=Date.now();
  if(cooldown[key]&&cooldown[key]+COOLDOWN_MS>now)return true;
  cooldown[key]=now;
  return false;
}

export function isResetInProgress(){
  return Boolean(cooldown.reset)&&cooldown.reset+COOLDOWN_MS>Date.now();
}

function safeClearBus(){
  try{clearBus();}catch(error){console.warn("eventBus clear gagal.",error);}
}

export async function performReset({reload=true,reason="user",skipBusClear=false}={}){
  if(onCooldown("reset"))return {ok:false,reason:"Reset sedang berjalan."};
  emit(events.APP_RESET,{reason,at:Date.now(),phase:"start"});
  const localResult=clearAllSaves();
  if(storageManager?.remove){
    saveGuardKeys.all.forEach(key=>{
      try{storageManager.remove(key);}catch{/* silent */}
    });
  }
  emit(events.APP_RESET,{reason,at:Date.now(),phase:"complete",cleared:localResult});
  if(!skipBusClear){
    safeClearBus();
  }
  if(reload&&typeof location!=="undefined"&&typeof location.reload==="function"&&!isNative){
    setTimeout(()=>{
      try{location.reload();}catch{/* ignore */}
    },120);
  }
  return {ok:true,cleared:localResult,reason,reloaded:reload&&!isNative};
}

export function bindResetListener(handler){
  if(typeof handler!=="function")return ()=>{};
  return on(events.APP_RESET,handler);
}

export function reinitializeEventListeners(){
  if(typeof globalThis!=="undefined"&&typeof globalThis.dispatchEvent==="function"){
    try{
      globalThis.dispatchEvent(new CustomEvent("codeempire:reinit-listeners",{detail:{at:Date.now()}}));
    }catch{/* ignore */}
  }
  emit(events.APP_RESET,{reason:"reinit",at:Date.now(),phase:"reinit"});
  return {ok:true,at:Date.now()};
}

export const RESET_PRESERVED_CHANNELS=Array.from(preserveChannels);
