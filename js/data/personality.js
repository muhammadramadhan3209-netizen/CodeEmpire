export const personalityDefs = {
  creative:{
    id:"creative",
    label:"Creative",
    description:"+10% product innovation. Lebih mudah viral.",
    effects:{innovation:.1,innovationTrigger:.15}
  },
  hardWorker:{
    id:"hardWorker",
    label:"Hard Worker",
    description:"+15% produktivitas department. Training lebih cepat.",
    effects:{productivity:.15,trainingSpeed:.12}
  },
  lazy:{
    id:"lazy",
    label:"Lazy",
    description:"-12% produktivitas. Morale turun perlahan.",
    effects:{productivity:-.12,moraleDecay:.6}
  },
  riskTaker:{
    id:"riskTaker",
    label:"Risk Taker",
    description:"+20% reward hack job, +25% risiko tertangkap.",
    effects:{hackReward:1.2,hackHeat:1.25}
  },
  loyal:{
    id:"loyal",
    label:"Loyal",
    description:"Morale turun lebih lambat. Tahan saat payroll telat.",
    effects:{moraleDecay:.4,payrollResistance:.35}
  },
  leader:{
    id:"leader",
    label:"Leader",
    description:"+8% morale tim di department yang sama.",
    effects:{moraleAura:.08}
  },
  nightOwl:{
    id:"nightOwl",
    label:"Night Owl",
    description:"+10% passive income saat offline.",
    effects:{offlineBonus:.1}
  },
  perfectionist:{
    id:"perfectionist",
    label:"Perfectionist",
    description:"+0.4 rating rata-rata client. Training lebih mahal.",
    effects:{clientRating:.4,trainingCost:1.15}
  }
};

export const personalityIds = Object.keys(personalityDefs);

export const personalityWeights = {
  creative:14,hardWorker:18,lazy:8,riskTaker:6,
  loyal:18,leader:10,nightOwl:12,perfectionist:14
};

export function pickRandomPersonality(rng=Math.random){
  const total=Object.values(personalityWeights).reduce((sum,weight)=>sum+weight,0);
  let pick=rng()*total;
  for(const id of personalityIds){
    pick-=personalityWeights[id];
    if(pick<=0)return id;
  }
  return personalityIds[0];
}

export function getPersonality(id){
  return personalityDefs[id]||personalityDefs.loyal;
}
