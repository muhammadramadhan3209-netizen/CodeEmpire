import { state, addMoney, addXP } from "./state.js";
import {registerProgress} from "./systems/questSystem.js";
import {completeCurrentStepByAction,tickTutorial} from "./systems/tutorialSystem.js";

export const projectDefs = {
  calculator:{name:"Calculator App", icon:"🧮", unlock:1, duration:20, reward:100, income:5},
  todo:{name:"To-Do App", icon:"✅", unlock:3, duration:35, reward:350, income:15},
  chat:{name:"Chat App", icon:"💬", unlock:5, duration:60, reward:800, income:35}
};

export function canStart(id){
  const p=projectDefs[id], s=state.projects[id];
  return p && state.level>=p.unlock && !s.active && !s.completed;
}

export function startProject(id){
  if(!canStart(id)) return false;
  state.projects[id].active=true;
  completeCurrentStepByAction("project");
  return true;
}

export function tickProjects(){
  const completed=[];
  Object.entries(projectDefs).forEach(([id,p])=>{
    const s=state.projects[id];
    if(s.active && !s.completed){
      s.progress += 100 / p.duration;
      if(s.progress >= 100){
        s.progress=100;
        s.active=false;
        s.completed=true;
        addMoney(p.reward);
        addXP(50);
        state.moneyPerSecond+=p.income;
        state.stats.projectsCompleted=(state.stats.projectsCompleted||0)+1;
        registerProgress("projects",1);
        completed.push({id,...p});
      }
    }
  });
  return completed;
}
