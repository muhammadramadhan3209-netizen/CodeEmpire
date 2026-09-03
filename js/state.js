const createDepartments=()=>({
  development:{level:1,assigned:[]},
  marketing:{level:1,assigned:[]},
  sales:{level:1,assigned:[]},
  security:{level:1,assigned:[]}
});

const createTutorial=()=>({
  active:false,
  completed:false,
  currentStep:0,
  stepsCompleted:[],
  lastShownAt:0,
  lastRewardAt:0
});

const createQuests=()=>({
  active:{},
  progress:{},
  completed:{},
  claimed:{},
  taps:0,
  projects:0,
  skillTrainings:0,
  hires:0,
  maintenances:0,
  passiveEarned:0,
  clientsCompleted:0,
  productsLaunched:0,
  lastDailyReset:0,
  lastWeeklyReset:0
});

const createSettings=()=>({
  soundEnabled:true,
  vibrationEnabled:true,
  notifEnabled:true
});

const createStats=()=>({
  totalTaps:0,
  totalEarned:0,
  productsLaunched:0,
  clientsCompleted:0,
  projectsCompleted:0,
  hackJobsCompleted:0
});

const createBusinessEvents=()=>({
  pending:null,
  history:[],
  lastEventAt:0,
  intervalMs:75_000
});

const createOfflineReport=()=>({
  lastSummary:null,
  lastSeenAt:0,
  totalOfflineEarnings:0
});

export const defaultState={
  screen:"home",money:0,level:1,xp:0,xpNeeded:100,energy:100,codingLevel:1,moneyPerTap:1,moneyPerSecond:0,upgradeCost:10,officeLevel:1,equipmentLevel:1,employees:0,reputation:0,
  skills:{frontend:5,backend:1,ai:1,security:1},skillTraining:null,availableClients:[],activeClient:null,
  team:[],departments:createDepartments(),clientRating:{average:0,count:0,history:[]},products:[],activeProductDev:null,
  achievements:{},equity:{playerShare:100,investors:[],companyValue:0,pendingOffer:null,lastOfferAt:0,valuePenalty:1,exposureHandled:false},
  market:{competitors:[],lastEvent:null,categoryPenalties:{},lastTickAt:0},career:{title:"Junior Dev",track:"legit",tierId:"freelancer"},
  lastEvent:null,pendingEvent:null,lastEventAt:0,lastActiveTimestamp:Date.now(),lastSalaryAt:0,recruitPool:[],recruitRefreshAt:0,
  projects:{calculator:{progress:0,completed:false,active:false},todo:{progress:0,completed:false,active:false},chat:{progress:0,completed:false,active:false}},
  ownedItems:{laptop:false,monitor:false,keyboard:false},
  hacker:{heat:0,darkRep:0,cleanRep:0,toolsOwned:[],zeroDayCharges:0,activeJob:null,completedJobs:0,caught:0,identity:"hidden",wanted:false,freezeUntil:0,officeFreezeUntil:0,pendingHeatEvent:null,pendingMoralChoice:null,alertBand:0,lastJobResult:null,history:[]},
  tutorial:createTutorial(),
  quests:createQuests(),
  settings:createSettings(),
  stats:createStats(),
  businessEvents:createBusinessEvents(),
  offlineReport:createOfflineReport()
};

export let state=structuredClone(defaultState);

function legacyEmployee(index){
  return {id:`legacy-${index+1}`,name:`Developer Lama #${index+1}`,role:"frontend",tier:"Junior",level:1,xp:0,salary:120,morale:75,stress:0,loyalty:60,personality:"loyal",assignedTo:null,training:null,isLead:false};
}

function normalizeEmployee(employee,index){
  const role=employee.role||employee.type||"frontend";
  return {
    id:employee.id||`employee-${Date.now()}-${index}`,
    name:employee.name||`Employee #${index+1}`,
    role,
    tier:employee.tier||"Junior",
    level:Math.max(1,Number(employee.level)||1),
    xp:Math.max(0,Number(employee.xp)||0),
    salary:Math.max(1,Number(employee.salary)||100),
    morale:Math.min(100,Math.max(0,Number(employee.morale??employee.loyalty??75))),
    stress:Math.min(100,Math.max(0,Number(employee.stress)||0)),
    loyalty:Math.min(100,Math.max(0,Number(employee.loyalty??60))),
    personality:employee.personality||"loyal",
    assignedTo:employee.assignedTo||null,
    training:employee.training||null,
    isLead:Boolean(employee.isLead)
  };
}

function attachDerivedEmployees(){
  Object.defineProperty(state,"employees",{
    configurable:true,enumerable:true,
    get(){return state.team.length;},
    set(){return state.team.length;}
  });
}

