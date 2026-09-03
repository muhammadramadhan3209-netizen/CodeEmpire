import { state, addMoney, addXP } from "../state.js";
import { hackJobs, hackTools } from "../data/hackJobs.js";
import {securityStaffBonus} from "./employeeSystem.js";
import {departmentEffect} from "./officeSystem.js";
import {getSkillTrainingCost,trainSkill} from "./skillSystem.js";

const MAX_HEAT = 100;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getHacker() {
  state.hacker = state.hacker || {};
  state.hacker.toolsOwned = Array.isArray(state.hacker.toolsOwned)
    ? state.hacker.toolsOwned
    : [];
  state.hacker.history = Array.isArray(state.hacker.history)
    ? state.hacker.history
    : [];
  return state.hacker;
}

function heatBandFor(heat) {
  if (heat >= 85) return 3;
  if (heat >= 60) return 2;
  if (heat >= 30) return 1;
  return 0;
}

function addHistory(entry) {
  const hacker = getHacker();
  hacker.history.push({ at: Date.now(), ...entry });
  hacker.history = hacker.history.slice(-20);
}

function effectiveHeatGain(job, multiplier = 1) {
  const hacker = getHacker();
  let reduction = securityStaffBonus() + departmentEffect("security");
  if (hacker.toolsOwned.includes("phantom_proxy")) reduction += 0.22;
  return Math.max(1, Math.round(job.heatGain * multiplier * (1 - Math.min(0.68, reduction))));
}

function currentHeatEventCosts(event = getHacker().pendingHeatEvent) {
  const critical = event?.type === "critical";
  return {
    bribe: critical ? 2600 : 1200,
    lawyer: critical ? 5200 : 2800
  };
}

function catchPlayer() {
  const hacker = getHacker();
  const protectedIdentity = hacker.toolsOwned.includes("fake_identity");
  const exposedChance = protectedIdentity ? 0.2 : 0.85;
  const exposed = Math.random() < exposedChance;
  const fine = Math.min(state.money, Math.max(500, Math.floor(state.money * 0.28)));

  state.money = Math.max(0, state.money - fine);
  hacker.darkRep = Math.max(0, Math.floor(hacker.darkRep * 0.75));
  hacker.cleanRep = Math.max(0, Math.floor(hacker.cleanRep * 0.9));
  state.reputation = Math.min(state.reputation, hacker.cleanRep);
  hacker.heat = 70;
  hacker.caught = (hacker.caught || 0) + 1;
  hacker.wanted = true;
  hacker.officeFreezeUntil = Date.now() + 60_000;
  if (exposed) hacker.identity = "exposed";
  hacker.pendingHeatEvent = {
    type: "caught",
    title: "Operasi Terbongkar",
    message: exposed
      ? "Identitas bayanganmu terungkap. Kantor dibekukan sementara dan client premium menolak bekerja sama."
      : "Operasimu tertangkap, tetapi Fake Identity Kit menjaga identitas asli tetap tersembunyi.",
    fine,
    exposed
  };
  hacker.alertBand = 3;
  addHistory({ type: "caught", label: "Tertangkap", amount: -fine });
  return hacker.pendingHeatEvent;
}

function evaluateHeatRisk({ allowCatch = true } = {}) {
  const hacker = getHacker();
  hacker.heat = clamp(Number(hacker.heat) || 0, 0, MAX_HEAT);
  const band = heatBandFor(hacker.heat);

  if (hacker.pendingHeatEvent || band <= (hacker.alertBand || 0)) return null;

  if (band === 1) {
    hacker.pendingHeatEvent = {
      type: "warning",
      title: "Email Mencurigakan",
      message: "Tim keamanan salah satu client mulai menanyakan aktivitas jaringan yang tidak biasa."
    };
    hacker.alertBand = 1;
    return hacker.pendingHeatEvent;
  }

  if (band === 2) {
    hacker.pendingHeatEvent = {
      type: "investigation",
      title: "Investigasi Cyber Unit",
      message: "Jejak digitalmu sedang diperiksa. Pilih cara untuk menurunkan risiko."
    };
    hacker.alertBand = 2;
    return hacker.pendingHeatEvent;
  }

  if (band === 3 && allowCatch) {
    const caughtChance = clamp(0.25 + (hacker.heat - 85) * 0.025, 0.25, 0.63);
    if (Math.random() < caughtChance) return catchPlayer();
  }

  hacker.pendingHeatEvent = {
    type: "critical",
    title: "Jejak Hampir Terkunci",
    message: "Otoritas hampir menghubungkan semua jejak. Tindakan darurat diperlukan."
  };
  hacker.alertBand = 3;
  return hacker.pendingHeatEvent;
}

