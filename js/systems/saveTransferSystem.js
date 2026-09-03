import {state,normalizeState,saveState} from "../state.js";

function encode(text){
  if(typeof btoa==="function")return btoa(unescape(encodeURIComponent(text)));
  return Buffer.from(text,"utf8").toString("base64");
}

function decode(code){
  if(typeof atob==="function")return decodeURIComponent(escape(atob(code)));
  return Buffer.from(code,"base64").toString("utf8");
}

export function exportSave(){return encode(JSON.stringify(state));}

export function importSave(code){
  try{
    if(!code||typeof code!=="string")return {ok:false,reason:"Kode save kosong."};
    const parsed=JSON.parse(decode(code.trim()));
    if(!parsed||typeof parsed!=="object"||typeof parsed.money!=="number"||!parsed.skills||!parsed.hacker)return {ok:false,reason:"Struktur save tidak valid."};
    normalizeState(parsed);
    saveState();
    return {ok:true,message:"Save berhasil diimpor."};
  }catch(error){
    return {ok:false,reason:"Kode save rusak atau tidak dikenali."};
  }
}
