const STORAGE_KEYS = {primary:"codeEmpireSave",backup:"codeEmpireSaveBackup",settings:"codeEmpireSettings"};

function getLocalStorage(){
  try{return globalThis.localStorage;}catch{return null;}
}

function readKey(key){
  const ls=getLocalStorage();
  if(!ls)return null;
  try{return ls.getItem(key);}catch{return null;}
}

function writeKey(key,value){
  const ls=getLocalStorage();
  if(!ls)return false;
  try{
    if(value==null)ls.removeItem(key);
    else ls.setItem(key,typeof value==="string"?value:JSON.stringify(value));
    return true;
  }catch{return false;}
}

function detectCapacitor(){
  try{
    const cap=globalThis.Capacitor;
    return Boolean(cap?.isNativePlatform?.()||cap?.platform);
  }catch{return false;}
}

const isNative = detectCapacitor();

const storage = {
  get(key){
    return readKey(key);
  },
  set(key,value){
    if(isNative&&globalThis.Capacitor?.Plugins?.Preferences){
      try{
        return globalThis.Capacitor.Plugins.Preferences.set({key,value:typeof value==="string"?value:JSON.stringify(value)});
      }catch{return writeKey(key,value);}
    }
    return writeKey(key,value);
  },
  remove(key){
    if(isNative&&globalThis.Capacitor?.Plugins?.Preferences){
      try{return globalThis.Capacitor.Plugins.Preferences.remove({key});}catch{return writeKey(key,null);}
    }
    return writeKey(key,null);
  },
  keys:STORAGE_KEYS
};

const audio = {
  isAvailable:false,
  enabled:true,
  init(){
    if(typeof globalThis.AudioContext!=="undefined"||typeof globalThis.webkitAudioContext!=="undefined"){
      this.isAvailable=true;
    }
    return this.isAvailable;
  },
  setEnabled(value){this.enabled=Boolean(value);},
  play(/* name, opts */){},
  vibrate(pattern){
    if(isNative&&globalThis.Capacitor?.Plugins?.Haptics){
      try{return globalThis.Capacitor.Plugins.Haptics.vibrate({duration:Array.isArray(pattern)?pattern[0]||10:pattern||10});}catch{return navigatorVibrate(pattern);}
    }
    return navigatorVibrate(pattern);
  }
};

function navigatorVibrate(pattern){
  try{
    if(globalThis.navigator?.vibrate)return globalThis.navigator.vibrate(pattern);
  }catch{/* ignore */}
  return false;
}

const notifications = {
  isAvailable:false,
  enabled:true,
  permission:"default",
  init(){
    if(typeof globalThis.Notification!=="undefined"){
      this.isAvailable=true;
      this.permission=Notification.permission||"default";
    }
    return this.isAvailable;
  },
  setEnabled(value){this.enabled=Boolean(value);},
  async requestPermission(){
    if(!this.isAvailable)return "unsupported";
    if(Notification.permission==="granted"){this.permission="granted";return "granted";}
    if(Notification.permission==="denied"){this.permission="denied";return "denied";}
    try{
      const result=await Notification.requestPermission();
      this.permission=result;
      return result;
    }catch{return "denied";}
  },
  show({title="Code Empire",body="",tag="codeempire",silent=false,icon}={}){
    if(!this.enabled||!this.isAvailable)return false;
    if(Notification.permission!=="granted")return false;
    try{
      const note=new Notification(title,{body,tag,silent,icon});
      if(typeof note==="object"&&note&&"close"in note){
        setTimeout(()=>note.close(),4500);
      }
      return true;
    }catch{return false;}
  }
};

const bridge = {
  isNative,
  platform:isNative?globalThis.Capacitor?.getPlatform?.()||"web":"web",
  storage,
  audio,
  notifications,
  backHandlers:[],
  ready(){
    audio.init();
    notifications.init();
    this._bindBackHandler();
    return true;
  },
  _bindBackHandler(){
    if(isNative&&globalThis.Capacitor?.Plugins?.App){
      try{
        globalThis.Capacitor.Plugins.App.addListener("backButton",()=>{
          if(this.backHandlers.length>0){
            const last=this.backHandlers[this.backHandlers.length-1];
            if(typeof last==="function"){
              try{const consumed=last();if(consumed!==false)return;}catch(error){console.warn("[nativeBridge] backHandler error",error);}
            }
          }
          if(globalThis.__codeempire?.backHandler){
            try{const consumed=globalThis.__codeempire.backHandler();if(consumed!==false)return;}catch{/* ignore */}
          }
        });
      }catch{/* ignore */}
    }
  },
  pushBackHandler(handler){
    if(typeof handler!=="function")return ()=>{};
    this.backHandlers.push(handler);
    return ()=>{
      const index=this.backHandlers.lastIndexOf(handler);
      if(index>=0)this.backHandlers.splice(index,1);
    };
  },
  popBackHandler(){
    return this.backHandlers.pop();
  }
};

export const storageManager = storage;
export const audioManager = audio;
export const notificationManager = notifications;
export const nativeBridge = bridge;
export {isNative,STORAGE_KEYS};