function normalizeProducts(products){
  if(!Array.isArray(products))return [];
  return products.map(product=>{
    const health=Math.min(100,Math.max(0,Number(product.health)||100));
    return {
      id:product.id||`product-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      name:product.name||"Produk",
      category:product.category||"productivity",
      baseIncome:Math.max(1,Number(product.baseIncome)||10),
      quality:Math.min(100,Math.max(20,Number(product.quality)||(health>=70?70:health>=40?55:40))),
      innovation:Math.min(100,Math.max(0,Number(product.innovation)||0)),
      marketDemand:Math.min(100,Math.max(0,Number(product.marketDemand)||50)),
      createdAt:Number(product.createdAt)||Date.now(),
      lastMaintainedAt:Number(product.lastMaintainedAt)||Date.now(),
      health
    };
  });
}

function normalizeCareer(career={}){
  return {
    title:career.title||"Junior Dev",
    track:career.track||"legit",
    tierId:career.tierId||"freelancer"
  };
}

function normalizeTutorial(tutorial={}){
  return {
    active:Boolean(tutorial.active),
    completed:Boolean(tutorial.completed),
    currentStep:Math.max(0,Number(tutorial.currentStep)||0),
    stepsCompleted:Array.isArray(tutorial.stepsCompleted)?tutorial.stepsCompleted.slice(-20):[],
    lastShownAt:Number(tutorial.lastShownAt)||0,
    lastRewardAt:Number(tutorial.lastRewardAt)||0
  };
}

function normalizeQuests(quests={}){
  return {
    active:quests.active&&typeof quests.active==="object"?quests.active:{},
    progress:quests.progress&&typeof quests.progress==="object"?quests.progress:{},
    completed:quests.completed&&typeof quests.completed==="object"?quests.completed:{},
    claimed:quests.claimed&&typeof quests.claimed==="object"?quests.claimed:{},
    taps:Math.max(0,Number(quests.taps)||0),
    projects:Math.max(0,Number(quests.projects)||0),
    skillTrainings:Math.max(0,Number(quests.skillTrainings)||0),
    hires:Math.max(0,Number(quests.hires)||0),
    maintenances:Math.max(0,Number(quests.maintenances)||0),
    departmentUpgrades:Math.max(0,Number(quests.departmentUpgrades)||0),
    passiveEarned:Math.max(0,Number(quests.passiveEarned)||0),
    clientsCompleted:Math.max(0,Number(quests.clientsCompleted)||0),
    productsLaunched:Math.max(0,Number(quests.productsLaunched)||0),
    lastDailyReset:Number(quests.lastDailyReset)||0,
    lastWeeklyReset:Number(quests.lastWeeklyReset)||0
  };
}

function normalizeSettings(settings={}){
  return {
    soundEnabled:settings.soundEnabled!==false,
    vibrationEnabled:settings.vibrationEnabled!==false,
    notifEnabled:settings.notifEnabled!==false
  };
}

function normalizeStats(stats={}){
  return {
    totalTaps:Math.max(0,Number(stats.totalTaps)||0),
    totalEarned:Math.max(0,Number(stats.totalEarned)||0),
    productsLaunched:Math.max(0,Number(stats.productsLaunched)||0),
    clientsCompleted:Math.max(0,Number(stats.clientsCompleted)||0),
    projectsCompleted:Math.max(0,Number(stats.projectsCompleted)||0),
    hackJobsCompleted:Math.max(0,Number(stats.hackJobsCompleted)||0)
  };
}

function normalizeBusinessEvents(events={}){
  return {
    pending:events.pending&&typeof events.pending==="object"?events.pending:null,
    history:Array.isArray(events.history)?events.history.slice(-30):[],
    lastEventAt:Number(events.lastEventAt)||0,
    intervalMs:Number(events.intervalMs)||75_000
  };
}

function normalizeOfflineReport(report={}){
  return {
    lastSummary:report.lastSummary&&typeof report.lastSummary==="object"?report.lastSummary:null,
    lastSeenAt:Number(report.lastSeenAt)||0,
    totalOfflineEarnings:Math.max(0,Number(report.totalOfflineEarnings)||0)
  };
}

function normalizeDepartments(parsedDepartments={}){
  const defaults=createDepartments();
  const validIds=new Set(state.team.map(employee=>employee.id));
  const assignedIds=new Set();
  state.departments=Object.fromEntries(Object.entries(defaults).map(([name,department])=>{
    const parsed=parsedDepartments[name]||{};
    const assigned=Array.isArray(parsed.assigned)?parsed.assigned.filter(id=>{
      if(!validIds.has(id)||assignedIds.has(id))return false;
      assignedIds.add(id);
      return true;
    }):[];
    return [name,{level:Math.max(1,Number(parsed.level)||department.level),assigned}];
  }));
  state.team.forEach(employee=>{
    if(state.departments[employee.assignedTo]){
      Object.entries(state.departments).forEach(([name,department])=>{if(name!==employee.assignedTo)department.assigned=department.assigned.filter(id=>id!==employee.id);});
      if(!state.departments[employee.assignedTo].assigned.includes(employee.id))state.departments[employee.assignedTo].assigned.push(employee.id);
      return;
    }
    employee.assignedTo=Object.entries(state.departments).find(([,department])=>department.assigned.includes(employee.id))?.[0]||null;
  });
}

export function normalizeState(parsed={}){
  state=Object.assign(structuredClone(defaultState),parsed);
  state.skills={...defaultState.skills,...(parsed.skills||{})};
  state.ownedItems={...defaultState.ownedItems,...(parsed.ownedItems||{})};
  state.projects=Object.fromEntries(Object.entries(defaultState.projects).map(([id,project])=>[id,{...project,...(parsed.projects?.[id]||{})}]));
  state.hacker={...structuredClone(defaultState.hacker),...(parsed.hacker||{})};
  state.hacker.toolsOwned=Array.isArray(parsed.hacker?.toolsOwned)?[...new Set(parsed.hacker.toolsOwned)]:[];
  state.hacker.history=Array.isArray(parsed.hacker?.history)?parsed.hacker.history.slice(-20):[];
  const parsedTeam=Array.isArray(parsed.team)?parsed.team:[];
  const legacyCount=parsedTeam.length?0:Math.max(0,Math.min(50,Number(parsed.employees)||0));
  state.team=(parsedTeam.length?parsedTeam:Array.from({length:legacyCount},(_,index)=>legacyEmployee(index))).map(normalizeEmployee);
  normalizeDepartments(parsed.departments);
  state.clientRating={...structuredClone(defaultState.clientRating),...(parsed.clientRating||{})};
  state.clientRating.history=Array.isArray(parsed.clientRating?.history)?parsed.clientRating.history.slice(-20):[];
  state.clientRating.count=Math.max(state.clientRating.history.length,Number(state.clientRating.count)||0);
  state.clientRating.average=Math.min(5,Math.max(0,Number(state.clientRating.average)||0));
  state.products=normalizeProducts(parsed.products);
  state.achievements=parsed.achievements&&typeof parsed.achievements==="object"?parsed.achievements:{};
  state.equity={...structuredClone(defaultState.equity),...(parsed.equity||{})};
  state.equity.investors=Array.isArray(parsed.equity?.investors)?parsed.equity.investors:[];
  state.equity.playerShare=Math.min(100,Math.max(0,Number(state.equity.playerShare)||0));
  state.equity.valuePenalty=Math.min(1,Math.max(0.1,Number(state.equity.valuePenalty)||1));
  state.market={...structuredClone(defaultState.market),...(parsed.market||{})};
  state.market.competitors=Array.isArray(parsed.market?.competitors)?parsed.market.competitors:[];
  state.market.categoryPenalties={...(parsed.market?.categoryPenalties||{})};
  state.career=normalizeCareer(parsed.career);
  state.recruitPool=Array.isArray(parsed.recruitPool)?parsed.recruitPool:[];
  state.availableClients=Array.isArray(parsed.availableClients)?parsed.availableClients:[];
  state.reputation=Math.max(0,Number(state.reputation)||0);
  state.hacker.cleanRep=Math.max(Number(state.hacker.cleanRep)||0,state.reputation);
  state.lastActiveTimestamp=Number(parsed.lastActiveTimestamp)||Date.now();
  state.lastSalaryAt=Number(parsed.lastSalaryAt)||0;
  state.tutorial=normalizeTutorial(parsed.tutorial);
  state.quests=normalizeQuests(parsed.quests);
  state.settings=normalizeSettings(parsed.settings);
  state.stats=normalizeStats(parsed.stats);
  state.businessEvents=normalizeBusinessEvents(parsed.businessEvents);
  state.offlineReport=normalizeOfflineReport(parsed.offlineReport);
  attachDerivedEmployees();
  return state;
}

export function loadState(){
  try{
    const raw=localStorage.getItem("codeEmpireSave");
    normalizeState(raw?JSON.parse(raw):{});
  }catch(error){
    console.warn("Save tidak dapat dibaca.",error);
    normalizeState();
  }
}

export function loadStateSafe(){
  const read=()=>{
    const raw=localStorage.getItem("codeEmpireSave");
    return raw?JSON.parse(raw):{};
  };
  const fallback=()=>({});
  return {read,fallback};
}

export function saveState(){
  state.lastActiveTimestamp=Date.now();
  try{
    localStorage.setItem("codeEmpireSave",JSON.stringify(state));
    writeBackupSafe();
  }catch(error){
    console.warn("Save gagal ditulis.",error);
  }
}

function writeBackupSafe(){
  try{
    if(typeof localStorage.getItem==="function"&&localStorage.getItem("codeEmpireSaveBackup"))return;
    const raw=localStorage.getItem("codeEmpireSave");
    if(raw)localStorage.setItem("codeEmpireSaveBackup",raw);
  }catch{/* silent */}
}

export function resetState(){
  normalizeState({...structuredClone(defaultState),lastActiveTimestamp:Date.now()});
  saveState();
}

export function addMoney(amount){
  state.money=Math.max(0,state.money+amount);
  return state.money;
}

export function addXP(amount){
  const startLevel=state.level;
  state.xp+=amount;
  while(state.xp>=state.xpNeeded){
    state.xp-=state.xpNeeded;
    state.level++;
    state.xpNeeded=Math.ceil(state.xpNeeded*1.35);
    addMoney(state.level*5);
  }
  return {leveledUp:state.level>startLevel,levels:state.level-startLevel,level:state.level};
}
