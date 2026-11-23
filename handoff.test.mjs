import test from 'node:test';
import assert from 'node:assert/strict';
import {scenario} from './scenario.mjs';
import {createHandoff} from './handoff.mjs';

test('complete exercise generates complete training brief',()=>{
  const answers=Object.fromEntries(scenario.map(item=>[item.id,item.classification]));
  const brief=createHandoff(answers);
  assert.match(brief,/PRACTICE COMPLETE/);
  assert.match(brief,/Score: 100\/100/);
  assert.match(brief,/SIMULATED EXERCISE ONLY/);
  for(const item of scenario) assert.ok(brief.includes(item.id+' — '+item.time));
});

test('incomplete handoff explicitly requires review',()=>{
  const brief=createHandoff({});
  assert.match(brief,/REVIEW REQUIRED/);
  assert.match(brief,/Unanswered: 5/);
  assert.match(brief,/do not promote a hypothesis/);
});

test('invalid answer rejected consistently with scoring engine',()=>{
  assert.throws(()=>createHandoff({unknown:'confirmed'}),/Invalid evidence answer/);
});
