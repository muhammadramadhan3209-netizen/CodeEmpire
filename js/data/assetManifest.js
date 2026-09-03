export const assetManifest = {
  ui:{
    button:["primary","secondary","danger","success","ghost","icon"],
    panel:["card","modal","drawer","toast","tutorial","tier"],
    badge:["tier-bronze","tier-silver","tier-gold","tier-platinum","tier-diamond","reputation","rating","streak"],
    feedback:["loading","success","warning","error","info","empty","locked"]
  },
  icons:{
    navigation:["quest","settings","career","stats","tutorial","help","close","back","more","filter"],
    action:["play","pause","claim","upgrade","unlock","refresh","share","info","check","star"],
    status:["online","offline","locked","unlocked","pending","claimed","missed","new"]
  },
  employees:{
    personality:["creative","hardWorker","lazy","riskTaker","loyal","leader","nightOwl","perfectionist"],
    role:["frontend","backend","ai","security","contractor","marketing","sales","intern"],
    mood:["happy","neutral","stressed","burnout","celebrate","thinking"]
  },
  company:{
    office:["co-working","studio","small","creative","growth","campus","tower","regional","global","empire"],
    career:["freelancer","startup","ceo","tech","global"],
    valuation:["bronze","silver","gold","platinum","diamond"]
  },
  events:{
    business:["big_client","viral_product","server_error","burnout","rival_attack","investor_interest","cash_crunch","breakthrough"],
    status:["warning","success","danger","info","opportunity"]
  },
  achievements:{
    business:["millionaire","startup_king","tycoon"],
    development:["product_master","productivity_master"],
    legit:["clean_company","pure_path"],
    shadow:["hacker_legend","legend"]
  },
  feedback:{
    particles:["coin","spark","star","burst"],
    number:["plus","minus","critical","jackpot"]
  }
};

export const assetCategories = Object.keys(assetManifest);

export function countTotalAssets(){
  return Object.values(assetManifest).reduce((sum,category)=>{
    return sum+Object.values(category).reduce((s,list)=>s+list.length,0);
  },0);
}
