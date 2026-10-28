/* All translations are bundled locally. User input and private journal text are not translated. */
(()=>{'use strict';
const allowed=new Set(['en','zh']);let language='en';
try{const requested=new URLSearchParams(location.search).get('lang'),saved=localStorage.getItem('ted-language');language=allowed.has(requested)?requested:allowed.has(saved)?saved:'en';if(allowed.has(requested))localStorage.setItem('ted-language',language)}catch{}
document.documentElement.lang=language==='zh'?'zh-CN':'en';
document.documentElement.dataset.language=language;
const dictionary=window.TED_TRANSLATIONS||{},normalize=s=>s.replace(/\s+/g,' ').trim(),cache=new Map(),reverse={};for(const entry of Object.values(dictionary)){if(entry.en&&entry.zh)reverse[normalize(entry.en)]=entry}
const escapeReg=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const keys=Object.keys(dictionary).filter(s=>s.length>=2&&/[\u3400-\u9fff]/.test(s)).sort((a,b)=>b.length-a.length);
const fragments=keys.length?new RegExp(keys.map(escapeReg).join('|'),'g'):null;
function t(value){const raw=String(value??''),key=normalize(raw);if(!key)return raw;if(cache.has(raw))return cache.get(raw);let translated=(dictionary[key]||reverse[key])?.[language];
 if(!translated&&language==='en'){
  const patterns=[[/^(\d+) 条$/,'$1 items'],[/^(\d+) 篇$/,'$1 articles'],[/^(\d+) 个视频$/,'$1 videos'],[/^(\d+) 个步骤 · 已手动核对 (\d+)\/(\d+) 步$/,'$1 steps · $2/$3 manually checked'],[/^待补 (\d+) 项输入$/,'$1 inputs missing'],[/^已手动核对 (\d+)\/(\d+) 步$/,'$1/$2 manually checked']];
  for(const [pattern,replacement]of patterns)if(pattern.test(key)){translated=key.replace(pattern,replacement);break}
  if(!translated&&fragments)translated=key.replace(fragments,part=>dictionary[part]?.en||part);
 }
 const result=translated&&translated!==key?raw.replace(raw.trim(),translated):raw;cache.set(raw,result);return result;
}
function matches(value,query){const raw=String(value??'');let values=[];try{const obj=JSON.parse(raw);const visit=o=>{if(typeof o==='string')values.push(o,t(o));else if(Array.isArray(o))o.forEach(visit);else if(o&&typeof o==='object')Object.values(o).forEach(visit)};visit(obj)}catch{values=[raw,t(raw)]}return values.join(' ').toLocaleLowerCase().includes(String(query).toLocaleLowerCase())}
function select(next){if(!allowed.has(next)||next===language)return;try{localStorage.setItem('ted-language',next)}catch{}const u=new URL(location.href);u.searchParams.set('lang',next);location.assign(u.href)}
window.TED_I18N={language,t,matches,select};
const skip='script,style,code,pre,textarea,input,[contenteditable="true"],[data-no-translate],.reflection-private-entry';
const originals=new WeakMap(),attributes=new WeakMap();
function translateText(node){if(!node.parentElement||node.parentElement.closest(skip))return;const prior=originals.get(node);if(prior&&node.nodeValue===prior.output)return;const original=node.nodeValue;if(!original.trim())return;const option=node.parentElement.closest('option');if(option&&!option.hasAttribute('value'))option.setAttribute('value',option.textContent);const output=t(original);originals.set(node,{original,output});if(output!==original)node.nodeValue=output}
function translateElement(element){if(element.closest(skip))return;for(const name of ['placeholder','title','alt','aria-label']){if(!element.hasAttribute(name))continue;let saved=attributes.get(element);if(!saved){saved={};attributes.set(element,saved)}const raw=element.getAttribute(name);if(saved[name]?.output===raw)continue;const output=t(raw);saved[name]={original:raw,output};if(output!==raw)element.setAttribute(name,output)}}
function translateTree(root){if(root.nodeType===3){translateText(root);return}if(root.nodeType!==1&&root.nodeType!==9)return;if(root.nodeType===1){if(root.closest(skip))return;translateElement(root)}const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);while(walker.nextNode()){const n=walker.currentNode;if(n.nodeType===3)translateText(n);else translateElement(n)}}
function mount(){const header=document.querySelector('.unified-header .shell-nav')||document.querySelector('.shell-nav');if(header&&!document.getElementById('language-switch')){const group=document.createElement('div');group.id='language-switch';group.className='language-switch';group.dataset.noTranslate='true';group.setAttribute('role','group');group.setAttribute('aria-label','Website language / 网站语言');for(const [code,label]of [['en','EN'],['zh','中文']]){const b=document.createElement('button');b.type='button';b.textContent=label;b.lang=code==='zh'?'zh-CN':'en';b.setAttribute('aria-pressed',String(language===code));b.onclick=()=>select(code);group.append(b)}header.append(group)}
 translateTree(document);document.documentElement.removeAttribute('data-language-pending');
 const observer=new MutationObserver(changes=>{for(const change of changes){if(change.type==='characterData')translateText(change.target);else if(change.type==='attributes')translateElement(change.target);else change.addedNodes.forEach(translateTree)}});observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','alt','aria-label']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
