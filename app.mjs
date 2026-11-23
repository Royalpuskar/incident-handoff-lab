import {scenario} from './scenario.mjs';
import {evaluate} from './engine.mjs';
import {createHandoff} from './handoff.mjs';
const $=id=>document.getElementById(id);
const choices={observation:'Observation',hypothesis:'Hypothesis',confirmed:'Confirmed evidence'};
const inputs=[];
for(const item of scenario){
  const field=document.createElement('fieldset'),legend=document.createElement('legend'),p=document.createElement('p');
  legend.textContent=item.time+' / '+item.id;p.textContent=item.text;field.append(legend,p);
  for(const [value,title] of Object.entries(choices)){
    const label=document.createElement('label'),input=document.createElement('input');
    input.type='radio';input.name=item.id;input.value=value;inputs.push(input);
    input.addEventListener('change',clear);label.append(input,document.createTextNode(title));field.append(label);
  }
  $('timeline').append(field);
}
function clear(){$('summary').textContent='Awaiting your handoff.';$('feedback').replaceChildren();}
$('evaluate').onclick=()=>{
  const result=evaluate(Object.fromEntries(inputs.filter(i=>i.checked).map(i=>[i.name,i.value])));
  $('summary').textContent=result.score+'/100 · '+result.handoff+' · '+result.incorrect+' incorrect · '+result.overclaims+' overclaims · '+result.unanswered+' unanswered';
  $('feedback').replaceChildren(...result.rows.map(row=>{
    const p=document.createElement('p');
    p.textContent=row.time+' — '+(row.correct?'Correct':row.overclaim?'Unsupported confirmation':'Review classification')+'. Expected: '+choices[row.expected]+'. Your answer: '+(choices[row.selected]||'None')+'.';
    return p;
  }));
};
$('reset').onclick=()=>{for(const i of inputs)i.checked=false;clear();};

// Export is intentionally available only after a review, so the report matches the visible results.
const exportButton=document.createElement('button');
exportButton.type='button';
exportButton.textContent='Download training handoff';
exportButton.disabled=true;
exportButton.setAttribute('aria-label','Download synthetic training handoff as Markdown');
$('evaluate').insertAdjacentElement('afterend',exportButton);
let reviewedAnswers=null;
function captureAnswers(){return Object.fromEntries(inputs.filter(i=>i.checked).map(i=>[i.name,i.value]));}
$('evaluate').addEventListener('click',()=>{reviewedAnswers=captureAnswers();exportButton.disabled=false;});
$('reset').addEventListener('click',()=>{reviewedAnswers=null;exportButton.disabled=true;});
for(const input of inputs)input.addEventListener('change',()=>{reviewedAnswers=null;exportButton.disabled=true;});
exportButton.addEventListener('click',()=>{
  if(!reviewedAnswers)return;
  const text=createHandoff(reviewedAnswers);
  const blob=new Blob([text],{type:'text/markdown;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download='synthetic-incident-handoff.md';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
});
