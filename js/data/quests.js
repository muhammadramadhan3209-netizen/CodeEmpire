export const dailyQuestDefs = [
  {id:"daily_code_3",label:"Tap coding 50 kali",target:50,reward:{money:120,reputation:1,xp:30},type:"taps"},
  {id:"daily_finish_project",label:"Selesaikan 1 project",target:1,reward:{money:250,reputation:2,xp:40},type:"projects"},
  {id:"daily_train_skill",label:"Train 1 skill",target:1,reward:{money:180,reputation:1,xp:30},type:"skillTrainings"},
  {id:"daily_hire",label:"Rekrut 1 employee",target:1,reward:{money:300,reputation:2,xp:40},type:"hires"},
  {id:"daily_maintain",label:"Maintain 1 produk",target:1,reward:{money:220,reputation:1,xp:30},type:"maintenances"},
  {id:"daily_earn",label:"Kumpulkan $1.000 passive hari ini",target:1000,reward:{money:200,reputation:1,xp:35},type:"passiveEarned"},
  {id:"daily_office_upgrade",label:"Upgrade 1 department",target:1,reward:{money:280,reputation:2,xp:45},type:"departmentUpgrades"}
];

export const weeklyQuestDefs = [
  {id:"weekly_earn",label:"Kumpulkan $25.000 passive",target:25000,reward:{money:3000,reputation:8,xp:300},type:"passiveEarned"},
  {id:"weekly_clients",label:"Selesaikan 5 client",target:5,reward:{money:2500,reputation:6,xp:250},type:"clientsCompleted"},
  {id:"weekly_products",label:"Rilis 1 produk baru",target:1,reward:{money:4000,reputation:10,xp:400},type:"productsLaunched"},
  {id:"weekly_team_grow",label:"Rekrut 3 employee",target:3,reward:{money:3500,reputation:7,xp:320},type:"hires"},
  {id:"weekly_maintain_all",label:"Maintain 5 produk",target:5,reward:{money:2800,reputation:5,xp:240},type:"maintenances"}
];

export const allQuestDefs = [
  ...dailyQuestDefs.map(quest=>({...quest,period:"daily"})),
  ...weeklyQuestDefs.map(quest=>({...quest,period:"weekly"}))
];

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export function getDailyResetAt(now=Date.now()){
  const date=new Date(now);
  date.setHours(0,0,0,0);
  return date.getTime()+DAY_MS;
}

export function getWeeklyResetAt(now=Date.now()){
  const date=new Date(now);
  const day=date.getDay();
  const offset=(8-day)%7||7;
  date.setHours(0,0,0,0);
  return date.getTime()+offset*DAY_MS;
}
