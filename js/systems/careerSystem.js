import {state} from "../state.js";
import {getCareerTier,getNextCareerTier} from "../data/careerTiers.js";

const legitTitles=[[35,"Founder"],[25,"CTO"],[16,"Tech Lead"],[9,"Senior Developer"],[1,"Junior Developer"]];
const hackerTitles=[[35,"Digital Phantom"],[25,"Ghost Operator"],[16,"Black Hat Architect"],[9,"Shadow Specialist"],[1,"Script Coder"]];
const greyTitles=[[25,"Duality Master"],[14,"Grey Architect"],[1,"Grey Hat Developer"]];

function titleFor(list){return list.find(([level])=>state.level>=level)?.[1]||list.at(-1)[1];}

export function updateCareerTitle(){
  const difference=state.hacker.darkRep-state.hacker.cleanRep;
  const track=difference>=10?"hacker":difference<=-10?"legit":"grey";
  const title=track==="hacker"?titleFor(hackerTitles):track==="legit"?titleFor(legitTitles):titleFor(greyTitles);
  const tier=getCareerTier(state.level,state.reputation);
  const previousTierId=state.career.tierId||"freelancer";
  const tierChanged=previousTierId!==tier.id;
  state.career={title,track,tierId:tier.id};
  let message=null;
  if(tierChanged){
    message=`Perusahaan naik tier ke ${tier.label}. Bonus baru terbuka: ${Object.keys(tier.bonuses).join(", ")}.`;
  }else if(state.career.title!==title){
    message=`Career title berubah menjadi ${title}.`;
  }
  return {
    changed:tierChanged||state.career.title!==title,
    title,
    track,
    tierId:tier.id,
    message
  };
}

export function getRank(level=state.level){
  const currentLevel=state.level;
  state.level=level;
  const title=updateCareerTitle().title;
  state.level=currentLevel;
  updateCareerTitle();
  return title;
}

export function getCurrentCareerTier(){return getCareerTier(state.level,state.reputation);}
export function getNextCareerTierInfo(){return getNextCareerTier(state.level,state.reputation);}

export function applyCareerBonusesToMoney(money){
  const tier=getCurrentCareerTier();
  return Math.floor(money*tier.bonuses.globalMultiplier);
}
