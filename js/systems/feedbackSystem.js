import {state} from "../state.js";
import {audioManager as bridgeAudio} from "./nativeBridge.js";

let soundEnabled=true;
let vibrationEnabled=true;
const cache = {audio:new Map(),lastPlay:new Map()};

const SOUND_LIBRARY = {
  click:{frequency:520,duration:.08,type:"square",volume:.05},
  money:{frequency:880,duration:.12,type:"triangle",volume:.06},
  project:{frequency:660,duration:.18,type:"sine",volume:.07},
  levelUp:{frequency:990,duration:.28,type:"sawtooth",volume:.08},
  warning:{frequency:220,duration:.22,type:"square",volume:.07},
  error:{frequency:140,duration:.28,type:"square",volume:.08}
};

function canPlayAudio(){
  return typeof globalThis.AudioContext!=="undefined"||typeof globalThis.webkitAudioContext!=="undefined";
}

function playTone(name){
  if(!soundEnabled||!canPlayAudio())return;
  const def=SOUND_LIBRARY[name];
  if(!def)return;
  const now=Date.now();
  if((cache.lastPlay.get(name)||0)+60>now)return;
  cache.lastPlay.set(name,now);
  try{
    const Ctx=globalThis.AudioContext||globalThis.webkitAudioContext;
    const ctx=new Ctx();
    const oscillator=ctx.createOscillator();
    const gain=ctx.createGain();
    oscillator.type=def.type;
    oscillator.frequency.value=def.frequency;
    gain.gain.value=def.volume;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime+def.duration);
    oscillator.onended=()=>ctx.close?.();
  }catch{/* silent fallback */}
}

function vibrate(pattern){
  if(!vibrationEnabled)return;
  bridgeAudio.vibrate(pattern);
}

export function setSoundEnabled(value){
  soundEnabled=Boolean(value);
  state.settings=state.settings||{};
  state.settings.soundEnabled=soundEnabled;
}

export function setVibrationEnabled(value){
  vibrationEnabled=Boolean(value);
  state.settings=state.settings||{};
  state.settings.vibrationEnabled=vibrationEnabled;
}

export function playSound(name){
  playTone(name);
}

export function feedback(name,{sound=true,vibration=true}={}){
  if(sound)playSound(name);
  if(vibration){
    if(name==="click")vibrate(8);
    else if(name==="money")vibrate(12);
    else if(name==="project")vibrate([20,30,40]);
    else if(name==="levelUp")vibrate([30,40,30,40,60]);
    else if(name==="warning")vibrate([60,40,60]);
    else if(name==="error")vibrate(120);
  }
}

export const feedbackEvents = Object.keys(SOUND_LIBRARY);

export function bindButtonFeedback(root=globalThis.document){
  if(!root?.querySelectorAll)return;
  root.querySelectorAll("button").forEach(button=>{
    if(button.dataset.feedbackBound)return;
    button.dataset.feedbackBound="1";
    button.addEventListener("click",()=>feedback("click"));
  });
}