function recordJobResult(job, reward, heatGain, path) {
  const hacker = getHacker();
  hacker.lastJobResult = {
    jobId: job.id,
    name: job.name,
    reward,
    heatGain,
    path,
    at: Date.now()
  };
  addHistory({ type: "job", label: job.name, amount: reward, path });
}

function completeShadowJob(job, { payoutMultiplier = 1, extraHeat = 0, extraDarkRep = 0 } = {}) {
  const hacker = getHacker();
  const reward = Math.floor(job.reward * (job.rewardMultiplier || 1) * payoutMultiplier);
  const heatGain = effectiveHeatGain(job, job.heatMultiplier || 1) + extraHeat;

  addMoney(reward);
  addXP(job.xp || 30);
  hacker.darkRep += job.darkRepGain + extraDarkRep;
  hacker.heat = clamp(hacker.heat + heatGain, 0, MAX_HEAT);
  recordJobResult(job, reward, heatGain, "shadow");
  const heatEvent = evaluateHeatRisk();

  return {
    ok: true,
    type: "completed",
    reward,
    heatGain,
    heatEvent,
    message: `${job.name} selesai. +$${reward.toLocaleString("en-US")} dan Heat +${heatGain}.`
  };
}

export function getHackJob(id) {
  return hackJobs.find(job => job.id === id) || null;
}

export function isHackingFrozen(at = Date.now()) {
  return at < (getHacker().freezeUntil || 0);
}

export function isOfficeFrozen(at = Date.now()) {
  return at < (getHacker().officeFreezeUntil || 0);
}

export function canAcceptHackJob(id) {
  const hacker = getHacker();
  const job = getHackJob(id);
  if (!job) return { ok: false, reason: "Job tidak ditemukan." };
  if (hacker.activeJob) return { ok: false, reason: "Selesaikan job aktif terlebih dahulu." };
  if (hacker.pendingMoralChoice) return { ok: false, reason: "Tentukan pilihan moral dari job sebelumnya." };
  if (hacker.pendingHeatEvent) return { ok: false, reason: "Selesaikan peristiwa Heat terlebih dahulu." };
  if (isHackingFrozen()) return { ok: false, reason: "Shadow Path sedang dibekukan. Tunggu sampai masa lie low selesai." };
  if ((state.skills.security || 0) < job.required.security) {
    return { ok: false, reason: `Butuh Security level ${job.required.security}.` };
  }
  return { ok: true, job };
}

export function acceptHackJob(id) {
  const check = canAcceptHackJob(id);
  if (!check.ok) return check;

  const hacker = getHacker();
  const job = check.job;
  const zeroDayUsed = (hacker.zeroDayCharges || 0) > 0;
  if (zeroDayUsed) {
    hacker.zeroDayCharges--;
    if (hacker.zeroDayCharges <= 0) {
      hacker.zeroDayCharges = 0;
      hacker.toolsOwned = hacker.toolsOwned.filter(toolId => toolId !== "zero_day");
    }
  }

  hacker.activeJob = {
    ...job,
    progress: 0,
    startedAt: Date.now(),
    minigame: zeroDayUsed ? "success" : "pending",
    rewardMultiplier: zeroDayUsed ? 1.25 : 1,
    heatMultiplier: zeroDayUsed ? 0.65 : 1,
    zeroDayUsed
  };

  return {
    ok: true,
    job: hacker.activeJob,
    guaranteed: zeroDayUsed,
    message: zeroDayUsed
      ? `${job.name} dimulai. Zero-Day Token menjamin infiltrasi.`
      : `${job.name} dimulai. Ingat pola node untuk mendapat bonus.`
  };
}

