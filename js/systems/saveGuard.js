const STORAGE_KEY = "codeEmpireSave";
const BACKUP_KEY = "codeEmpireSaveBackup";
const SETTINGS_KEY = "codeEmpireSettings";
const SETTINGS_BACKUP_KEY = "codeEmpireSettingsBackup";

function readRaw(key){
  try{
    const raw=globalThis.localStorage?.getItem(key);
    return raw??"null";
  }catch{
    return "null";
  }
}

function writeRaw(key,value){
  try{
    if(value==null)globalThis.localStorage?.removeItem(key);
    else globalThis.localStorage?.setItem(key,String(value));
    return true;
  }catch{
    return false;
  }
}

export function validateState(parsed){
  if(!parsed||typeof parsed!=="object")return "Save bukan object.";
  if(typeof parsed.money!=="number")return "Field money tidak valid.";
  if(!parsed.skills||typeof parsed.skills!=="object")return "Field skills tidak valid.";
  if(!parsed.hacker||typeof parsed.hacker!=="object")return "Field hacker tidak valid.";
  if(!Array.isArray(parsed.team))return "Field team harus array.";
  if(!parsed.equity||typeof parsed.equity!=="object")return "Field equity tidak valid.";
  return null;
}

export function hasBackup(){
  return readRaw(BACKUP_KEY)!=="null";
}

export function hasSettingsBackup(){
  return readRaw(SETTINGS_BACKUP_KEY)!=="null";
}

export function writeBackup(){
  const raw=readRaw(STORAGE_KEY);
  if(raw==="null")return false;
  writeRaw(SETTINGS_BACKUP_KEY,readRaw(SETTINGS_KEY));
  return writeRaw(BACKUP_KEY,raw);
}

export function loadBackup(){
  const raw=readRaw(BACKUP_KEY);
  if(raw==="null")return null;
  try{return JSON.parse(raw);}catch{return null;}
}

export function loadSettingsBackup(){
  const raw=readRaw(SETTINGS_BACKUP_KEY);
  if(raw==="null")return null;
  try{return JSON.parse(raw);}catch{return null;}
}

export function guardedLoad(primaryReader,fallbackReader,validator){
  let parsed=null;
  try{parsed=primaryReader();}catch{parsed=null;}
  let reason=parsed?validator(parsed):"Save tidak dapat dibaca.";
  if(!reason)return {ok:true,state:parsed,recovered:false};
  const backup=loadBackup();
  if(backup){
    const backupReason=validator(backup);
    if(!backupReason){
      writeRaw(STORAGE_KEY,JSON.stringify(backup));
      return {ok:true,state:backup,recovered:true,message:"Save utama rusak. Backup berhasil dipulihkan."};
    }
  }
  try{return {ok:true,state:fallbackReader(),recovered:true,message:"Save diinisialisasi ulang."};}catch{
    return {ok:false,reason:reason||"Save tidak valid."};
  }
}

export const saveGuardKeys = {
  primary:STORAGE_KEY,
  backup:BACKUP_KEY,
  settings:SETTINGS_KEY,
  settingsBackup:SETTINGS_BACKUP_KEY,
  all:[STORAGE_KEY,BACKUP_KEY,SETTINGS_KEY,SETTINGS_BACKUP_KEY]
};

export function clearAllSaves(){
  const result={primary:false,backup:false,settings:false,settingsBackup:false};
  try{
    if(typeof localStorage?.removeItem==="function"){
      result.primary=localStorage.removeItem(STORAGE_KEY)!==undefined||true;
      result.backup=localStorage.removeItem(BACKUP_KEY)!==undefined||true;
      result.settings=localStorage.removeItem(SETTINGS_KEY)!==undefined||true;
      result.settingsBackup=localStorage.removeItem(SETTINGS_BACKUP_KEY)!==undefined||true;
    }
  }catch(error){
    console.warn("Reset save gagal.",error);
  }
  return result;
}

export function getStorageSnapshot(){
  return {
    primary:readRaw(STORAGE_KEY)!=="null",
    backup:readRaw(BACKUP_KEY)!=="null",
    settings:readRaw(SETTINGS_KEY)!=="null",
    settingsBackup:readRaw(SETTINGS_BACKUP_KEY)!=="null"
  };
}
