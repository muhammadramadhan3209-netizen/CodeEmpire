import {state,loadState,saveState,resetState,addXP} from "./state.js";
import {codeOnce,buyCodingUpgrade,passiveTick,buyItem} from "./economy.js";
import {startProject,tickProjects} from "./projects.js";
import {setRenderCallback,render,toast,floatMoney,setActiveNav,money} from "./ui.js";
import {initNavigation} from "./navigation.js";
import {getAsset} from "./data/assetMap.js";
import {home,work,projects,office,shop,clients,company,hackerHub,recruitment,productDev,achievements,quests,settings} from "./screens.js";
import {acceptClient,generateClients,tickClient} from "./systems/clientSystem.js";
import {trainSkill,tickSkillTraining} from "./systems/skillSystem.js";
import {registerProgress} from "./systems/questSystem.js";
import {refreshRecruitPool,hireCandidate} from "./systems/recruitSystem.js";
import {trainEmployee,tickEmployeeTraining,promoteEmployee,giveBonus,paySalary,tickEmployeeWellbeing} from "./systems/employeeSystem.js";
import {upgradeOffice,assignEmployee,unassignEmployee,upgradeDepartment} from "./systems/officeSystem.js";
import {startProductDev,tickProductDev,productIncome,maintainProduct} from "./systems/productSystem.js";
import {checkAchievements} from "./systems/achievementSystem.js";
import {updateCareerTitle,getCurrentCareerTier,getNextCareerTierInfo} from "./systems/careerSystem.js";
import {tickEvents} from "./systems/eventSystem.js";
import {calculateOfflineIncome,claimOfflineIncome} from "./systems/offlineSystem.js";
import {exportSave,importSave} from "./systems/saveTransferSystem.js";
import {calculateCompanyValue,offerInvestor,acceptInvestorOffer,declineInvestorOffer,buybackShares,handleExposedInvestorRisk} from "./systems/investorSystem.js";
import {initializeMarket,tickMarket} from "./systems/marketSystem.js";
import {
  acceptHackJob,
  buyHackTool,
  resolveHackMinigame,
  resolveHeatEvent,
  resolveMoralChoice,
  tickHackJob,
  tickHeat,
  trainSecuritySkill
} from "./systems/hackSystem.js";
import {startTutorial,getCurrentStep,tickTutorial,getTutorialProgress} from "./systems/tutorialSystem.js";
import {rolloverQuests,checkQuestCompletions,claimQuestReward,getQuestList} from "./systems/questSystem.js";
import {tickBusinessEvents,resolveBusinessEvent,dismissBusinessEvent,getBusinessEventDefs} from "./systems/businessEventSystem.js";
import {setSoundEnabled,setVibrationEnabled,bindButtonFeedback,feedback} from "./systems/feedbackSystem.js";
import {nativeBridge} from "./systems/nativeBridge.js";
import {on as onEvent,emit,events as busEvents} from "./systems/eventBus.js";
import {bindQuestEvents} from "./screens/quests.js";
import {bindSettingsEvents} from "./screens/settings.js";
import {attachEmployeeClicks} from "./screens/employeeDetail.js";
import {performReset,bindResetListener,reinitializeEventListeners} from "./systems/resetManager.js";
import {tickReputationDecay,isReputationDecayActive,getReputationDecayProgress} from "./systems/reputationDecay.js";

nativeBridge.ready();

if(typeof globalThis!=="undefined"){
  globalThis.__codeempire=globalThis.__codeempire||{};
  globalThis.__codeempire.reinit=()=>{
    try{reinitializeEventListeners();}catch(error){console.warn("reinit gagal.",error);}
  };
  globalThis.__codeempire.backHandler=()=>{
    const layer=document.getElementById("modal-layer");
    if(layer&&layer.firstElementChild){
      layer.innerHTML="";
      return true;
    }
    return false;
  };
}

loadState();
setSoundEnabled(state.settings?.soundEnabled!==false);
setVibrationEnabled(state.settings?.vibrationEnabled!==false);
const offlineSnapshot=calculateOfflineIncome();
generateClients();
refreshRecruitPool();
initializeMarket();
updateCareerTitle();
calculateCompanyValue();
if(!state.lastSalaryAt)state.lastSalaryAt=Date.now();
rolloverQuests();
if(!state.tutorial.completed&&!state.tutorial.active){
  startTutorial();
}

