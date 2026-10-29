/* Shared public-site playback feedback. No tracking, upload, or private data. */
(() => {
  'use strict';
  const players = new WeakMap();
  const text = (en, zh) => document.documentElement.lang.startsWith('zh') ? zh : en;
  function mount(video) {
    if (!video || players.has(video)) return;
    const controller = new AbortController();
    let disposed = false, timer;
    const panel = document.createElement('div');
    panel.className = 'video-feedback';
    const status = document.createElement('p');
    status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    const actions = document.createElement('div');actions.className='video-feedback-actions';
    const play = document.createElement('button');play.type='button';play.textContent=text('Play video ▶','播放视频 ▶');
    const retry = document.createElement('button');retry.type='button';retry.textContent=text('Retry loading','重新加载');retry.hidden=true;
    const original = document.createElement('a');original.target='_blank';original.rel='noopener noreferrer';original.textContent=text('Open / download original ↗','打开 / 下载原视频 ↗');
    original.href=video.getAttribute('src') || '';
    actions.append(play,retry,original);panel.append(status,actions);video.after(panel);
    video.controls=true;video.playsInline=true;video.preload='auto';
    const listen=(event,fn)=>video.addEventListener(event,fn,{signal:controller.signal});
    const say=value=>{if(!disposed)status.textContent=value;};
    function slowTimer() {
      clearTimeout(timer);timer=setTimeout(()=>{
        if(disposed || !video.paused && video.readyState>=3)return;
        say(text('Loading is taking longer than usual. Retry, or open the original file.','视频加载较慢。可以重新加载，或打开原视频。'));retry.hidden=false;play.hidden=false;play.disabled=false;
      },12000);
    }
    async function attempt() {
      if(disposed)return;
      say(text('Loading video…','正在加载视频…'));play.disabled=true;retry.hidden=true;slowTimer();
      try {await video.play();}
      catch(error) {
        if(disposed || error.name==='AbortError')return;
        if(error.name==='NotAllowedError')clearTimeout(timer);
        if(error.name==='NotAllowedError')say(text('Your browser requires another tap. Press Play video.','浏览器需要手动确认，请点击“播放视频”。'));
        else say(text('Playback could not start. Retry, or open the original file.','暂时无法播放。请重新加载，或打开原视频。'));
        retry.hidden=error.name==='NotAllowedError';play.hidden=false;
      } finally {if(!disposed)play.disabled=false;}
    }
    play.onclick=attempt;
    retry.onclick=()=>{video.load();attempt();};
    listen('playing',()=>{clearTimeout(timer);say(text('Playing','正在播放'));play.hidden=true;retry.hidden=true;});
    listen('waiting',()=>{say(text('Buffering…','正在缓冲…'));slowTimer();});
    listen('pause',()=>{clearTimeout(timer);if(video.ended)return;play.hidden=false;play.disabled=false;say(text('Paused. Press Play video to continue.','已暂停，点击“播放视频”继续。'));});
    listen('ended',()=>{play.hidden=false;play.disabled=false;say(text('Finished. Press Play video to replay.','播放结束，可点击“播放视频”重新观看。'));});
    listen('error',()=>{
      clearTimeout(timer);play.hidden=false;play.disabled=false;retry.hidden=false;
      const code=video.error?.code;
      say(code===3 || code===4 ? text('This browser could not decode the video. Try another browser or download the original.','此浏览器无法解码视频。可以换浏览器，或下载原视频。') : text('The video could not load. Check the connection, retry, or open the original.','视频未能加载，请检查网络、重新加载，或打开原视频。'));
    });
    function dispose(){disposed=true;clearTimeout(timer);controller.abort();panel.remove();players.delete(video);}
    video.closest('dialog')?.addEventListener('close',dispose,{once:true});
    players.set(video,{dispose});attempt();
  }
  window.TED_VIDEO_PLAYER={mount,unmount:video=>players.get(video)?.dispose()};
})();
