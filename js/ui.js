import { state } from "./state.js";

let renderCallback = null;
let toastTimer = null;

export function setRenderCallback(fn){ renderCallback = fn; }

export function render(){
  if(renderCallback) renderCallback();
}

export function money(n){ return "$ " + Math.floor(n).toLocaleString("en-US"); }

export function toast(message){
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>el.classList.remove("show"), 1800);
}

export function floatMoney(text,x,y){
  const el = document.createElement("div");
  el.className = "float";
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.getElementById("floating-layer").appendChild(el);
  setTimeout(()=>el.remove(),800);
}

export function setActiveNav(){
  document.querySelectorAll(".nav-btn").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.screen === state.screen);
  });
}
