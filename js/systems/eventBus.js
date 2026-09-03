const subscribers = new Map();
let nextId = 1;

function ensureChannel(name){
  if(!subscribers.has(name))subscribers.set(name,new Set());
  return subscribers.get(name);
}

export function on(eventName,handler){
  if(typeof handler!=="function")return ()=>{};
  const id=nextId++;
  const channel=ensureChannel(eventName);
  const wrapper=(payload)=>{
    try{handler(payload);}catch(error){console.warn(`[eventBus] listener error on ${eventName}`,error);}
  };
  wrapper.__id=id;
  channel.add(wrapper);
  return ()=>channel.delete(wrapper);
}

export function emit(eventName,payload){
  const channel=subscribers.get(eventName);
  if(!channel)return 0;
  channel.forEach(handler=>handler(payload));
  return channel.size;
}

export function clear(){
  subscribers.clear();
}

export const events = {
  MONEY_GAINED:"money:gained",
  LEVEL_UP:"player:levelUp",
  ACHIEVEMENT_UNLOCKED:"achievement:unlocked",
  QUEST_COMPLETED:"quest:completed",
  TUTORIAL_ADVANCED:"tutorial:advanced",
  EVENT_OPENED:"businessEvent:opened",
  EVENT_RESOLVED:"businessEvent:resolved",
  EMPLOYEE_DETAIL_OPENED:"employee:detailOpened",
  EMPLOYEE_HIRED:"employee:hired",
  SETTINGS_CHANGED:"settings:changed",
  APP_RESET:"app:reset",
  TOAST:"ui:toast"
};
