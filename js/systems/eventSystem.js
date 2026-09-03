import {state,addMoney,addXP} from "../state.js";
import {tickBusinessEvents,resolveBusinessEvent,dismissBusinessEvent,rollBusinessEvent,getBusinessEventDefs} from "./businessEventSystem.js";

const EVENT_INTERVAL=45_000;
const events=[
  {id:"sponsor",name:"Open Source Sponsor",message:"Komunitas mendanai project open-source timmu.",apply(){addMoney(900+state.level*40);state.hacker.cleanRep+=2;}},
  {id:"outage",name:"Server Outage",message:"Gangguan server menimbulkan biaya pemulihan.",apply(){addMoney(-Math.min(state.money,500+state.level*25));}},
  {id:"viral",name:"Demo Viral",message:"Demo produkmu viral dan reputasi meningkat.",apply(){state.reputation=Math.min(100,state.reputation+5);state.hacker.cleanRep=Math.max(state.hacker.cleanRep,state.reputation);addXP(80);}},
  {id:"burnout",name:"Team Burnout",message:"Tim membutuhkan ritme kerja yang lebih sehat.",apply(){state.team.forEach(employee=>employee.morale=Math.max(0,employee.morale-8));}},
  {id:"insight",name:"Market Insight",message:"Riset kecil memberi dorongan pada valuasi perusahaan.",apply(){state.equity.companyValue+=1200+state.level*80;}}
];

export function tickEvents(forceId=null){
  const now=Date.now();
  if(!forceId&&(now-state.lastEventAt<EVENT_INTERVAL||Math.random()>.14))return null;
  const event=forceId?events.find(item=>item.id===forceId):events[Math.floor(Math.random()*events.length)];
  if(!event)return null;
  event.apply();
  state.lastEventAt=now;
  state.lastEvent={id:event.id,name:event.name,message:event.message,at:now};
  return {ok:true,...state.lastEvent};
}

export function randomEvent(){return tickEvents();}
export {events as eventDefs};

export {tickBusinessEvents,resolveBusinessEvent,dismissBusinessEvent,rollBusinessEvent,getBusinessEventDefs};
