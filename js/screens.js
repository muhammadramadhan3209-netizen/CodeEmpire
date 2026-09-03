import {state} from "./state.js";
import {money} from "./ui.js";
import {projectDefs} from "./projects.js";
import {getPassiveIncomePerSecond} from "./economy.js";
import {getAsset} from "./data/assetMap.js";
import {achievementDefs} from "./data/achievements.js";
import {productCategories} from "./data/productCategories.js";
import {roleLabels} from "./data/candidates.js";
import {hackJobs,hackTools,riskLabels} from "./data/hackJobs.js";
import {skillTypes,getSkillTrainingCost} from "./systems/skillSystem.js";
import {getEmployeeTrainingCost} from "./systems/employeeSystem.js";
import {
  departmentDefs,
  departmentEffect,
  getDepartmentRequiredStaff,
  getDepartmentUpgradeCost,
  getNextOffice,
  getOfficeCapacity,
  officeAssetKey,
  officeName
} from "./systems/officeSystem.js";
import {getRecruitRefreshCost} from "./systems/recruitSystem.js";
import {getProductIncomePerSecond,getProductMultiplier} from "./systems/productSystem.js";
import {getAchievementProgress} from "./systems/achievementSystem.js";
import {getLeaderboard} from "./systems/marketSystem.js";
import {
  canAcceptHackJob,
  getAlignment,
  getHeatBand,
  getHeatEventCosts,
  getSecurityTrainingCost,
  isHackingFrozen,
  isOfficeFrozen
} from "./systems/hackSystem.js";
import {careerPanel} from "./screens/careerPanel.js";
import {questsScreen,bindQuestEvents} from "./screens/quests.js";
import {settingsScreen,bindSettingsEvents} from "./screens/settings.js";
import {attachEmployeeClicks} from "./screens/employeeDetail.js";

const skillLabels={frontend:"Frontend",backend:"Backend",ai:"Artificial Intelligence",security:"Cyber Security"};
const departmentNotes={
  development:"Mempercepat pengembangan produk.",
  marketing:"Menambah pilihan client.",
  sales:"Meningkatkan bayaran client.",
  security:"Mengurangi Heat dari operasi bayangan."
};