export function resolveHackMinigame(success) {
  const job = getHacker().activeJob;
  if (!job || job.minigame !== "pending") return { ok: false, reason: "Minigame sudah selesai." };

  job.minigame = success ? "success" : "failed";
  job.rewardMultiplier = success ? 1.25 : 0.85;
  job.heatMultiplier = success ? 0.65 : 1.25;
  return {
    ok: true,
    success,
    message: success
      ? "Pola cocok. Reward naik 25% dan Heat berkurang."
      : "Pola gagal. Reward turun dan Heat meningkat."
  };
}

export function tickHackJob() {
  const hacker = getHacker();
  const job = hacker.activeJob;
  if (!job) return null;

  job.progress = Math.min(100, job.progress + 100 / job.duration);
  if (job.progress < 100) return null;

  if (job.minigame === "pending") resolveHackMinigame(false);
  hacker.activeJob = null;
  hacker.completedJobs = (hacker.completedJobs || 0) + 1;

  if (job.moralChoice) {
    hacker.pendingMoralChoice = { ...job };
    return {
      ok: true,
      type: "moral",
      message: `${job.name} selesai. Tentukan apakah data dijual atau dilaporkan.`
    };
  }

  return completeShadowJob(job);
}

export function resolveMoralChoice(choice) {
  const hacker = getHacker();
  const job = hacker.pendingMoralChoice;
  if (!job) return { ok: false, reason: "Tidak ada pilihan yang menunggu." };

  hacker.pendingMoralChoice = null;
  if (choice === "shadow") {
    return completeShadowJob(job, {
      payoutMultiplier: 1.35,
      extraHeat: 3,
      extraDarkRep: 2
    });
  }

  if (choice !== "ethical") {
    hacker.pendingMoralChoice = job;
    return { ok: false, reason: "Pilihan tidak valid." };
  }

  const reward = Math.floor(job.reward * (job.rewardMultiplier || 1) * 0.72);
  const cleanGain = Math.max(4, Math.ceil(job.darkRepGain * 1.2));
  addMoney(reward);
  addXP((job.xp || 30) + 20);
  hacker.cleanRep += cleanGain;
  hacker.darkRep = Math.max(0, hacker.darkRep - Math.max(1, Math.floor(job.darkRepGain * 0.25)));
  hacker.heat = Math.max(0, hacker.heat - 8);
  state.reputation = Math.max(state.reputation, hacker.cleanRep);
  recordJobResult(job, reward, -8, "ethical");

  return {
    ok: true,
    type: "ethical",
    reward,
    message: `Celah dilaporkan secara resmi. +$${reward.toLocaleString("en-US")}, Clean Rep +${cleanGain}, Heat -8.`
  };
}

export function getHeatEventCosts() {
  return currentHeatEventCosts();
}

export function resolveHeatEvent(choice) {
  const hacker = getHacker();
  const event = hacker.pendingHeatEvent;
  if (!event) return { ok: false, reason: "Tidak ada peristiwa Heat." };

  if (event.type === "warning" || event.type === "caught") {
    hacker.pendingHeatEvent = null;
    return { ok: true, message: event.type === "caught" ? "Kasus dicatat. Turunkan Heat untuk menghapus status Wanted." : "Peringatan ditutup." };
  }

  const costs = currentHeatEventCosts(event);
  if (choice === "bribe") {
    if (state.money < costs.bribe) return { ok: false, reason: `Butuh $${costs.bribe.toLocaleString("en-US")}.` };
    state.money -= costs.bribe;
    hacker.heat = Math.max(0, hacker.heat - 18);
  } else if (choice === "lawyer") {
    if (state.money < costs.lawyer) return { ok: false, reason: `Butuh $${costs.lawyer.toLocaleString("en-US")}.` };
    state.money -= costs.lawyer;
    hacker.heat = Math.max(0, hacker.heat - 28);
    hacker.cleanRep += 2;
    state.reputation = Math.max(state.reputation, hacker.cleanRep);
  } else if (choice === "lie_low") {
    const duration = event.type === "critical" ? 150_000 : 90_000;
    hacker.freezeUntil = Date.now() + duration;
    hacker.heat = Math.max(0, hacker.heat - 10);
  } else {
    return { ok: false, reason: "Pilihan tidak valid." };
  }

  hacker.pendingHeatEvent = null;
  hacker.alertBand = heatBandFor(hacker.heat);
  return {
    ok: true,
    message: choice === "lie_low"
      ? "Kamu memilih lie low. Shadow Path dibekukan sementara."
      : `Risiko ditangani. Heat turun menjadi ${Math.floor(hacker.heat)}.`
  };
}

