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
