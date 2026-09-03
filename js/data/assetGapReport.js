import {assetMap} from "./assetMap.js";
import {assetManifest} from "./assetManifest.js";

const FALLBACK_PATH = "assets/ui-unknown.svg";

function pathToKey(path){
  if(typeof path!=="string")return null;
  const match=path.match(/^assets\/([^.]+)\.svg$/);
  return match?match[1]:null;
}

export function findMissingAssets(){
  const used=new Map();
  const registered=new Set();
  Object.values(assetMap).forEach(categoryMap=>{
    if(!categoryMap||typeof categoryMap!=="object")return;
    Object.entries(categoryMap).forEach(([key,path])=>{
      if(path===FALLBACK_PATH)used.set(key,{key,path});
      else registered.add(key);
    });
  });
  return Array.from(used.values());
}

export function findManifestGaps(){
  const gaps=[];
  Object.entries(assetManifest).forEach(([category,groups])=>{
    if(!assetMap[category]){
      gaps.push({category,reason:"category_missing",groups:Object.keys(groups)});
      return;
    }
    Object.entries(groups).forEach(([group,items])=>{
      items.forEach(item=>{
        if(!assetMap[category][item]){
          gaps.push({category,group,item,reason:"item_missing"});
        }
      });
    });
  });
  return gaps;
}

export function buildAssetReport(){
  const missing=findMissingAssets();
  const gaps=findManifestGaps();
  const total=Object.values(assetMap).reduce((sum,categoryMap)=>{
    return sum+(categoryMap&&typeof categoryMap==="object"?Object.keys(categoryMap).length:0);
  },0);
  return {
    total,
    usingFallback:missing,
    manifestGaps:gaps,
    summary:{
      fallbackCount:missing.length,
      gapCount:gaps.length,
      totalGaps:missing.length+gaps.length
    }
  };
}

export const ASSET_FALLBACK_PATH=FALLBACK_PATH;
