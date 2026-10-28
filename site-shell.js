(()=>{'use strict';
const header=document.querySelector('.unified-header'),nav=document.getElementById('site-navigation'),menu=document.getElementById('menu'),context=document.querySelector('.site-context');
if(header&&nav&&menu){
 const sections=[...nav.querySelectorAll('.nav-section')],translate=s=>window.TED_I18N?.t(s)||s;
 let lastSummary=null,leaveTimer;
 const directory=document.createElement('section');directory.id='site-page-directory';directory.className='page-directory';directory.hidden=true;directory.setAttribute('aria-label',translate('全部页面'));
 const inner=document.createElement('div');inner.className='shell-wrap';
 const heading=document.createElement('div');heading.className='directory-heading';
 const title=document.createElement('h2');title.textContent=translate('全部页面');
 const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label',translate('关闭页面目录'));heading.append(title,close);inner.append(heading);
 const grid=document.createElement('div');grid.className='page-directory-grid';
 sections.forEach(section=>{const group=document.createElement('section'),label=document.createElement('h3');label.textContent=section.querySelector('summary span').textContent;group.append(label);section.querySelectorAll('.page-link').forEach(link=>group.append(link.cloneNode(true)));grid.append(group)});inner.append(grid);directory.append(inner);header.append(directory);
 menu.setAttribute('aria-controls',directory.id);
 function closeSections(except){sections.forEach(s=>{if(s!==except)s.open=false})}
 function closeDirectory(){directory.hidden=true;menu.setAttribute('aria-expanded','false')}
 function closeMenu(){clearTimeout(leaveTimer);closeDirectory();closeSections()}
 function setSection(section){clearTimeout(leaveTimer);closeDirectory();closeSections(section);section.open=true;lastSummary=section.querySelector('summary')}
 menu.onclick=()=>{const open=directory.hidden;closeMenu();directory.hidden=!open;menu.setAttribute('aria-expanded',String(open))};
 close.onclick=()=>{closeMenu();menu.focus()};
 sections.forEach(section=>{
  const summary=section.querySelector('summary');
  section.addEventListener('toggle',()=>{summary.setAttribute('aria-expanded',String(section.open));if(section.open){lastSummary=summary;closeDirectory();closeSections(section)}});
  section.addEventListener('keydown',e=>{const links=[...section.querySelectorAll('.page-link')];if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;e.preventDefault();setSection(section);const index=links.indexOf(document.activeElement);const next=e.key==='Home'?0:e.key==='End'?links.length-1:e.key==='ArrowUp'?(index<=0?links.length-1:index-1):(index+1)%links.length;links[next]?.focus()});
 });
 header.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('click',e=>{if(!header.contains(e.target))closeMenu()});
 document.addEventListener('focusin',e=>{if(!header.contains(e.target))closeMenu()});
 document.addEventListener('keydown',e=>{if(e.key!=='Escape'||(directory.hidden&&!sections.some(s=>s.open)))return;e.preventDefault();const focus=directory.hidden?lastSummary:menu;closeMenu();focus?.focus()});
 const base=new URL(header.querySelector('[data-site-home]').href),baseDir=new URL('.',base),map=JSON.parse(document.getElementById('site-page-map')?.textContent||'{}');
 function keyFor(url){const u=new URL(url,base);return u.pathname.startsWith(baseDir.pathname)?u.pathname.slice(baseDir.pathname.length)+(u.hash||''):''}
 function current(){let key=keyFor(location.href);if(!key||key.startsWith('#'))key='index.html'+(location.hash||'');return map[key]?key:(key.split('#')[0]||'index.html')}
 function updateLocation(){const key=current(),meta=map[key]||['home','首页','个人首页'];sections.forEach(s=>s.classList.toggle('is-active',s.dataset.section===meta[0]));header.querySelectorAll('a').forEach(a=>{if(keyFor(a.href)===key)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});if(!context)return;context.dataset.section=meta[0];const crumb=context.querySelector('.breadcrumb'),peers=context.querySelector('.section-pages');crumb.replaceChildren();function part(text,href){const el=document.createElement(href?'a':'span');el.textContent=translate(text);if(href)el.href=href;crumb.append(el)}part('首页',base.href);if(meta[0]!=='home'){part('/');part(meta[1]);part('/');const title=document.createElement('strong');title.textContent=translate(meta[2]);title.setAttribute('aria-current','page');crumb.append(title)}const section=sections.find(s=>s.dataset.section===meta[0]);peers.replaceChildren();if(section)peers.append(...[...section.querySelectorAll('.page-link')].map(a=>{const link=document.createElement('a');link.href=a.href;link.textContent=translate(a.querySelector('span').textContent);if(a.hasAttribute('aria-current'))link.setAttribute('aria-current','page');return link}));peers.setAttribute('aria-label',translate(meta[1]))}
 function height(){document.documentElement.style.setProperty('--navigation-height',(header.offsetHeight+(context?.offsetHeight||0)+18)+'px')}
 updateLocation();height();addEventListener('hashchange',()=>{updateLocation();height()});if('ResizeObserver'in window){const observer=new ResizeObserver(height);observer.observe(header);if(context)observer.observe(context)}matchMedia('(max-width:1100px)').addEventListener?.('change',closeMenu);
}
if(document.body.dataset.page!=='workspace')return;
const local=document.body.dataset.private==='true'&&['localhost','127.0.0.1','::1'].includes(location.hostname),$=id=>document.getElementById(id);document.querySelectorAll('[data-local-only]').forEach(e=>e.hidden=!local);document.querySelectorAll('[data-public-only]').forEach(e=>e.hidden=local);$('workspace-mode').textContent=local?'本机工作台 · 私人内容在本机':'公开网站 · 精选作品与知识';
if(local){fetch('api/status').then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{$('workspace-service').textContent=d.library?'工作记录与私人资料已连接':'私人资料尚未连接';if(!d.library){document.querySelectorAll('[data-local-only]').forEach(e=>e.hidden=true);$('workspace-unavailable').hidden=false}}).catch(()=>{document.querySelectorAll('[data-local-only]').forEach(e=>e.hidden=true);$('workspace-unavailable').hidden=false;$('workspace-service').textContent='当前未连接本机服务'})}
})();