const screenViews={home,work,projects,office,shop,clients,company,hackerHub,recruitment,productDev,achievements,quests,settings};
let puzzleToken=0;

function renderScreen(){
  const screen=document.getElementById("screen");
  const scrollTop=screen.scrollTop;
  screen.innerHTML=(screenViews[state.screen]||home)();
  screen.scrollTop=scrollTop;
  setActiveNav();
  bindScreenEvents();
  attachEmployeeClicks();
  if(state.screen==="quests")bindQuestEvents(screen);
  if(state.screen==="settings")bindSettingsEvents(screen);
}

function persist(result,{successAnimation=false}={}){
  toast(result.ok?(result.message||"Berhasil."):(result.reason||"Aksi tidak dapat dilakukan."));
  if(!result.ok)return;
  saveState();
  render();
  if(successAnimation)animateCharacter("celebrate");
}

function animateCharacter(kind,duration=700){
  const character=document.getElementById("playerCharacter");
  if(!character)return;
  const sprite=character.querySelector("[data-asset]");
  if(!sprite)return;
  character.classList.remove("character-idle","character-typing","character-celebrate","character-stressed","character-hacking");
  character.classList.add(`character-${kind}`);
  character.dataset.character=kind;
  sprite.dataset.asset=`character-${kind}`;
  sprite.textContent=getAsset("character",kind);
  window.setTimeout(()=>{
    if(!character.isConnected)return;
    const resting=state.hacker.activeJob?"hacking":state.energy<20||state.hacker.heat>=60?"stressed":"idle";
    character.classList.remove(`character-${kind}`);
    character.classList.add(`character-${resting}`);
    character.dataset.character=resting;
    sprite.dataset.asset=`character-${resting}`;
    sprite.textContent=getAsset("character",resting);
  },duration);
}

function modalShell({assetKey="save",kicker,title,body,actions=""}){
  return `<div class="game-modal" role="dialog" aria-modal="true"><div class="modal-asset" data-asset="ui-${assetKey}">${getAsset("ui",assetKey)}</div><div class="eyebrow">${kicker}</div><h2>${title}</h2>${body}<div class="modal-actions">${actions}</div></div>`;
}

function closeModal(){document.getElementById("modal-layer").innerHTML="";}

function esc(value){
  return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
}

function progressBar(value,className=""){
  const safe=Math.max(0,Math.min(100,Number(value)||0));
  return `<div class="progress-track ${className}"><div class="progress-fill" style="width:${safe}%"></div></div>`;
}

function asset(category,key,className="asset-icon"){
  return `<img class="${className}" src="${getAsset(category,key)}" data-asset="${esc(category)}-${esc(key)}" alt="" loading="lazy">`;
}

function showOfflineModal(summary){
  if(summary.earnings<=0)return;
  const hours=Math.floor(summary.seconds/3600);
  const minutes=Math.floor((summary.seconds%3600)/60);
  const duration=hours?`${hours} jam ${minutes} menit`:`${Math.max(1,minutes)} menit`;
  const layer=document.getElementById("modal-layer");
  layer.innerHTML=modalShell({
    assetKey:"coding",
    kicker:"WELCOME BACK",
    title:`${money(summary.earnings)} terkumpul`,
    body:`<p>Kamu offline selama ${duration}. Income legal dan produk berjalan pada efisiensi 60%${summary.hackJobPaused?", sedangkan job hacking tetap dijeda":""}.</p>`,
    actions:`<button class="primary wide-button" id="claimOfflineBtn">CLAIM INCOME</button>`
  });
  layer.querySelector("#claimOfflineBtn").onclick=()=>{
    const result=claimOfflineIncome(summary.earnings);
    closeModal();
    saveState();
    render();
    toast(result.message);
    animateCharacter("celebrate");
  };
}

function showExportModal(){
  const code=exportSave();
  const layer=document.getElementById("modal-layer");
  layer.innerHTML=modalShell({
    assetKey:"export",
    kicker:"SAVE TRANSFER",
    title:"Export Save",
    body:`<p>Simpan kode ini untuk memindahkan seluruh progres ke browser lain.</p><textarea id="saveCode" class="save-textarea" readonly>${code}</textarea>`,
    actions:`<button class="primary" id="copySaveBtn">COPY</button><button class="secondary" id="closeModalBtn">CLOSE</button>`
  });
  layer.querySelector("#closeModalBtn").onclick=closeModal;
  layer.querySelector("#copySaveBtn").onclick=async()=>{
    const textarea=layer.querySelector("#saveCode");
    textarea.select();
    try{await navigator.clipboard.writeText(textarea.value);toast("Kode save disalin.");}
    catch(error){document.execCommand("copy");toast("Kode save disalin.");}
  };
}

