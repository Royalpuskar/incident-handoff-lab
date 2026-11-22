import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluate} from './engine.mjs';
import {scenario} from './scenario.mjs';
test('perfect classification scores 100',()=>{
  const result=evaluate(Object.fromEntries(scenario.map(e=>[e.id,e.classification])));
  assert.equal(result.score,100);assert.equal(result.handoff,'PRACTICE COMPLETE');
});
test('overclaim penalty prevents practice completion',()=>{
  const result=evaluate(Object.fromEntries(scenario.map(e=>[e.id,'confirmed'])));
  assert.equal(result.overclaims,4);assert.equal(result.score,0);assert.equal(result.handoff,'REVIEW REQUIRED');
});
test('missing evidence is never scored as correct',()=>{
  const result=evaluate({});assert.equal(result.unanswered,5);assert.equal(result.score,0);assert.equal(result.handoff,'REVIEW REQUIRED');
});
test('reject unknown evidence and categories',()=>{
  assert.throws(()=>evaluate({unknown:'confirmed'}));assert.throws(()=>evaluate({e1:'maybe'}));assert.throws(()=>evaluate(null));
});
test('inherited answers are ignored',()=>{
  assert.equal(evaluate(Object.create({e1:'observation'})).unanswered,5);
});

test('completed but incorrect low-confidence classifications require review',()=>{
  const result=evaluate(Object.fromEntries(scenario.map(e=>[e.id,'observation'])));
  assert.equal(result.unanswered,0);assert.equal(result.overclaims,0);assert.equal(result.incorrect,3);
  assert.equal(result.score,40);assert.equal(result.handoff,'REVIEW REQUIRED');
});
test('one mistaken classification cannot complete practice',()=>{
  const answers=Object.fromEntries(scenario.map(e=>[e.id,e.classification]));
  answers.e3='hypothesis';const result=evaluate(answers);
  assert.equal(result.score,80);assert.equal(result.incorrect,1);assert.equal(result.handoff,'REVIEW REQUIRED');
});
