import { state } from "./state.js";
import { render } from "./ui.js";
import {getAsset} from "./data/assetMap.js";

function iconImg(src,alt=""){
  const img=document.createElement("img");
  img.src=src;
  img.alt=alt;
  img.loading="lazy";
  return img;
}

function hydrateStaticAssets(){
  document.querySelectorAll("[data-nav-key]").forEach(element=>{
    const key=element.dataset.navKey;
    element.dataset.asset=`nav-${key}`;
    element.replaceChildren(iconImg(getAsset("nav",key)));
  });
  document.querySelectorAll("[data-ui-key]").forEach(element=>{
    const key=element.dataset.uiKey;
    element.dataset.asset=`ui-${key}`;
    element.replaceChildren(iconImg(getAsset("ui",key)));
  });
}

export function initNavigation(){
  hydrateStaticAssets();
  document.querySelectorAll(".nav-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      state.screen = btn.dataset.screen;
      document.getElementById("screen").scrollTop=0;
      render();
    });
  });
}