function showImportModal(){
  const layer=document.getElementById("modal-layer");
  layer.innerHTML=modalShell({
    assetKey:"import",
    kicker:"SAVE TRANSFER",
    title:"Import Save",
    body:`<p>Tempel kode save. Data game saat ini akan diganti setelah validasi berhasil.</p><textarea id="saveCode" class="save-textarea" placeholder="Tempel kode save di sini"></textarea><div class="modal-result" id="importResult"></div>`,
    actions:`<button class="primary" id="confirmImportBtn">IMPORT</button><button class="secondary" id="closeModalBtn">CANCEL</button>`
  });
  layer.querySelector("#closeModalBtn").onclick=closeModal;
  layer.querySelector("#confirmImportBtn").onclick=()=>{
    const result=importSave(layer.querySelector("#saveCode").value);
    if(!result.ok){const output=layer.querySelector("#importResult");output.textContent=result.reason;output.className="modal-result failed";return;}
    closeModal();
    generateClients();
    refreshRecruitPool();
    initializeMarket();
    calculateCompanyValue();
    render();
    toast(result.message);
  };
}

function showResetConfirm(){
  const layer=document.getElementById("modal-layer");
  if(!layer)return;
  if(layer.firstElementChild)return;
  const modal=`<div class="game-modal danger-modal" role="dialog" aria-modal="true">
    <div class="modal-asset">${getAsset("ui","reset")}</div>
    <div class="eyebrow">CONFIRM RESET</div>
    <h2>Reset seluruh progress?</h2>
    <p>Save, backup, dan pengaturan akan dihapus. Tidak dapat dibatalkan.</p>
    <div class="modal-actions">
      <button class="danger-btn" id="confirmResetBtn">YA, RESET</button>
      <button class="secondary" id="cancelResetBtn">BATAL</button>
    </div>
  </div>`;
  layer.innerHTML=modal;
  const cancelBtn=layer.querySelector("#cancelResetBtn");
  if(cancelBtn)cancelBtn.onclick=closeModal;
  const confirmBtn=layer.querySelector("#confirmResetBtn");
  if(confirmBtn)confirmBtn.onclick=()=>{
    confirmBtn.disabled=true;
    confirmBtn.textContent="MERESET...";
    performReset({reload:true,reason:"user"}).then(result=>{
      if(!result?.ok&&result?.reason){
        confirmBtn.disabled=false;
        confirmBtn.textContent="YA, RESET";
        toast(result.reason);
      }
    }).catch(error=>{
      console.warn("Reset error.",error);
      confirmBtn.disabled=false;
      confirmBtn.textContent="YA, RESET";
      toast("Reset gagal. Coba lagi.");
    });
  };
}

function showTutorialPrompt(){
  if(!state.tutorial.active||state.tutorial.completed)return;
  const step=getCurrentStep();
  if(!step)return;
  const layer=document.getElementById("modal-layer");
  if(layer.firstElementChild)return;
  const progress=getTutorialProgress();
  const body=`<p>${esc(step.body)}</p><div class="xp-line"><span>Step ${progress.current+1}/${progress.total}</span><span>${progress.percent}%</span></div>${progressBar(progress.percent)}<p class="muted">Reward: ${money(step.reward?.money||0)} • ${step.reward?.xp||0} XP${step.reward?.reputation?` • +${step.reputation} Rep`:""}</p>`;
  const actions=`<button class="primary" id="tutorialGo">BUKA ${esc(step.screen.toUpperCase())}</button><button class="secondary" id="tutorialSkip">LEWATI</button>`;
  layer.innerHTML=modalShell({assetKey:"settings",kicker:"TUTORIAL",title:esc(step.title),body,actions});
  layer.querySelector("#tutorialGo").onclick=()=>{
    state.screen=step.screen;
    render();
    closeModal();
  };
  layer.querySelector("#tutorialSkip").onclick=()=>{
    state.tutorial.active=false;
    state.tutorial.completed=true;
    closeModal();
    toast("Tutorial dilewati. Kamu bisa bermain bebas.");
  };
}

