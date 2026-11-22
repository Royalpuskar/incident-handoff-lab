import {scenario} from './scenario.mjs';
const categories=new Set(['observation','hypothesis','confirmed']);
export function evaluate(answers){
  if(!answers || typeof answers!=='object' || Array.isArray(answers)) throw new TypeError('Answers must be an object');
  const ids=new Set(scenario.map(e=>e.id));
  for(const [id,value] of Object.entries(answers)){
    if(!ids.has(id)||!categories.has(value)) throw new Error('Invalid evidence answer: '+id);
  }
  const rows=scenario.map(e=>{
    const selected=Object.hasOwn(answers,e.id)?answers[e.id]:null;
    const correct=selected===e.classification;
    const overclaim=selected==='confirmed'&&e.classification!=='confirmed';
    return {id:e.id,time:e.time,selected,expected:e.classification,correct,overclaim};
  });
  const correct=rows.filter(r=>r.correct).length;
  const overclaims=rows.filter(r=>r.overclaim).length;
  const unanswered=rows.filter(r=>r.selected===null).length;
  const incorrect=rows.filter(r=>r.selected!==null&&!r.correct).length;
  return {score:Math.max(0,correct*20-overclaims*10),correct,overclaims,unanswered,incorrect,
    handoff:unanswered||incorrect?'REVIEW REQUIRED':'PRACTICE COMPLETE',rows};
}
