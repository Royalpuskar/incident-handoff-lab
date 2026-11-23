import {scenario} from './scenario.mjs';
import {evaluate} from './engine.mjs';

/**
 * Produce a deterministic, human-readable handoff from synthetic exercise answers.
 * This is training material, not an incident-response report.
 */
export function createHandoff(answers) {
  const result=evaluate(answers);
  const evidence=new Map(scenario.map(item=>[item.id,item]));
  const lines=[
    '# Incident Handoff Lab — Training Brief',
    '',
    'SIMULATED EXERCISE ONLY — no real incident evidence',
    '',
    'Status: '+result.handoff,
    'Score: '+result.score+'/100',
    'Correct: '+result.correct+'; Unanswered: '+result.unanswered+
      '; Incorrect: '+result.incorrect+'; Unsupported confirmations: '+result.overclaims,
    '',
    '## Evidence review',
    ''
  ];
  for(const row of result.rows){
    const record=evidence.get(row.id);
    lines.push('### '+row.id+' — '+record.time);
    lines.push('Classification: '+(row.selected??'unanswered'));
    lines.push('Reference classification: '+row.expected);
    lines.push('Assessment: '+(row.correct?'correct':row.overclaim?'unsupported confirmation':'review required'));
    lines.push('');
  }
  lines.push('## Next shift');
  lines.push(result.handoff==='PRACTICE COMPLETE'
    ? 'All synthetic classifications match the training reference. Explain the evidence boundary before closing the exercise.'
    : 'Review each incorrect or missing classification; do not promote a hypothesis to confirmed evidence.');
  lines.push('');
  lines.push('This document is generated for a fictional educational scenario.');
  return lines.join('\n');
}