function showQuestsPanel(){
  const layer=document.getElementById("modal-layer");
  if(layer.firstElementChild)return;
  rolloverQuests();
  const quests=getQuestList();
  if(!quests.length)return;
  const cards=quests.map(quest=>{
    const percent=Math.min(100,Math.round((quest.progress/quest.target)*100));
    const rewardLabel=`${money(quest.reward.money)} • ${quest.reward.xp} XP${quest.reward.reputation?` • +${quest.reward.reputation} Rep`:""}`;
    const action=quest.claimed?`<span class="badge success-badge">KLAIM</span>`
      :quest.completed?`<button class="primary" data-quest-claim="${esc(quest.id)}">CLAIM</button>`
      :`<span class="badge">${quest.period.toUpperCase()}</span>`;
    return `<article class="card"><div class="row"><div class="big-icon">${asset("ui","training")}</div><div class="grow"><div class="name">${esc(quest.label)}</div><div class="muted">${quest.progress}/${quest.target} • ${rewardLabel}</div>${progressBar(percent)}</div>${action}</div></article>`;
  }).join("");
  layer.innerHTML=modalShell({assetKey:"training",kicker:"DAILY & WEEKLY",title:"Quest Harian & Mingguan",body:cards,actions:`<button class="secondary" id="closeQuests">TUTUP</button>`});
  layer.querySelector("#closeQuests").onclick=closeModal;
  layer.querySelectorAll("[data-quest-claim]").forEach(btn=>{
    btn.onclick=()=>{
      const result=claimQuestReward(btn.dataset.questClaim);
      toast(result.message||result.reason);
      if(result.ok)showQuestsPanel();
    };
  });
}

function showBusinessEventModal(){
  if(!state.businessEvents.pending)return;
  const layer=document.getElementById("modal-layer");
  if(layer.firstElementChild)return;
  const ev=state.businessEvents.pending;
  const optionCards=ev.options.map(option=>`<button class="primary" data-event-option="${esc(option.id)}">${esc(option.label)}</button>`).join("");
  const body=`<p>${esc(ev.description)}</p><div class="action-grid">${optionCards}</div>`;
  layer.innerHTML=modalShell({assetKey:ev.icon||"settings",kicker:"BUSINESS EVENT",title:esc(ev.title),body,actions:""});
  layer.querySelectorAll("[data-event-option]").forEach(btn=>{
    btn.onclick=()=>{
      const result=resolveBusinessEvent(btn.dataset.eventOption);
      closeModal();
      if(result.message)toast(result.message);
      saveState();
      render();
    };
  });
}

function showOfflineSummaryModal(summary){
  if(!summary||summary.seconds<60)return;
  if(!state.offlineReport?.lastSummary)return;
  const last=state.offlineReport.lastSummary;
  const hours=Math.floor(summary.seconds/3600);
  const minutes=Math.floor((summary.seconds%3600)/60);
  const body=`<p>Kamu offline selama ${hours?`${hours} jam ` :""}${minutes} menit.</p><ul class="muted" style="text-align:left;list-style:none;padding:0"><li>Passive income: ${money(summary.passivePerSecond||0)}/s</li><li>Product income: ${money(summary.productPerSecond||0)}/s</li><li>Total earned: ${money(last.amount||summary.earnings)}</li><li>Total offline earnings: ${money(state.offlineReport.totalOfflineEarnings||0)}</li></ul>`;
  const layer=document.getElementById("modal-layer");
  if(layer.firstElementChild)return;
  layer.innerHTML=modalShell({assetKey:"money",kicker:"WELCOME BACK",title:"Ringkasan Offline",body,actions:`<button class="primary" id="offlineSummaryClose">TUTUP</button>`});
  layer.querySelector("#offlineSummaryClose").onclick=closeModal;
}