export function buyHackTool(id) {
  const hacker = getHacker();
  const tool = hackTools.find(item => item.id === id);
  if (!tool) return { ok: false, reason: "Tool tidak ditemukan." };
  if (!tool.consumable && hacker.toolsOwned.includes(id)) {
    return { ok: false, reason: "Tool sudah dimiliki." };
  }
  if (tool.consumable && (hacker.zeroDayCharges || 0) > 0) {
    return { ok: false, reason: "Gunakan Zero-Day Token yang masih aktif terlebih dahulu." };
  }
  if (hacker.darkRep < tool.cost) return { ok: false, reason: `Butuh ${tool.cost} Dark Rep.` };

  hacker.darkRep -= tool.cost;
  if (!hacker.toolsOwned.includes(id)) hacker.toolsOwned.push(id);
  if (tool.id === "zero_day") hacker.zeroDayCharges = 1;
  return { ok: true, tool, message: `${tool.name} dibeli.` };
}

export function getSecurityTrainingCost() {
  return getSkillTrainingCost("security");
}

export function trainSecuritySkill() {
  return trainSkill("security");
}

export function tickHeat() {
  const hacker = getHacker();
  let message = null;
  const now = Date.now();

  if (!hacker.activeJob && hacker.heat > 0) {
    let decay = 0.12;
    if (hacker.toolsOwned.includes("cipher_kit")) decay += 0.18;
    if (isHackingFrozen(now)) decay += 0.35;
    hacker.heat = Math.max(0, hacker.heat - decay);
  }

  if (hacker.officeFreezeUntil && now >= hacker.officeFreezeUntil) {
    hacker.officeFreezeUntil = 0;
    message = "Pembekuan kantor berakhir. Passive income kembali aktif.";
  }
  if (hacker.freezeUntil && now >= hacker.freezeUntil) {
    hacker.freezeUntil = 0;
    message = "Masa lie low selesai. Shadow Path aktif kembali.";
  }
  if (hacker.wanted && hacker.heat < 50) {
    hacker.wanted = false;
    message = "Status Wanted dicabut. Client premium kembali terbuka.";
  }
  if (hacker.identity === "exposed" && hacker.heat < 20 && hacker.cleanRep >= hacker.darkRep + 25) {
    hacker.identity = "hidden";
    message = "Redemption berhasil. Identitas asli kembali terlindungi.";
  }

  const currentBand = heatBandFor(hacker.heat);
  if (!hacker.pendingHeatEvent && currentBand < (hacker.alertBand || 0)) {
    hacker.alertBand = currentBand;
  }
  if (!hacker.pendingHeatEvent && currentBand > (hacker.alertBand || 0)) {
    const event = evaluateHeatRisk({ allowCatch: false });
    if (event) message = event.message;
  }

  return message ? { type: "status", message } : null;
}

export function getHeatBand() {
  const heat = getHacker().heat;
  if (heat >= 85) return { key: "critical", label: "KRITIS" };
  if (heat >= 60) return { key: "high", label: "TINGGI" };
  if (heat >= 30) return { key: "medium", label: "WASPADA" };
  return { key: "low", label: "AMAN" };
}

export function getAlignment() {
  const hacker = getHacker();
  const difference = hacker.darkRep - hacker.cleanRep;
  if (difference >= 15) return { key: "dark", label: "Ghost Operator" };
  if (difference <= -15) return { key: "clean", label: "Cyber Guardian" };
  return { key: "grey", label: "Grey Architect" };
}
