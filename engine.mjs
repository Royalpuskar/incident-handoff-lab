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

/** Export fictional training evidence, not an operational incident report. */
export function buildHandoff(answers){
  const result=evaluate(answers);
  return {
    schemaVersion:1,scenarioId:'shift-01',scope:'SYNTHETIC TRAINING ONLY',
    status:result.handoff,score:result.score,
    counts:{correct:result.correct,incorrect:result.incorrect,overclaims:result.overclaims,unanswered:result.unanswered},
    records:result.rows.map((row,index)=>({
      evidenceId:row.id,time:row.time,fictionalEvidence:scenario[index].text,
      learnerClassification:row.selected,referenceClassification:row.expected,
      reviewRequired:!row.correct,unsupportedConfirmation:row.overclaim
    })),
    nextStep:result.handoff==='PRACTICE COMPLETE'?'Review the fictional scenario with your instructor.':'Revisit incorrect or missing classifications before completing this exercise.',
    limitation:'Not an incident report, authorization, or professional readiness certification.'
  };
}