function launchHackMinigame(job){
  if(!job||job.minigame!=="pending")return;
  const layer=document.getElementById("modal-layer");
  const nodes=["01","10","A7","F3"];
  const length=job.risk==="low"?3:job.risk==="medium"?4:job.risk==="high"?5:6;
  const sequence=Array.from({length},()=>nodes[Math.floor(Math.random()*nodes.length)]);
  const token=++puzzleToken;
  let input=[];
  let acceptingInput=false;
  let timeoutId=null;

  layer.innerHTML=`<div class="hack-modal" role="dialog" aria-modal="true" aria-labelledby="hack-modal-title"><div class="terminal-kicker">MEMORY BREACH</div><h2 id="hack-modal-title">Ingat Pola Node</h2><p>Amati urutan kode. Ulangi pola sebelum waktu habis.</p><div class="sequence-display" id="sequenceDisplay">READY</div><div class="node-grid">${nodes.map(node=>`<button class="node-btn" data-node="${node}" disabled>${node}</button>`).join("")}</div><div class="modal-result" id="modalResult"></div><div class="hack-modal-actions"><button class="skip-btn" id="skipPuzzle">LEWATI • DIHITUNG GAGAL</button></div></div>`;

  const display=layer.querySelector("#sequenceDisplay");
  const resultEl=layer.querySelector("#modalResult");
  const nodeButtons=[...layer.querySelectorAll("[data-node]")];
  const closeAfterResult=()=>window.setTimeout(()=>{if(token===puzzleToken)closeModal();},900);
  const finish=success=>{
    if(token!==puzzleToken||!layer.firstElementChild)return;
    acceptingInput=false;
    clearTimeout(timeoutId);
    nodeButtons.forEach(button=>button.disabled=true);
    const resolved=resolveHackMinigame(success);
    if(!resolved.ok){closeModal();return;}
    resultEl.textContent=resolved.message;
    resultEl.className=`modal-result ${success?"success":"failed"}`;
    display.textContent=success?"ACCESS GRANTED":"TRACE DETECTED";
    saveState();
    render();
    closeAfterResult();
  };
  nodeButtons.forEach(button=>button.onclick=()=>{
    if(!acceptingInput)return;
    const node=button.dataset.node;
    input.push(node);
    display.textContent=input.join("  ");
    if(node!==sequence[input.length-1]){finish(false);return;}
    if(input.length===sequence.length)finish(true);
  });
  layer.querySelector("#skipPuzzle").onclick=()=>finish(false);

  let index=0;
  const flashNext=()=>{
    if(token!==puzzleToken||!layer.firstElementChild)return;
    if(index>=sequence.length){
      display.textContent="?  ?  ?";
      acceptingInput=true;
      nodeButtons.forEach(button=>button.disabled=false);
      nodeButtons[0]?.focus();
      timeoutId=window.setTimeout(()=>finish(false),9000);
      return;
    }
    display.textContent=sequence[index++];
    window.setTimeout(()=>{if(token!==puzzleToken)return;display.textContent="•";window.setTimeout(flashNext,180);},520);
  };
  window.setTimeout(flashNext,650);
}

