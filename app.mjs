import {scenario} from './scenario.mjs';
import {evaluate} from './engine.mjs';
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
  $('summary').textContent=result.score+'/100 · '+result.handoff+' · '+result.overclaims+' overclaims · '+result.unanswered+' unanswered';
  $('feedback').replaceChildren(...result.rows.map(row=>{
    const p=document.createElement('p');
    p.textContent=row.time+' — '+(row.correct?'Correct':row.overclaim?'Unsupported confirmation':'Review classification')+'. Expected: '+choices[row.expected]+'. Your answer: '+(choices[row.selected]||'None')+'.';
    return p;
  }));
};
$('reset').onclick=()=>{for(const i of inputs)i.checked=false;clear();};
