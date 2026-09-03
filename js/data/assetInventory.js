export const assetInventory = {
  ui:[
    {key:"quest",status:"pending",path:"assets/ui/ui-quest.svg"},
    {key:"career",status:"pending",path:"assets/ui/ui-career.svg"},
    {key:"tier",status:"pending",path:"assets/ui/ui-tier.svg"},
    {key:"reputation",status:"pending",path:"assets/ui/ui-reputation.svg"},
    {key:"info",status:"pending",path:"assets/ui/ui-info.svg"},
    {key:"success",status:"pending",path:"assets/ui/ui-success.svg"},
    {key:"warning",status:"pending",path:"assets/ui/ui-warning.svg"},
    {key:"error",status:"pending",path:"assets/ui/ui-error.svg"},
    {key:"check",status:"pending",path:"assets/ui/ui-check.svg"},
    {key:"star",status:"pending",path:"assets/ui/ui-star.svg"},
    {key:"close",status:"pending",path:"assets/ui/ui-close.svg"},
    {key:"back",status:"pending",path:"assets/ui/ui-back.svg"},
    {key:"refresh",status:"pending",path:"assets/ui/ui-refresh.svg"},
    {key:"claim",status:"pending",path:"assets/ui/ui-claim.svg"},
    {key:"locked",status:"pending",path:"assets/ui/ui-locked.svg"},
    {key:"unlocked",status:"pending",path:"assets/ui/ui-unlocked.svg"},
    {key:"play",status:"pending",path:"assets/ui/ui-play.svg"},
    {key:"pause",status:"pending",path:"assets/ui/ui-pause.svg"}
  ],
  personality:[
    {key:"creative",status:"pending",path:"assets/personality/personality-creative.svg"},
    {key:"hardWorker",status:"pending",path:"assets/personality/personality-hardWorker.svg"},
    {key:"lazy",status:"pending",path:"assets/personality/personality-lazy.svg"},
    {key:"riskTaker",status:"pending",path:"assets/personality/personality-riskTaker.svg"},
    {key:"loyal",status:"pending",path:"assets/personality/personality-loyal.svg"},
    {key:"leader",status:"pending",path:"assets/personality/personality-leader.svg"},
    {key:"nightOwl",status:"pending",path:"assets/personality/personality-nightOwl.svg"},
    {key:"perfectionist",status:"pending",path:"assets/personality/personality-perfectionist.svg"}
  ],
  tier:[
    {key:"freelancer",status:"pending",path:"assets/tier/tier-freelancer.svg"},
    {key:"startup",status:"pending",path:"assets/tier/tier-startup.svg"},
    {key:"ceo",status:"pending",path:"assets/tier/tier-ceo.svg"},
    {key:"techCompany",status:"pending",path:"assets/tier/tier-techCompany.svg"},
    {key:"globalCorporation",status:"pending",path:"assets/tier/tier-globalCorporation.svg"}
  ]
};

export const FALLBACK_PATH = "assets/ui-unknown.svg";

export function updateInventoryStatus(availablePaths){
  if(!availablePaths||typeof availablePaths.forEach!=="function")return;
  const set=new Set(availablePaths);
  Object.values(assetInventory).forEach(list=>{
    list.forEach(item=>{
      item.status=set.has(item.path)?"available":"missing";
    });
  });
}

export function getInventoryReport(){
  const totals={available:0,missing:0};
  Object.values(assetInventory).forEach(list=>{
    list.forEach(item=>{
      if(item.status==="available")totals.available++;
      else totals.missing++;
    });
  });
  return {...totals,total:totals.available+totals.missing};
}

export function listMissingByCategory(){
  const result={};
  Object.entries(assetInventory).forEach(([category,list])=>{
    result[category]=list.filter(item=>item.status!=="available").map(item=>item.key);
  });
  return result;
}