function bindScreenEvents(){
  const codeBtn=document.getElementById("codeBtn");
  if(codeBtn)codeBtn.onclick=event=>{
    const previousLevel=state.level;
    codeOnce();
    floatMoney(`+${money(state.moneyPerTap)}`,event.clientX,event.clientY);
    emit(busEvents.MONEY_GAINED,{amount:state.moneyPerTap,x:event.clientX,y:event.clientY});
    saveState();
    render();
    animateCharacter(state.level>previousLevel?"celebrate":"typing");
  };

  const upgrade=document.getElementById("upgradeBtn");
  if(upgrade)upgrade.onclick=()=>{
    if(!buyCodingUpgrade()){toast("Uang belum cukup.");return;}
    saveState();render();toast("Coding berhasil di-upgrade.");animateCharacter("celebrate");
  };

  const workBtn=document.getElementById("workBtn");
  if(workBtn)workBtn.onclick=()=>{
    if(state.energy<10){toast("Energy habis. Tunggu sebentar.");return;}
    state.energy-=10;
    const xp=addXP(10);
    saveState();render();toast(xp.leveledUp?`Level naik ke ${xp.level}.`:"+10 XP");animateCharacter(xp.leveledUp?"celebrate":"typing");
  };

  document.querySelectorAll("[data-train-skill]").forEach(button=>button.onclick=()=>{
    const result=trainSkill(button.dataset.trainSkill);
    if(result.ok)registerProgress("skillTrainings",1);
    persist(result);
  });
  document.querySelectorAll("[data-project]").forEach(button=>button.onclick=()=>{
    const ok=startProject(button.dataset.project);
    persist(ok?{ok:true,message:"Project dimulai."}:{ok:false,reason:"Project belum dapat dimulai."});
  });

  const officeBtn=document.getElementById("officeBtn");
  if(officeBtn)officeBtn.onclick=()=>persist(upgradeOffice(),{successAnimation:true});
  document.querySelectorAll("[data-upgrade-department]").forEach(button=>button.onclick=()=>persist(upgradeDepartment(button.dataset.upgradeDepartment)));
  document.querySelectorAll("[data-assign-employee]").forEach(select=>select.onchange=()=>persist(select.value?assignEmployee(select.dataset.assignEmployee,select.value):unassignEmployee(select.dataset.assignEmployee)));
  document.querySelectorAll("[data-train-employee]").forEach(button=>button.onclick=()=>persist(trainEmployee(button.dataset.trainEmployee)));
  document.querySelectorAll("[data-promote-employee]").forEach(button=>button.onclick=()=>persist(promoteEmployee(button.dataset.promoteEmployee),{successAnimation:true}));
  document.querySelectorAll("[data-bonus-employee]").forEach(button=>button.onclick=()=>persist(giveBonus(button.dataset.bonusEmployee)));

  const refreshRecruit=document.getElementById("refreshRecruitBtn");
  if(refreshRecruit)refreshRecruit.onclick=()=>persist(refreshRecruitPool(true));
  document.querySelectorAll("[data-hire]").forEach(button=>button.onclick=()=>persist(hireCandidate(button.dataset.hire),{successAnimation:true}));

  document.querySelectorAll("[data-buy]").forEach(button=>button.onclick=()=>{
    const item=buyItem(button.dataset.buy);
    persist(item?{ok:true,message:`${item.label} dibeli.`}:{ok:false,reason:"Item tidak tersedia atau uang belum cukup."});
  });

  document.querySelectorAll("[data-client]").forEach(button=>button.onclick=()=>persist(acceptClient(button.dataset.client,button.dataset.mode)));
  document.querySelectorAll("[data-product-type]").forEach(button=>button.onclick=()=>persist(startProductDev(button.dataset.productType)));
  document.querySelectorAll("[data-maintain-product]").forEach(button=>button.onclick=()=>persist(maintainProduct(button.dataset.maintainProduct)));

  document.querySelectorAll("[data-hack-job]").forEach(button=>button.onclick=()=>{
    const result=acceptHackJob(button.dataset.hackJob);
    if(!result.ok){toast(result.reason);return;}
    saveState();render();toast(result.message);animateCharacter("hacking");
    if(!result.guaranteed)launchHackMinigame(state.hacker.activeJob);
  });
  document.querySelectorAll("[data-hack-tool]").forEach(button=>button.onclick=()=>persist(buyHackTool(button.dataset.hackTool)));
  const securityTrain=document.getElementById("securityTrainBtn");
  if(securityTrain)securityTrain.onclick=()=>persist(trainSecuritySkill());
  document.querySelectorAll("[data-moral-choice]").forEach(button=>button.onclick=()=>persist(resolveMoralChoice(button.dataset.moralChoice),{successAnimation:true}));
  document.querySelectorAll("[data-heat-choice]").forEach(button=>button.onclick=()=>persist(resolveHeatEvent(button.dataset.heatChoice)));

  const acceptInvestor=document.getElementById("acceptInvestorBtn");
  if(acceptInvestor)acceptInvestor.onclick=()=>persist(acceptInvestorOffer(),{successAnimation:true});
  const declineInvestor=document.getElementById("declineInvestorBtn");
  if(declineInvestor)declineInvestor.onclick=()=>persist(declineInvestorOffer());
  document.querySelectorAll("[data-buyback]").forEach(button=>button.onclick=()=>persist(buybackShares(button.dataset.buyback,Number(button.dataset.share))));

  const save=document.getElementById("saveBtn");
  if(save)save.onclick=()=>{saveState();toast("Game tersimpan.");};
  const exportButton=document.getElementById("exportBtn");
  if(exportButton)exportButton.onclick=showExportModal;
  const importButton=document.getElementById("importBtn");
  if(importButton)importButton.onclick=showImportModal;
  const reset=document.getElementById("resetBtn");
  if(reset)reset.onclick=()=>showResetConfirm();
}

