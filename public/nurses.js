(()=>{
'use strict';
const $=id=>document.getElementById(id);
const btn=$('nursesBtn'),dlg=$('nursesDialog'),list=$('nursesList'),input=$('newNurse'),add=$('addNurseBtn'),close=$('closeNursesBtn');
if(!btn||!dlg||!list||!input||!add||!close)return;
const get=()=>{try{let a=JSON.parse(localStorage.getItem('eeg.nurses')||'[]');return Array.isArray(a)?a:[]}catch{return[]}};
const save=a=>localStorage.setItem('eeg.nurses',JSON.stringify([...new Set(a.map(x=>String(x).trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ru'))));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function redraw(){
 const a=get();
 list.innerHTML=a.length?a.map((n,i)=>'<div class="nurseRow"><input data-edit="'+i+'" value="'+esc(n)+'"><button type="button" data-del="'+i+'" title="Удалить">×</button></div>').join(''):'<p class="emptyNurses">Список пока пуст</p>';
 list.querySelectorAll('[data-edit]').forEach(el=>el.addEventListener('change',()=>{
   let a=get(),i=Number(el.dataset.edit),old=a[i],nw=el.value.trim();if(!nw){el.value=old;return}
   let changes=[];for(let j=0;j<localStorage.length;j++){let k=localStorage.key(j);if(k&&k.startsWith('n:')&&localStorage.getItem(k)===old){localStorage.setItem(k,nw);let m=k.match(/^n:(\d{4}-\d{2}-\d{2})(d|n)$/);if(m)changes.push([m[1],m[2],nw])}}a[i]=nw;save(a);Promise.all(changes.map(x=>window.googleSaveNurse?.(...x))).finally(()=>{redraw();window.dispatchEvent(new Event('nurses-changed'))});
 }));
 list.querySelectorAll('[data-del]').forEach(el=>el.addEventListener('click',()=>{
   let a=get(),i=Number(el.dataset.del),n=a[i];if(!confirm('Удалить «'+n+'» из справочника и из всех назначений в расписании?'))return;let changes=[];for(let j=localStorage.length-1;j>=0;j--){let k=localStorage.key(j);if(k&&k.startsWith('n:')&&localStorage.getItem(k)===n){let m=k.match(/^n:(\d{4}-\d{2}-\d{2})(d|n)$/);localStorage.removeItem(k);if(m)changes.push([m[1],m[2],''])}}a.splice(i,1);save(a);Promise.all(changes.map(x=>window.googleSaveNurse?.(...x))).finally(()=>{redraw();window.dispatchEvent(new Event('nurses-changed'))});
 }));
}
btn.addEventListener('click',()=>{redraw();dlg.showModal()});
add.addEventListener('click',()=>{let n=input.value.trim();if(!n)return;save(get().concat(n));input.value='';redraw();window.dispatchEvent(new Event('nurses-changed'))});
input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();add.click()}});
close.addEventListener('click',()=>dlg.close());
})();