function esc(value){
  return String(value??"").replace(/[&<>\"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
}

function asset(category,key,className="asset-icon"){
  return `<img class="${className}" src="${getAsset(category,key)}" data-asset="${esc(category)}-${esc(key)}" alt="" loading="lazy">`;
}

function pageHeading(category,key,title,subtitle){
  return `<div class="page-heading"><div class="page-heading-icon">${asset(category,key)}</div><div><div class="page-title">${esc(title)}</div><div class="page-sub">${esc(subtitle)}</div></div></div>`;
}

function progressBar(value,className=""){
  const safe=Math.max(0,Math.min(100,Number(value)||0));
  return `<div class="progress-track ${className}"><div class="progress-fill" style="width:${safe}%"></div></div>`;
}

function xpPercent(){return Math.min(100,(state.xp/state.xpNeeded)*100);}

function characterKey(){
  if(state.hacker.activeJob)return "hacking";
  if(state.energy<20||state.hacker.heat>=60)return "stressed";
  return "idle";
}

function headerStats(){
  return `<div class="stat-row">
    <div class="stat">${asset("stat","level")}<b>${state.level}</b><span>PLAYER LEVEL</span></div>
    <div class="stat">${asset("stat","coding")}<b>${state.codingLevel}</b><span>CODING LEVEL</span></div>
    <div class="stat">${asset("stat","energy")}<b>${Math.floor(state.energy)}%</b><span>ENERGY</span></div>
  </div>
  <div class="xp-wrap"><div class="xp-line"><span>XP</span><span>${Math.floor(state.xp)} / ${state.xpNeeded}</span></div>${progressBar(xpPercent())}</div>`;
}

export function home(){
  const heatBand=getHeatBand();
  const character=characterKey();
  const share=Math.max(0,Math.min(1,state.equity.playerShare/100));
  const productNet=getProductIncomePerSecond()*share;
  return `<section class="hero">
    <div class="money">${money(state.money)}</div>
    <div class="money-label">TOTAL CASH</div>
    ${headerStats()}
  </section>
  <section class="code-zone">
    <div class="character-stage character-${character}" id="playerCharacter" data-character="${character}">${asset("character",character,"character-sprite")}</div>
    <button class="code-btn" id="codeBtn">CODE</button>
    <div class="income">+${money(state.moneyPerTap)} / TAP<br>+${money(getPassiveIncomePerSecond()+productNet)} / SEC NET</div>
  </section>
  <div class="section-title">DEVELOPMENT</div>
  <div class="card row">
    <div class="big-icon">${asset("ui","coding")}</div><div class="grow"><div class="name">Coding Engine</div><div class="muted">Level ${state.codingLevel}</div><div class="accent">+${money(state.moneyPerTap)} per tap</div></div>
    <button class="primary" id="upgradeBtn" ${state.money<state.upgradeCost?"disabled":""}>UPGRADE<br><small>${money(state.upgradeCost)}</small></button>
  </div>
  <div class="section-title">QUICK STATUS</div>
  <div class="grid3">
    <div class="card compact-card">${asset("stat","money")}<div class="name">Passive</div><div class="accent">${money(getPassiveIncomePerSecond()+productNet)}/s</div></div>
    <div class="card compact-card">${asset("stat","office")}<div class="name">Office</div><div class="muted">Level ${state.officeLevel}</div></div>
    <div class="card compact-card">${asset("stat","heat")}<div class="name">Heat</div><div class="accent heat-text-${heatBand.key}">${Math.floor(state.hacker.heat)} • ${heatBand.label}</div></div>
  </div>
  ${state.hacker.wanted?`<div class="notice danger-notice">WANTED aktif. Client premium terkunci sampai Heat turun di bawah 50.</div>`:""}`;
}

export function work(){
  const training=state.skillTraining;
  const cards=skillTypes.map(type=>{
    const level=state.skills[type];
    const cost=getSkillTrainingCost(type);
    const active=training?.type===type;
    const maxed=level>=15;
    return `<article class="card skill-card ${active?"active-card":""}">
      <div class="row"><div class="big-icon">${asset("avatar",type)}</div><div class="grow"><div class="name">${skillLabels[type]}</div><div class="muted">Level ${level} / 15</div><div class="accent">${type==="security"?"Membuka kontrak dan menekan Heat":"Meningkatkan kualitas delivery dan produk"}</div></div>
      ${maxed?`<span class="badge">MAX</span>`:`<button class="primary" data-train-skill="${type}" ${training||state.money<cost||state.energy<15?"disabled":""}>TRAIN<br><small>${money(cost)}</small></button>`}</div>
      ${active?`<div class="progress-copy"><span>TRAINING</span><span>${Math.floor(training.progress)}%</span></div>${progressBar(training.progress)}`:""}
    </article>`;
  }).join("");
  return `${pageHeading("nav","work","WORK LAB","Bangun skill teknis untuk client, produk, dan Shadow Path.")}
    <div class="section-title">CODING STATION</div>
    <section class="work-panel"><div class="character-stage small-stage character-${characterKey()}" id="playerCharacter" data-character="${characterKey()}">${asset("character",characterKey(),"character-sprite")}</div><div class="name">Focus Session</div><div class="skill-line"><span>Energy</span><span>${Math.floor(state.energy)}%</span></div>${progressBar(state.energy)}<button class="primary wide-button" id="workBtn" ${state.energy<10?"disabled":""}>WORK • +10 XP</button></section>
    <div class="section-title">SKILL TREE</div>${cards}`;
}

export function projects(){
  const cards=Object.entries(projectDefs).map(([id,project])=>{
    const projectState=state.projects[id];
    const unlocked=state.level>=project.unlock;
    let action;
    if(!unlocked)action=`<span class="badge">LEVEL ${project.unlock}</span>`;
    else if(projectState.completed)action=`<span class="badge success-badge">RELEASED</span>`;
    else if(projectState.active)action=`<span class="badge">${Math.floor(projectState.progress)}%</span>`;
    else action=`<button class="primary" data-project="${id}">START</button>`;
    return `<article class="card ${unlocked?"":"locked"}"><div class="row"><div class="big-icon">${asset("project",id)}</div><div class="grow"><div class="name">${esc(project.name)}</div><div class="muted">${project.duration}s • Reward ${money(project.reward)}</div><div class="accent">+${money(project.income)}/sec setelah rilis</div></div>${action}</div>${projectState.active?`<div class="progress-copy"><span>BUILDING</span><span>${Math.floor(projectState.progress)}%</span></div>${progressBar(projectState.progress)}`:""}</article>`;
  }).join("");
  return `${pageHeading("nav","projects","PROJECTS","Rilis aplikasi kecil untuk membangun modal dan passive income.")}<div class="section-title">PROJECT PIPELINE</div>${cards}`;
}

function departmentCards(){
  return Object.entries(departmentDefs).map(([id,definition])=>{
    const department=state.departments[id];
    const cost=getDepartmentUpgradeCost(id);
    const required=getDepartmentRequiredStaff(id);
    const effect=departmentEffect(id);
    const effectLabel=id==="security"?`${Math.round(effect*100)}% Heat reduction`:`${effect.toFixed(2)}x output`;
    return `<article class="card department-card"><div class="row"><div class="big-icon">${asset("department",id)}</div><div class="grow"><div class="name">${definition.label}</div><div class="muted">Level ${department.level} • ${department.assigned.length} assigned</div><div class="accent">${effectLabel}</div></div><button class="secondary" data-upgrade-department="${id}" ${state.money<cost||department.assigned.length<required||department.level>=10?"disabled":""}>UPGRADE<br><small>${money(cost)}</small></button></div><p class="card-note">${departmentNotes[id]} Upgrade butuh ${required} staff.</p></article>`;
  }).join("");
}

function teamCards(){
  if(!state.team.length)return `<div class="empty-state">Belum ada employee. Buka Recruitment untuk mencari kandidat pertama.</div>`;
  return state.team.map(employee=>{
    const allowed=Object.entries(departmentDefs).filter(([,definition])=>definition.roles.includes(employee.role));
    const trainingCost=getEmployeeTrainingCost(employee.id);
    return `<article class="card employee-card" data-employee-id="${esc(employee.id)}"><div class="row"><div class="avatar-frame">${asset("avatar",employee.role,"avatar-sprite")}</div><div class="grow"><div class="name">${esc(employee.name)}</div><div class="muted">${esc(roleLabels[employee.role]||employee.role)} • ${esc(employee.tier)} L${employee.level}</div><div class="accent">Morale ${Math.floor(employee.morale)} • Salary ${money(employee.salary)}</div></div><span class="trait">${esc(employee.personality||"loyal")}</span></div>
      ${employee.training?`<div class="progress-copy"><span>TRAINING</span><span>${Math.floor(employee.training.progress)}%</span></div>${progressBar(employee.training.progress)}`:""}
      <div class="employee-controls"><select data-assign-employee="${esc(employee.id)}" aria-label="Department ${esc(employee.name)}"><option value="">Unassigned</option>${allowed.map(([id,definition])=>`<option value="${id}" ${employee.assignedTo===id?"selected":""}>${definition.label}</option>`).join("")}</select><button class="secondary" data-train-employee="${esc(employee.id)}" ${employee.training||state.money<trainingCost?"disabled":""}>TRAIN</button><button class="secondary" data-promote-employee="${esc(employee.id)}">PROMOTE</button><button class="secondary" data-bonus-employee="${esc(employee.id)}">BONUS</button></div></article>`;
  }).join("");
}

export function office(){
  const next=getNextOffice();
  const officeKey=officeAssetKey();
  return `${pageHeading("nav","office","OFFICE","Atur kapasitas, employee, dan empat department perusahaan.")}
    <section class="office-visual asset-stage" data-office-level="${state.officeLevel}">${asset("office",officeKey,"office-sprite")}<div><span class="eyebrow">OFFICE LEVEL ${state.officeLevel}</span><div class="stage-title">${officeName()}</div><div class="stage-copy">${state.team.length} / ${getOfficeCapacity()} seats terisi</div></div></section>
    ${isOfficeFrozen()?`<div class="notice danger-notice">Kantor dibekukan sementara. Passive income berhenti sampai penyelidikan selesai.</div>`:""}
    ${state.hacker.wanted?`<div class="office-tape">POLICE LINE • DIGITAL EVIDENCE HOLD</div>`:""}
    <div class="card row"><div class="grow"><div class="name">Office Expansion</div><div class="muted">${next?`${next.name} • kapasitas ${next.capacity}`:"Semua tier office terbuka."}</div></div>${next?`<button class="primary" id="officeBtn" ${state.money<next.cost||isOfficeFrozen()?"disabled":""}>UPGRADE<br><small>${money(next.cost)}</small></button>`:`<span class="badge success-badge">MAX</span>`}</div>
    ${state.hacker.darkRep>=10?`<div class="card dark-room"><div class="row"><div class="big-icon">${asset("office","server")}</div><div><div class="name">Hidden Server Room</div><div class="muted">Shadow infrastructure terbuka oleh Dark Rep.</div></div></div></div>`:""}
    <div class="section-title">DEPARTMENTS</div>${departmentCards()}
    <div class="section-title">TEAM ROSTER</div>${teamCards()}`;
}

export function recruitment(){
  const pool=state.recruitPool||[];
  const refreshCost=getRecruitRefreshCost();
  const cards=pool.map(candidate=>`<article class="card candidate-card"><div class="row"><div class="avatar-frame">${asset("avatar",candidate.role,"avatar-sprite")}</div><div class="grow"><div class="name">${esc(candidate.name)}</div><div class="muted">${esc(candidate.roleLabel||roleLabels[candidate.role])} • Level ${candidate.level}</div><div class="accent">${esc(candidate.trait)} • Salary ${money(candidate.salary)}</div></div><button class="primary" data-hire="${esc(candidate.id)}" ${state.team.length>=getOfficeCapacity()||state.money<candidate.signingCost?"disabled":""}>HIRE<br><small>${money(candidate.signingCost)}</small></button></div></article>`).join("");
  return `${pageHeading("nav","recruitment","RECRUITMENT","Bangun tim spesialis; kapasitas mengikuti tier office.")}
    <div class="card roster-summary"><div><span class="eyebrow">TEAM CAPACITY</span><div class="stage-title">${state.team.length} / ${getOfficeCapacity()}</div></div><button class="secondary" id="refreshRecruitBtn" ${state.money<refreshCost?"disabled":""}>REFRESH • ${money(refreshCost)}</button></div>
    <div class="section-title">AVAILABLE CANDIDATES</div>${cards||`<div class="empty-state">Pool kandidat kosong. Refresh untuk mencari talent baru.</div>`}`;
}

export function shop(){
  const items=[
    {id:"laptop",name:"Basic Laptop",effect:"+1 coding per tap",cost:100},
    {id:"monitor",name:"Second Monitor",effect:"Hardware produktivitas",cost:500},
    {id:"keyboard",name:"Mechanical Keyboard",effect:"+3 coding per tap",cost:1200}
  ];
  const cards=items.map(item=>`<article class="card row"><div class="big-icon">${asset("shop",item.id)}</div><div class="grow"><div class="name">${item.name}</div><div class="muted">${item.effect}</div><div class="accent">${money(item.cost)}</div></div>${state.ownedItems[item.id]?`<span class="badge success-badge">OWNED</span>`:`<button class="primary" data-buy="${item.id}" ${state.money<item.cost?"disabled":""}>BUY</button>`}</article>`).join("");
  return `${pageHeading("nav","shop","SHOP","Upgrade workstation dan kelola data game.")}<div class="section-title">HARDWARE</div>${cards}<div class="section-title">SAVE DATA</div><div class="card action-grid"><button class="secondary" id="saveBtn" data-action="save-game">${asset("ui","save")} SAVE</button><button class="secondary" id="exportBtn" data-action="export-save">${asset("ui","export")} EXPORT</button><button class="secondary" id="importBtn" data-action="import-save">${asset("ui","import")} IMPORT</button><button class="danger-btn" id="resetBtn" data-action="reset-game">${asset("ui","reset")} RESET</button></div>`;
}

export function clients(){
  const active=state.activeClient;
  const cards=(state.availableClients||[]).map(client=>{
    const blocked=state.hacker.wanted&&(client.budget>=4000||["premium","enterprise"].includes(client.tier));
    return `<article class="card client-card ${blocked?"locked":""}"><div class="row"><div class="big-icon">${asset("client",client.tier||"starter")}</div><div class="grow"><div class="name">${esc(client.name)}</div><div class="muted">${esc(client.project)} • Difficulty ${client.difficulty}</div><div class="accent">${money(client.budget)} • target ${client.deadline}s</div></div>${blocked?`<span class="badge">WANTED</span>`:""}</div>${blocked?"":`<div class="client-actions"><button class="primary" data-client="${esc(client.offerId||client.id)}" data-mode="custom">CUSTOM</button><button class="secondary" data-client="${esc(client.offerId||client.id)}" data-mode="quick">QUICK</button><button class="secondary" data-client="${esc(client.offerId||client.id)}" data-mode="ai" ${state.skills.ai<2?"disabled":""}>AI ASSIST</button></div>`}</article>`;
  }).join("");
  const lastReview=state.clientRating.history.at(-1);
  return `${pageHeading("nav","clients","CLIENTS","Kelola delivery, rating, review, dan repeat business.")}
    <div class="rating-banner"><div>${asset("stat","rating","rating-asset")}<span>CLIENT RATING</span></div><strong>${state.clientRating.count?state.clientRating.average.toFixed(1):"—"} / 5</strong><small>${state.clientRating.count} delivery selesai</small></div>
    ${lastReview?`<div class="notice review-note"><b>${esc(lastReview.name)} • ${lastReview.rating}/5</b><br>${esc(lastReview.review)}</div>`:""}
    ${state.hacker.wanted?`<div class="notice danger-notice">Client premium menolak kontrak karena status Wanted.</div>`:""}
    ${active?`<article class="card active-client"><div class="row"><div class="big-icon">${asset("client",active.tier||"starter")}</div><div class="grow"><div class="eyebrow">ACTIVE DELIVERY • ${esc(active.mode).toUpperCase()}</div><div class="name">${esc(active.project)}</div><div class="muted">${esc(active.name)}</div></div><b>${Math.floor(active.progress)}%</b></div>${progressBar(active.progress)}</article>`:""}
    <div class="section-title">AVAILABLE BRIEFS</div>${cards||`<div class="empty-state">Tidak ada brief saat ini. Selesaikan delivery aktif atau tunggu market refresh.</div>`}`;
}

export function productDev(){
  const active=state.activeProductDev;
  const categoryCards=productCategories.map(category=>`<article class="card product-type-card"><div class="product-asset">${asset("product",category.id,"product-sprite")}</div><div class="name">${category.name}</div><div class="muted">${category.duration}s development • ${Object.entries(category.required).map(([skill,level])=>`${skill} ${level}`).join(" • ")}</div><div class="accent">Base income ${money(category.baseIncome)}/sec</div><button class="primary wide-button" data-product-type="${category.id}" ${active||state.money<category.cost?"disabled":""}>DEVELOP • ${money(category.cost)}</button></article>`).join("");
  const products=state.products.map(product=>{
    getProductMultiplier(product);
    const penalty=state.market.categoryPenalties[product.category];
    return `<article class="card row"><div class="product-asset small-product">${asset("product",product.category,"product-sprite")}</div><div class="grow"><div class="name">${esc(product.name)}</div><div class="muted">Health ${product.health}%${penalty&&penalty.expiresAt>Date.now()?" • Rival pressure aktif":""}</div><div class="accent">${money(product.baseIncome*getProductMultiplier(product))}/sec gross</div>${progressBar(product.health,product.health<50?"health-low":"")}</div><button class="secondary" data-maintain-product="${esc(product.id)}">MAINTAIN</button></article>`;
  }).join("");
  return `${pageHeading("nav","productDev","PRODUCT LAB","Bangun produk berulang, rawat health, dan hadapi rival market.")}
    ${active?`<article class="card active-card"><div class="row"><div class="product-asset small-product">${asset("product",active.id,"product-sprite")}</div><div class="grow"><div class="eyebrow">IN DEVELOPMENT</div><div class="name">${esc(active.name)}</div><div class="muted">Team Development sedang membangun release.</div></div><b>${Math.floor(active.progress)}%</b></div>${progressBar(active.progress)}</article>`:""}
    <div class="section-title">NEW PRODUCT</div><div class="product-grid">${categoryCards}</div>
    <div class="section-title">LIVE PRODUCTS • ${money(getProductIncomePerSecond())}/SEC GROSS</div>${products||`<div class="empty-state">Belum ada produk live. Tugaskan employee ke Development lalu mulai build.</div>`}`;
}

export function achievements(){
  const progress=getAchievementProgress();
  const cards=achievementDefs.map(definition=>{
    const unlocked=state.achievements[definition.id];
    return `<article class="card achievement-card ${unlocked?"unlocked":"locked"}"><div class="achievement-icon">${asset("achievement",definition.category,"achievement-sprite")}</div><div class="grow"><div class="eyebrow">${definition.category.toUpperCase()}</div><div class="name">${esc(definition.name)}</div><div class="muted">${esc(definition.description)}</div><div class="accent">Reward ${money(definition.reward.money)} • ${definition.reward.xp} XP</div>${unlocked?`<span class="badge success-badge">${esc(unlocked.badge)}</span>`:""}</div></article>`;
  }).join("");
  return `${pageHeading("nav","achievements","ACHIEVEMENTS","Kejar milestone legit, hacking, growth, dan dual path.")}<section class="achievement-summary"><strong>${progress.unlocked} / ${progress.total}</strong><span>badges unlocked</span>${progressBar(progress.percent)}</section><div class="section-title">BADGE COLLECTION</div>${cards}`;
}

export function company(){
  const alignment=getAlignment();
  const offer=state.equity.pendingOffer;
  const investors=state.equity.investors.map(investor=>`<article class="card row"><div class="big-icon">${asset("investor",investor.type)}</div><div class="grow"><div class="name">${esc(investor.name)}</div><div class="muted">Owns ${investor.share}% • invested ${money(investor.amount)}</div></div><button class="secondary" data-buyback="${esc(investor.id)}" data-share="1">BUY 1%</button></article>`).join("");
  const leaderboard=getLeaderboard().map(company=>`<div class="leaderboard-row ${company.isPlayer?"player-row":""}"><span class="rank">#${company.rank}</span>${asset("market",company.rank===1?"leader":"company")}<span class="grow">${esc(company.name)}</span><b>${money(company.companyValue)}</b></div>`).join("");
  return `${pageHeading("nav","company","COMPANY","Pantau career, equity, valuasi, investor, dan kompetisi market.")}
    <section class="company-hero"><div>${asset("market","trend","company-mark")}<span class="eyebrow">COMPANY VALUE</span></div><strong>${money(state.equity.companyValue)}</strong><small>${state.equity.playerShare}% founder equity • ${state.career.title}</small></section>
    <div class="grid2"><div class="card compact-card">${asset("stat","team")}<div class="name">Team</div><div class="accent">${state.team.length} employees</div></div><div class="card compact-card">${asset("product","productivity")}<div class="name">Products</div><div class="accent">${state.products.length} live</div></div><div class="card compact-card">${asset("stat","rating")}<div class="name">Clean Rep</div><div class="accent">${state.hacker.cleanRep}</div></div><div class="card compact-card dark-card">${asset("department","darkops")}<div class="name">${alignment.label}</div><div class="accent">Dark Rep ${state.hacker.darkRep}</div></div></div>
    ${offer?`<article class="card investor-offer"><div class="row"><div class="big-icon">${asset("investor",offer.type)}</div><div class="grow"><div class="eyebrow">FUNDING OFFER</div><div class="name">${esc(offer.name)}</div><div class="muted">${money(offer.amount)} untuk ${offer.share}% equity</div></div></div><div class="action-grid two-actions"><button class="primary" id="acceptInvestorBtn">ACCEPT</button><button class="secondary" id="declineInvestorBtn">DECLINE</button></div></article>`:""}
    <div class="section-title">CAREER TIER</div>${careerPanel()}
    <div class="section-title">CAP TABLE</div>${investors||`<div class="empty-state">Belum ada investor eksternal. Valuasi yang tumbuh akan menarik penawaran.</div>`}
    <div class="section-title">MARKET LEADERBOARD</div><div class="card leaderboard">${leaderboard}</div>
    ${state.market.lastEvent?`<div class="notice market-notice">${asset("market","warning")} ${esc(state.market.lastEvent.message)}</div>`:""}
    <div class="section-title">SAVE TRANSFER</div><div class="card action-grid"><button class="secondary" id="saveBtn" data-action="save-game">${asset("ui","save")} SAVE</button><button class="secondary" id="exportBtn" data-action="export-save">${asset("ui","export")} EXPORT</button><button class="secondary" id="importBtn" data-action="import-save">${asset("ui","import")} IMPORT</button><button class="danger-btn" id="resetBtn" data-action="reset-game">${asset("ui","reset")} RESET</button></div>`;
}

export function quests(){
  return questsScreen();
}

export function settings(){
  return settingsScreen();
}

function heatEventCard(){
  const event=state.hacker.pendingHeatEvent;
  if(!event)return "";
  if(event.type==="warning"||event.type==="caught")return `<div class="terminal-card alert-card"><div class="terminal-kicker">SYSTEM ALERT</div><div class="name">${esc(event.title)}</div><div class="muted">${esc(event.message)}</div>${event.fine!==undefined?`<div class="danger-copy">Denda: ${money(event.fine)}</div>`:""}<button class="danger-btn" data-heat-choice="ack">MENGERTI</button></div>`;
  const costs=getHeatEventCosts();
  return `<div class="terminal-card alert-card"><div class="terminal-kicker">INVESTIGATION ACTIVE</div><div class="name">${esc(event.title)}</div><div class="muted">${esc(event.message)}</div><div class="choice-grid"><button class="danger-btn" data-heat-choice="bribe" ${state.money<costs.bribe?"disabled":""}>BAYAR KONTAK<br><small>${money(costs.bribe)}</small></button><button class="secondary" data-heat-choice="lie_low">LIE LOW<br><small>Job dibekukan</small></button><button class="secondary" data-heat-choice="lawyer" ${state.money<costs.lawyer?"disabled":""}>HIRE LAWYER<br><small>${money(costs.lawyer)}</small></button></div></div>`;
}

function moralChoiceCard(){
  const job=state.hacker.pendingMoralChoice;
  if(!job)return "";
  const sellReward=Math.floor(job.reward*(job.rewardMultiplier||1)*1.35);
  const bounty=Math.floor(job.reward*(job.rewardMultiplier||1)*.72);
  return `<div class="terminal-card moral-card"><div class="terminal-kicker">MORAL FORK</div><div class="name">Apa yang dilakukan dengan temuan ${esc(job.name)}?</div><div class="muted">Pilihan ini mengubah arah reputasi dan risiko perusahaan.</div><div class="choice-grid two"><button class="danger-btn" data-moral-choice="shadow">JUAL DATA<br><small>${money(sellReward)} • Heat naik</small></button><button class="ethical-btn" data-moral-choice="ethical">LAPORKAN CELAH<br><small>${money(bounty)} • Clean Rep</small></button></div></div>`;
}

function activeHackJobCard(){
  const job=state.hacker.activeJob;
  if(!job)return "";
  const puzzle=job.minigame==="success"?"Pola sukses • bonus aktif":job.minigame==="failed"?"Pola gagal • risiko naik":"Pola belum diselesaikan";
  return `<div class="terminal-card active-hack"><div class="row"><div class="big-icon terminal-icon">${asset("hackJob",job.id)}</div><div class="grow"><div class="terminal-kicker">ACTIVE OPERATION</div><div class="name">${esc(job.name)}</div><div class="muted">${puzzle}</div></div><span class="risk risk-${job.risk}">${riskLabels[job.risk]}</span></div>${progressBar(job.progress,"hack-progress")}<div class="progress-copy"><span>ONLINE ONLY</span><span>${Math.floor(job.progress)}%</span></div></div>`;
}

function hackJobCards(){
  return hackJobs.map(job=>{
    const locked=state.skills.security<job.required.security;
    const active=state.hacker.activeJob?.id===job.id;
    const check=canAcceptHackJob(job.id);
    const action=active?`<span class="badge live-badge">LIVE</span>`:locked?`<span class="badge">SECURITY ${job.required.security}</span>`:`<button class="hack-btn" data-hack-job="${job.id}" ${check.ok?"":"disabled"}>ACCEPT</button>`;
    return `<article class="terminal-card job-card ${locked?"locked":""}"><div class="row"><div class="big-icon terminal-icon">${asset("hackJob",job.id)}</div><div class="grow"><div class="name">${esc(job.name)}</div><div class="muted">${esc(job.description)}</div><div class="job-meta"><span>${money(job.reward)}</span><span>${job.duration}s</span><span>Heat +${job.heatGain}</span></div></div>${action}</div><div class="job-footer"><span class="risk risk-${job.risk}">${riskLabels[job.risk]}</span>${job.moralChoice?`<span class="moral-tag">MORAL CHOICE</span>`:""}</div></article>`;
  }).join("");
}

function hackToolCards(){
  return hackTools.map(tool=>{
    const owned=state.hacker.toolsOwned.includes(tool.id);
    const ready=tool.id==="zero_day"&&state.hacker.zeroDayCharges>0;
    const action=owned?`<span class="badge">${ready?"READY":"OWNED"}</span>`:`<button class="hack-btn" data-hack-tool="${tool.id}" ${state.hacker.darkRep<tool.cost?"disabled":""}>${tool.cost} REP</button>`;
    return `<article class="terminal-card tool-card"><div class="row"><div class="big-icon terminal-icon">${asset("hackTool",tool.id)}</div><div class="grow"><div class="name">${esc(tool.name)}</div><div class="muted">${esc(tool.description)}</div></div>${action}</div></article>`;
  }).join("");
}

function hackHistory(){
  const history=[...(state.hacker.history||[])].reverse().slice(0,5);
  if(!history.length)return `<div class="notice terminal-notice">Belum ada jejak operasi.</div>`;
  return `<div class="terminal-card trace-list">${history.map(item=>`<div class="trace-row"><span>${item.path==="ethical"?"REPORT":item.type==="caught"?"CAUGHT":"JOB"} • ${esc(item.label)}</span><b class="${item.amount<0?"negative":""}">${item.amount>=0?"+":""}${money(item.amount)}</b></div>`).join("")}</div>`;
}

export function hackerHub(){
  const hacker=state.hacker;
  const heatBand=getHeatBand();
  const alignment=getAlignment();
  const freezeSeconds=Math.max(0,Math.ceil((hacker.freezeUntil-Date.now())/1000));
  const trainingCost=getSecurityTrainingCost();
  const trainingMax=state.skills.security>=15;
  return `<div class="hacker-shell">
    <div class="hacker-heading"><div class="page-heading"><div class="page-heading-icon terminal-icon">${asset("nav","hackerHub")}</div><div><div class="page-title">SHADOW NET</div><div class="page-sub">Dual identity operations console</div></div></div><div class="online-dot"><span></span>ENCRYPTED</div></div>
    <div class="identity-grid"><div class="terminal-card identity-card"><span>CLEAN REP</span><b>${hacker.cleanRep}</b></div><div class="terminal-card identity-card dark"><span>DARK REP</span><b>${hacker.darkRep}</b></div><div class="terminal-card identity-card"><span>ALIGNMENT</span><b>${alignment.label}</b></div></div>
    <div class="terminal-card heat-panel"><div class="heat-title"><span>TRACE HEAT</span><b class="heat-text-${heatBand.key}">${Math.floor(hacker.heat)} / 100 • ${heatBand.label}</b></div><div class="heat-track"><div class="heat-fill heat-${heatBand.key}" style="width:${hacker.heat}%"></div></div><div class="heat-scale"><span>HIDDEN</span><span>WATCHED</span><span>INVESTIGATED</span><span>CAUGHT</span></div></div>
    <div class="status-strip"><span>IDENTITY: <b class="${hacker.identity==="exposed"?"danger-copy":"green-copy"}">${hacker.identity.toUpperCase()}</b></span><span>JOBS: <b>${hacker.completedJobs}</b></span><span>CAUGHT: <b>${hacker.caught}</b></span></div>
    ${hacker.wanted?`<div class="notice danger-notice">WANTED. Client premium terkunci sampai Heat turun di bawah 50.</div>`:""}
    ${isHackingFrozen()?`<div class="notice terminal-notice">Shadow Path dibekukan selama ${freezeSeconds} detik. Heat turun lebih cepat.</div>`:""}
    ${heatEventCard()}${moralChoiceCard()}${activeHackJobCard()}
    <div class="section-title terminal-section">SECURITY LAB</div>
    <div class="terminal-card security-lab"><div class="row"><div class="big-icon terminal-icon">${asset("ui","training")}</div><div class="grow"><div class="name">Security Skill • Level ${state.skills.security}</div><div class="muted">Training membuka kontrak baru dan memakai 15 Energy.</div></div>${trainingMax?`<span class="badge">MAX</span>`:`<button class="hack-btn" id="securityTrainBtn" ${state.skillTraining||state.money<trainingCost||state.energy<15?"disabled":""}>TRAIN<br><small>${money(trainingCost)}</small></button>`}</div>${state.skillTraining?.type==="security"?`${progressBar(state.skillTraining.progress,"hack-progress")}`:""}</div>
    <div class="section-title terminal-section">SHADOW CONTRACTS</div>${hackJobCards()}
    <div class="section-title terminal-section">DARK MARKET</div>${hackToolCards()}
    <div class="section-title terminal-section">RECENT TRACE</div>${hackHistory()}
  </div>`;
}