function tickGame(){
  const messages=[];
  let celebrate=false;
  const levelAtStart=state.level;
  passiveTick();
  const completedProjects=tickProjects();
  if(completedProjects.length){messages.push(`${completedProjects[0].name} berhasil dirilis.`);celebrate=true;}
  const clientResult=tickClient();
  if(clientResult){messages.push(clientResult.message);celebrate=true;}
  productIncome();
  const productResult=tickProductDev();
  if(productResult){messages.push(productResult.message);celebrate=true;}
  const employeeTraining=tickEmployeeTraining();
  if(employeeTraining.length)messages.push(`${employeeTraining[0].name} menyelesaikan training.`);
  tickEmployeeWellbeing();
  const skillTraining=tickSkillTraining();
  if(skillTraining)messages.push(skillTraining.message);
  const hackResult=tickHackJob();
  if(hackResult){messages.unshift(hackResult.message);celebrate=hackResult.type!=="moral";}
  if(hackResult&&hackResult.type!=="moral")state.stats.hackJobsCompleted=(state.stats.hackJobsCompleted||0)+1;
  const heatResult=tickHeat();
  if(heatResult)messages.unshift(heatResult.message);

  const now=Date.now();
  if(now-state.lastSalaryAt>=60_000){
    const payroll=paySalary();
    state.lastSalaryAt=now;
    if(payroll.message)messages.push(payroll.message);
  }

  const event=tickEvents();
  if(event)messages.unshift(`${event.name}: ${event.message}`);
  const businessEvt=tickBusinessEvents();
  if(businessEvt){showBusinessEventModal();emit(busEvents.EVENT_OPENED,businessEvt);}
  const decayResult=tickReputationDecay();
  if(decayResult?.message)messages.push(decayResult.message);
  const marketEvent=tickMarket();
  if(marketEvent)messages.unshift(marketEvent.message);
  generateClients();
  refreshRecruitPool();
  const career=updateCareerTitle();
  if(career.changed)messages.push(career.message);
  calculateCompanyValue();
  const investorExit=handleExposedInvestorRisk();
  if(investorExit)messages.unshift(investorExit.message);
  const investorOffer=offerInvestor();
  if(investorOffer.ok)messages.unshift(investorOffer.message);
  const unlocked=checkAchievements();
  if(unlocked.length){messages.unshift(`Achievement unlocked: ${unlocked[0].name}.`);celebrate=true;emit(busEvents.ACHIEVEMENT_UNLOCKED,unlocked[0]);}
  const tutorialResult=tickTutorial();
  if(tutorialResult?.completed){messages.unshift(tutorialResult.message);}
  const questDone=checkQuestCompletions();
  if(questDone.length)messages.push(`Quest selesai: ${questDone[0].label}. Klaim di panel quest.`);
  if(state.level>levelAtStart){messages.unshift(`Level naik ke ${state.level}.`);celebrate=true;feedback("levelUp");emit(busEvents.LEVEL_UP,{level:state.level});}

  state.energy=Math.min(100,state.energy+2);
  saveState();
  render();
  if(messages.length)toast(messages[0]);
  if(celebrate)animateCharacter("celebrate");
}

document.querySelectorAll("[data-action='toast']").forEach(button=>button.onclick=()=>toast(button.dataset.message));
initNavigation();
setRenderCallback(renderScreen);
showOfflineModal(offlineSnapshot);
showTutorialPrompt();
showQuestsPanel();
setupEventBusListeners();
render();
bindButtonFeedback();
window.setInterval(tickGame,1000);

function setupEventBusListeners(){
  onEvent(busEvents.MONEY_GAINED,payload=>{
    if(!payload)return;
    if(payload.x!=null&&payload.y!=null){
      floatMoney(`+${money(payload.amount||0)}`,payload.x,payload.y);
    }
  });
  onEvent(busEvents.LEVEL_UP,()=>{
    document.body.classList.add("flash-levelup");
    setTimeout(()=>document.body.classList.remove("flash-levelup"),600);
  });
  onEvent(busEvents.ACHIEVEMENT_UNLOCKED,payload=>{
    if(payload?.name)toast(`Achievement: ${payload.name}`);
  });
  onEvent(busEvents.QUEST_COMPLETED,payload=>{
    if(!payload?.count)return;
    document.body.classList.add("flash-quest");
    setTimeout(()=>document.body.classList.remove("flash-quest"),500);
  });
  onEvent(busEvents.EVENT_OPENED,()=>{
    document.body.classList.add("flash-event");
    setTimeout(()=>document.body.classList.remove("flash-event"),700);
  });
  onEvent(busEvents.APP_RESET,payload=>{
    document.body.classList.add("flash-event");
    setTimeout(()=>document.body.classList.remove("flash-event"),700);
    console.info("App reset event received.",payload||{});
  });
}
