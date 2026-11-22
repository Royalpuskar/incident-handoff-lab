import {scenario} from './scenario.mjs';
import {evaluate,buildHandoff} from './engine.mjs';
const $=id=>document.getElementById(id);
const choices={observation:'Observation',hypothesis:'Hypothesis',confirmed:'Confirmed evidence'};
const inputs=[];
let report=null;
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
function clear(){report=null;$('download').disabled=true;$('summary').textContent='Awaiting your handoff.';$('feedback').replaceChildren();}
$('evaluate').onclick=()=>{
  const answers=Object.fromEntries(inputs.filter(i=>i.checked).map(i=>[i.name,i.value]));
  const result=evaluate(answers);
  report=buildHandoff(answers);$('download').disabled=false;
  $('summary').textContent=result.score+'/100 · '+result.handoff+' · '+result.incorrect+' incorrect · '+result.overclaims+' overclaims · '+result.unanswered+' unanswered';
  $('feedback').replaceChildren(...result.rows.map(row=>{
    const p=document.createElement('p');
    p.textContent=row.time+' — '+(row.correct?'Correct':row.overclaim?'Unsupported confirmation':'Review classification')+'. Expected: '+choices[row.expected]+'. Your answer: '+(choices[row.selected]||'None')+'.';
    return p;
  }));
};
$('reset').onclick=()=>{for(const i of inputs)i.checked=false;clear();};

$('download').onclick=()=>{
  if(!report)return;
  const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)+'\n'],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='synthetic-handoff.json';
  document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
};
