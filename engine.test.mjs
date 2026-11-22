import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluate,buildHandoff} from './engine.mjs';
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

test('exhaustive classification states cannot falsely complete practice',()=>{
  const options=[null,'observation','hypothesis','confirmed'];
  const states=options.length**scenario.length;
  let completed=0;
  for(let n=0;n<states;n++){
    let code=n, correct=0, overclaims=0, unanswered=0;
    const answers=Object.create(null);
    for(const item of scenario){
      const selection=options[code%options.length];code=Math.floor(code/options.length);
      if(selection===null){unanswered++;continue;}
      answers[item.id]=selection;
      if(selection===item.classification)correct++;
      else if(selection==='confirmed')overclaims++;
    }
    const result=evaluate(answers);
    assert.equal(result.correct,correct);
    assert.equal(result.overclaims,overclaims);
    assert.equal(result.unanswered,unanswered);
    assert.equal(result.incorrect,scenario.length-correct-unanswered);
    assert.equal(result.score,Math.max(0,correct*20-overclaims*10));
    assert.equal(result.handoff,correct===scenario.length?'PRACTICE COMPLETE':'REVIEW REQUIRED');
    if(result.handoff==='PRACTICE COMPLETE')completed++;
  }
  assert.equal(completed,1);
  assert.equal(states,1024);
});

test('export preserves fictional evidence, uncertainty and unanswered records',()=>{
  const answers={e1:'confirmed',e2:'hypothesis'};
  const report=buildHandoff(answers);
  assert.equal(report.status,'REVIEW REQUIRED');
  assert.equal(report.scope,'SYNTHETIC TRAINING ONLY');
  assert.deepEqual(report.counts,{correct:1,incorrect:1,overclaims:1,unanswered:3});
  assert.equal(report.records[0].unsupportedConfirmation,true);
  assert.equal(report.records[0].learnerClassification,'confirmed');
  assert.equal(report.records[0].referenceClassification,'observation');
  assert.equal(report.records[2].learnerClassification,null);
  assert.equal(report.records[2].reviewRequired,true);
  assert.equal(report.records[0].fictionalEvidence,scenario[0].text);
  assert.deepEqual(answers,{e1:'confirmed',e2:'hypothesis'});
  assert.deepEqual(JSON.parse(JSON.stringify(report)),report);
});
test('export never certifies readiness and rejects invalid answers',()=>{
  const report=buildHandoff(Object.fromEntries(scenario.map(e=>[e.id,e.classification])));
  assert.equal(report.status,'PRACTICE COMPLETE');assert.equal(report.score,100);
  assert.ok(report.records.every(r=>!r.reviewRequired));
  assert.match(report.limitation,/Not an incident report/);
  assert.throws(()=>buildHandoff({e1:'unknown'}));
});

test('DOM harness: review enables export; editing and reset invalidate it',async t=>{
  class Element {
    constructor(tag){this.tag=tag;this.children=[];this.listeners={};this.disabled=false;this.checked=false;}
    append(...children){for(const child of children){this.children.push(child);if(child instanceof Element)child.parent=this;}}
    replaceChildren(...children){this.children=[];this.append(...children);}
    addEventListener(type,handler){this.listeners[type]=handler;}
    remove(){if(this.parent)this.parent.children=this.parent.children.filter(child=>child!==this);}
    click(){if(this.tag==='a'){downloads.push({href:this.href,name:this.download});return;}if(!this.disabled)this.onclick?.();}
  }
  const downloads=[], controls=Object.fromEntries(['timeline','summary','feedback','evaluate','reset','download'].map(id=>[id,new Element(id)]));
  controls.download.disabled=true;
  const doc={body:new Element('body'),getElementById:id=>controls[id],createElement:tag=>new Element(tag),createTextNode:value=>value};
  const old=globalThis.document;
  globalThis.document=doc;
  t.after(()=>{if(old===undefined)delete globalThis.document;else globalThis.document=old;});
  let blob;
  t.mock.method(URL,'createObjectURL',value=>{blob=value;return 'blob:synthetic-test';});
  t.mock.method(URL,'revokeObjectURL',()=>{});
  await import('./app.mjs');
  const radios=controls.timeline.children.flatMap(field=>field.children.filter(el=>el.tag==='label').map(label=>label.children[0]));
  assert.equal(radios.length,15);
  controls.download.click();assert.equal(downloads.length,0);
  const first=radios.find(r=>r.name==='e1'&&r.value==='confirmed');
  first.checked=true;first.listeners.change();
  controls.evaluate.click();
  assert.match(controls.summary.textContent,/REVIEW REQUIRED/);
  assert.equal(controls.download.disabled,false);
  controls.download.click();
  assert.equal(downloads[0].name,'synthetic-handoff.json');
  const result=JSON.parse(await blob.text());
  assert.equal(result.scope,'SYNTHETIC TRAINING ONLY');
  assert.equal(result.records[0].unsupportedConfirmation,true);
  first.checked=false;first.listeners.change();
  assert.equal(controls.download.disabled,true);
  assert.equal(controls.feedback.children.length,0);
  // Direct invocation must also fail closed; disabled UI is not the only guard.
  controls.download.onclick();assert.equal(downloads.length,1);
  controls.evaluate.click();assert.equal(controls.download.disabled,false);
  controls.reset.click();assert.equal(controls.download.disabled,true);
  assert.ok(radios.every(r=>!r.checked));controls.download.onclick();
  assert.equal(downloads.length,1);
});
