export const careerTiers = [
  {
    id:"freelancer",
    label:"Freelancer",
    minLevel:1,
    minReputation:0,
    description:"Kerja sendiri, cari client kecil dari kopi tetangga.",
    unlockStory:"Kamu memulai dari kamar kos dengan satu laptop. Setiap tap adalah kopi yang harus diminum sebelum deadline.",
    bonuses:{clientSlots:1,productSlots:0,investorChance:0,productQualityCap:60,globalMultiplier:1}
  },
  {
    id:"startup",
    label:"Startup Founder",
    minLevel:5,
    minReputation:15,
    description:"Bangun tim pertama, rilis produk pertama, bertemu mentor.",
    unlockStory:"Setelah beberapa delivery sukses, kamu merekrut teman-teman pertama. Mulai berani pitching ke angel investor lokal.",
    bonuses:{clientSlots:2,productSlots:1,investorChance:.15,productQualityCap:70,globalMultiplier:1.05}
  },
  {
    id:"ceo",
    label:"CEO",
    minLevel:12,
    minReputation:35,
    description:"Kelola department, ambil investor strategis, ekspansi produk.",
    unlockStory:"Namamu mulai dikenal di komunitas tech. Kamu memimpin rapat, menandatangani term sheet, dan melatih CTO pertama.",
    bonuses:{clientSlots:3,productSlots:2,investorChance:.3,productQualityCap:80,globalMultiplier:1.12}
  },
  {
    id:"techCompany",
    label:"Tech Company",
    minLevel:22,
    minReputation:60,
    description:"Ekspansi multi-kategori produk, kantor regional, dan hiring masif.",
    unlockStory:"Kamu membuka kantor kedua, masuk radar media, dan mulai diliput sebagai founder sukses. Kompetitor menyebut namamu.",
    bonuses:{clientSlots:4,productSlots:3,investorChance:.5,productQualityCap:90,globalMultiplier:1.2}
  },
  {
    id:"globalCorporation",
    label:"Global Corporation",
    minLevel:35,
    minReputation:85,
    description:"Dominasi global, premium investor mengalir, dan warisan industri.",
    unlockStory:"Namamu synonymous dengan industri. Produkmu dipakai jutaan orang. Kamu menulis memo untuk tim global dari rooftop di tiga negara.",
    bonuses:{clientSlots:5,productSlots:4,investorChance:.75,productQualityCap:100,globalMultiplier:1.3}
  }
];

export const careerTierIds = careerTiers.map(tier=>tier.id);

export function getCareerTier(level=0,reputation=0){
  let current=careerTiers[0];
  for(const tier of careerTiers){
    if(level>=tier.minLevel&&reputation>=tier.minReputation)current=tier;
  }
  return current;
}

export function getNextCareerTier(level=0,reputation=0){
  for(const tier of careerTiers){
    if(level<tier.minLevel||reputation<tier.minReputation)return tier;
  }
  return null;
}

export function getCareerTierById(id){
  return careerTiers.find(tier=>tier.id===id)||careerTiers[0];
}

export function getUnlockRequirements(tierId){
  const tier=getCareerTierById(tierId);
  return {
    level:tier.minLevel,
    reputation:tier.minReputation,
    description:tier.unlockStory
  };
}
