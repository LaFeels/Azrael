/* ═══════════════════════════════════════════════════════
   AZRAEL'S CHRONICLE
   "All power flows from the soul, not the ego."
   Full rebuild — clean, Safari-safe, no optional chaining
═══════════════════════════════════════════════════════ */

var STORAGE_KEY = 'azrael-v2';
var SKILL_PTS_PER_RANK = 80;
var DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var MOODS = ['💀','😔','😐','🙂','✨'];

var PILLARS = {
  comp:  { name:'The Composition', short:'COMP',  icon:'🎹', stripe:'stripe-comp',  sb:'sb-comp',  chip:'ch-comp',  fill:'fill-comp',  weight:1.0, desc:'Dissolving into the music' },
  labor: { name:'The Labor',       short:'LABOR', icon:'⚒️', stripe:'stripe-labor', sb:'sb-labor', chip:'ch-labor', fill:'fill-labor', weight:0.9, desc:'Work without need for recognition' },
  treas: { name:'The Treasury',    short:'TREAS', icon:'💰', stripe:'stripe-treas', sb:'sb-treas', chip:'ch-treas', fill:'fill-treas', weight:0.8, desc:'Removing chaos, not accumulating' },
  vigil: { name:'The Vigil',       short:'VIGIL', icon:'📖', stripe:'stripe-vigil', sb:'sb-vigil', chip:'ch-vigil', fill:'fill-vigil', weight:0.9, desc:'Clarity without ego\'s filter' },
  soul:  { name:'The Soul',        short:'SOUL',  icon:'✦',  stripe:'stripe-soul',  sb:'sb-soul',  chip:'ch-soul',  fill:'fill-soul',  weight:1.3, desc:'Source of all power. Ego dissolution.' }
};

var RANKS = [
  'The Condemned','Hollow Spirit','Wandering Shade','Awakening Fallen',
  'Seeker of the Void','Bearer of Ash','One Who Remembers','The Unbroken',
  'Keeper of the Codex','Grimoire Ascendant','Sovereign of Ash','Between Worlds','The Eternal'
];

var REFLECT_PROMPTS = [
  ['What did your ego want today that your soul didn\'t need?','Name one moment today when you were fully present.','What did you avoid today, and why?','What emotion showed up that you didn\'t choose?'],
  ['Describe a moment today where you responded instead of reacted.','What pattern showed up again today that you recognize?','What would your soul have done differently than your ego did?','What did you do today that required no external validation?'],
  ['What part of your ego died a little today?','When did the music play itself — where did you disappear?','What truth are you still protecting yourself from?','What would Azrael do that Brenden is still afraid to?']
];

var QUESTS = [
  { text:'Play piano for 45 minutes. No phone. Let the music lead.', skill:'comp', xp:28 },
  { text:'Work today in complete silence. Just the labor and your thoughts.', skill:'labor', xp:22 },
  { text:'Sit still for 10 minutes and do nothing. Notice every impulse.', skill:'soul', xp:30 },
  { text:'Compose something. Even one bar. Finish it tonight.', skill:'comp', xp:25 },
  { text:'Do something physically demanding that nobody will know about.', skill:'labor', xp:20 },
  { text:'Notice the next time your ego wants credit. Don\'t take it.', skill:'soul', xp:32 },
  { text:'Practice one passage until you disappear into it entirely.', skill:'comp', xp:26 },
  { text:'Write one true sentence about who you actually are right now.', skill:'soul', xp:28 },
  { text:'Give Willow one uninterrupted hour. Be fully present.', skill:'soul', xp:22 },
  { text:'Calculate your exact net worth today. Write it down.', skill:'treas', xp:22 },
  { text:'Do the hardest task on your list first. Before anything else.', skill:'vigil', xp:24 },
  { text:'Identify one way your ego ran the show today. Write it.', skill:'soul', xp:30 },
  { text:'Fix something at work everyone else ignored. Don\'t mention it.', skill:'labor', xp:22 },
  { text:'Record every dollar that moved today. Face the full number.', skill:'treas', xp:18 },
  { text:'At the end of today — did Azrael act like who he is becoming?', skill:'soul', xp:30 },
  { text:'Play piano with your eyes closed. Trust what your hands know.', skill:'comp', xp:24 },
  { text:'Move money toward a debt or savings. The act matters.', skill:'treas', xp:16 },
  { text:'Read something that challenges how you see yourself.', skill:'vigil', xp:20 },
  { text:'Say no to one thing that drains you. No explanation needed.', skill:'vigil', xp:18 },
  { text:'Carry something heavy today — at work, at home, in yourself.', skill:'labor', xp:16 }
];

var CORE_EDICTS = [
  { id:'core-piano', label:'Observe 45 minutes at the instrument.', xp:20, skill:'comp', type:'duration', target:45, unit:'min', isCore:true },
  { id:'core-labor', label:'Account for the body\'s labor today.', xp:12, skill:'labor', type:'checkbox', target:1, unit:'', isCore:true },
  { id:'core-soul',  label:'Tend to the soul. Time given. Something written.', xp:16, skill:'soul', type:'duration', target:15, unit:'min', isCore:true }
];

/* ── STATE ── */
var DEFAULT_STATE = {
  xp: 0,
  streak: 0,
  longestStreak: 0,
  lastCheckin: null,
  lastReset: null,
  startDate: new Date().toDateString(),
  skills: { comp:0, labor:0, treas:0, vigil:0, soul:0 },
  edictLibrary: [],
  activeLibraryIds: [],
  edictProgress: {},
  dailyDone: [],
  questDone: false,
  missedCore: [],
  journalEntries: [],
  todayMood: null,
  todayJournal: '',
  todayReflect: '',
  weeklyIncome: [],
  savings: 0,
  savingsGoal: 5000,
  bills: [],
  debts: [],
  goals: [],
  focusLog: [],
  milestones: {}
};

var state = {};

/* ── PERSISTENCE ── */
function loadState() {
  var raw, saved, k;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      saved = JSON.parse(raw);
      state = {};
      for (k in DEFAULT_STATE) {
        if (DEFAULT_STATE.hasOwnProperty(k)) {
          state[k] = saved.hasOwnProperty(k) ? saved[k] : DEFAULT_STATE[k];
        }
      }
    } else {
      state = {};
      for (k in DEFAULT_STATE) {
        if (DEFAULT_STATE.hasOwnProperty(k)) state[k] = DEFAULT_STATE[k];
      }
    }
  } catch(e) {
    state = {};
    for (k in DEFAULT_STATE) {
      if (DEFAULT_STATE.hasOwnProperty(k)) state[k] = DEFAULT_STATE[k];
    }
  }
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
}

/* ── CALCULATIONS ── */
function xpToNext(level) {
  return Math.floor(80 * Math.pow(1.18, level - 1));
}
function getLevel(totalXP) {
  var level = 1, remaining = totalXP;
  while (remaining >= xpToNext(level)) { remaining -= xpToNext(level); level++; }
  return { level: level, currentXP: remaining, toNext: xpToNext(level) };
}
function skillRank(pts) { return Math.floor((pts || 0) / SKILL_PTS_PER_RANK) + 1; }
function skillPct(pts)  { return (((pts || 0) % SKILL_PTS_PER_RANK) / SKILL_PTS_PER_RANK) * 100; }
function soulPower(pts) { return Math.min(Math.floor(((pts || 0) / 300) * 100), 100); }
function daysSince(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}
function getDailyQuest() {
  var today = new Date().toDateString(), h = 0, i;
  for (i = 0; i < today.length; i++) h = (h * 31 + today.charCodeAt(i)) & 0xffffffff;
  return QUESTS[Math.abs(h) % QUESTS.length];
}
function getReflectPrompt(rank, doy) {
  var tier = rank <= 2 ? 0 : rank <= 4 ? 1 : 2;
  var pool = REFLECT_PROMPTS[tier];
  return pool[doy % pool.length];
}
function formatTime(s) {
  var h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sc = s%60;
  var pm = m < 10 ? '0'+m : ''+m, ps = sc < 10 ? '0'+sc : ''+sc;
  return h > 0 ? h+':'+pm+':'+ps : pm+':'+ps;
}
function formatMins(m) {
  if (!m || m < 1) return '';
  if (m < 60) return Math.round(m)+'m';
  return Math.floor(m/60)+'h '+Math.round(m%60)+'m';
}
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── DAILY RESET ── */
function checkDailyReset() {
  var today = new Date().toDateString();
  if (state.lastReset !== today) {
    var wasYest = state.lastCheckin === new Date(Date.now()-86400000).toDateString();
    var newStreak = wasYest ? state.streak + 1 : 0;
    state.dailyDone = [];
    state.questDone = false;
    state.edictProgress = {};
    state.lastReset = today;
    state.todayMood = null;
    state.todayJournal = '';
    state.todayReflect = '';
    state.streak = newStreak;
    state.longestStreak = Math.max(state.longestStreak || 0, newStreak);
    saveState();
  }
}

/* ── XP ── */
function awardXP(amount, skill) {
  var today = new Date().toDateString();
  state.xp += amount;
  state.skills[skill] = (state.skills[skill] || 0) + amount;
  if (state.lastCheckin !== today) {
    state.streak = state.streak + 1;
    state.longestStreak = Math.max(state.longestStreak || 0, state.streak);
    state.lastCheckin = today;
  }
  saveState();
  var el = document.getElementById('sf-display');
  if (el) el.textContent = state.xp + ' SF';
}

/* ── TOAST ── */
var toastTimeout;
function showToast(msg) {
  var el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(function(){ el.classList.remove('show'); }, 2800);
}

/* ── MODAL ── */
function openModal(id) {
  var overlay = document.getElementById('overlay');
  if (!overlay) return;
  var contents = document.querySelectorAll('.modal-content'), i;
  for (i = 0; i < contents.length; i++) contents[i].style.display = 'none';
  var target = document.getElementById('modal-'+id);
  if (target) target.style.display = 'block';
  overlay.classList.add('open');
  if (id === 'journal') {
    var soulPts = state.skills.soul || 0;
    var doy = Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0).getTime())/86400000);
    var prompt = getReflectPrompt(skillRank(soulPts), doy);
    var pel = document.getElementById('reflect-prompt-text');
    if (pel) pel.textContent = prompt;
    var jt = document.getElementById('journal-text');
    if (jt) jt.value = state.todayJournal || '';
    var rt = document.getElementById('reflect-text');
    if (rt) rt.value = state.todayReflect || '';
    var mbs = document.querySelectorAll('.mood-btn');
    for (i = 0; i < mbs.length; i++) mbs[i].classList.toggle('selected', i === state.todayMood);
  }
}
function closeModal() {
  var overlay = document.getElementById('overlay');
  if (overlay) overlay.classList.remove('open');
}

/* ── NAV ── */
var currentTab = 'status';
function switchTab(tabId) {
  currentTab = tabId;
  var btns = document.querySelectorAll('.nav-btn'), i;
  for (i = 0; i < btns.length; i++) btns[i].classList.toggle('active', btns[i].getAttribute('data-tab')===tabId);
  var panels = document.querySelectorAll('.tab-panel');
  for (i = 0; i < panels.length; i++) panels[i].classList.toggle('active', panels[i].id==='tab-'+tabId);
}
function switchEdictSub(sub) {
  var btns = document.querySelectorAll('.sub-tab'), i;
  for (i = 0; i < btns.length; i++) {
    var on = btns[i].getAttribute('data-sub')===sub;
    btns[i].classList.toggle('btn-warm', on);
    btns[i].classList.toggle('btn-ghost', !on);
  }
  var panels = document.querySelectorAll('.edict-sub');
  for (i = 0; i < panels.length; i++) panels[i].style.display = panels[i].id==='esub-'+sub ? 'block' : 'none';
}

/* ── FOCUS TIMER ── */
var timerInterval = null, timerSecs = 0, timerRunning = false, focusPillar = 'comp';
function startTimer() {
  timerRunning = true;
  timerInterval = setInterval(function(){
    timerSecs++;
    var el = document.querySelector('.timer-clock');
    if (el) el.textContent = formatTime(timerSecs);
    var ee = document.querySelector('.timer-earned');
    if (ee) ee.textContent = '✦ +'+Math.floor((timerSecs/60)/5)*3+' SF earned';
  }, 1000);
}
function pauseTimer() { timerRunning = false; clearInterval(timerInterval); renderFocusTab(); }
function stopAndLog() {
  clearInterval(timerInterval); timerRunning = false;
  if (timerSecs < 60) { timerSecs = 0; renderFocusTab(); return; }
  var mins = timerSecs/60, earned = Math.floor(mins/5)*3;
  state.focusLog.push({ skill:focusPillar, minutes:mins, date:new Date().toDateString() });
  if (earned > 0) awardXP(earned, focusPillar);
  showToast(formatMins(mins)+' logged · +'+earned+' SF');
  timerSecs = 0; renderFocusTab();
}
function discardTimer() { clearInterval(timerInterval); timerRunning = false; timerSecs = 0; renderFocusTab(); }

/* ── GRAPH ── */
var graphView = 'week';
function renderGraph() {
  var now = new Date(), data = [], i, d, total;
  if (graphView === 'week') {
    for (i = 6; i >= 0; i--) {
      d = new Date(now); d.setDate(d.getDate()-i); total = 0;
      for (var fi=0; fi<state.focusLog.length; fi++) if (state.focusLog[fi].date===d.toDateString()) total+=state.focusLog[fi].minutes;
      data.push({ label:['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()], total:total });
    }
  } else if (graphView === 'month') {
    for (i = 0; i < 5; i++) {
      total = 0;
      for (var fi2=0; fi2<state.focusLog.length; fi2++) { d=new Date(state.focusLog[fi2].date); if(d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()&&Math.floor((d.getDate()-1)/7)===i) total+=state.focusLog[fi2].minutes; }
      data.push({ label:'W'+(i+1), total:total });
    }
  } else {
    var months=['J','F','M','A','M','J','J','A','S','O','N','D'];
    for (i=0; i<12; i++) {
      total=0;
      for (var fi3=0; fi3<state.focusLog.length; fi3++) { d=new Date(state.focusLog[fi3].date); if(d.getMonth()===i&&d.getFullYear()===now.getFullYear()) total+=state.focusLog[fi3].minutes; }
      data.push({ label:months[i], total:total });
    }
  }
  var max=1;
  for (i=0;i<data.length;i++) if(data[i].total>max) max=data[i].total;
  var W=300,H=80,pad=14,bw=(W-pad*2)/data.length-4, bars='';
  for (i=0;i<data.length;i++) {
    var x=pad+i*((W-pad*2)/data.length)+2, bh=data[i].total===0?1:(data[i].total/max)*H, y=H-bh;
    bars+='<g><rect x="'+x+'" y="'+y+'" width="'+bw+'" height="'+bh+'" fill="url(#bg2)" rx="2"/>'
      +'<text x="'+(x+bw/2)+'" y="'+(H+14)+'" fill="#8a6838" font-size="7" text-anchor="middle" font-family="Cinzel">'+data[i].label+'</text>'
      +(data[i].total>0?'<text x="'+(x+bw/2)+'" y="'+(y-4)+'" fill="#8a5f18" font-size="7" text-anchor="middle" font-family="Cinzel">'+Math.round(data[i].total)+'</text>':'')
      +'</g>';
  }
  return '<svg viewBox="0 0 '+W+' '+(H+26)+'" style="width:100%;overflow:visible">'
    +'<defs><linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b07828" stop-opacity="0.9"/><stop offset="100%" stop-color="#6a4010" stop-opacity="0.3"/></linearGradient></defs>'
    +bars+'</svg>';
}

/* ── HELPERS ── */
function chip(k) { return '<span class="chip '+PILLARS[k].chip+'">'+PILLARS[k].icon+' '+PILLARS[k].short+'</span>'; }
function findEdict(id) {
  var i;
  for (i=0;i<CORE_EDICTS.length;i++) if(CORE_EDICTS[i].id===id) return CORE_EDICTS[i];
  for (i=0;i<state.edictLibrary.length;i++) if(state.edictLibrary[i].id===id) return state.edictLibrary[i];
  return null;
}
function edictDone(e) {
  if (state.dailyDone.indexOf(e.id)!==-1) return true;
  if (e.type!=='checkbox') return (state.edictProgress[e.id]||0)>=e.target;
  return false;
}
function renderSlider(e) {
  var prog=state.edictProgress[e.id]||0, pct=Math.min((prog/e.target)*100,100);
  var atGoal=prog>=e.target, earned=Math.round((Math.min(prog,e.target)/e.target)*e.xp);
  var fc=atGoal?'fill-gold':PILLARS[e.skill].fill, dis=edictDone(e)?'disabled':'';
  return '<div class="slider-section">'
    +'<div class="slider-progress-row"><div><span class="slider-current '+(atGoal?'at-goal':'')+'">'+prog+'</span><span class="slider-unit"> '+e.unit+'</span></div><span class="slider-target">of '+e.target+e.unit+'</span></div>'
    +'<div class="slider-wrap">'
    +'<div class="slider-track-bg"><div class="slider-track-fill '+fc+'" style="width:'+pct+'%"></div></div>'
    +'<div class="slider-thumb '+(atGoal?'at-goal':'')+'" style="left:'+Math.min(pct,97)+'%"><div class="slider-dot '+(atGoal?'at-goal':'')+'"></div></div>'
    +'<input type="range" class="slider-input" min="0" max="'+e.target+'" step="1" value="'+prog+'" data-eid="'+e.id+'" '+dis+'>'
    +'</div>'
    +'<div class="partial-earned" style="display:'+(!atGoal&&prog>0?'block':'none')+'">Progress earns <span style="color:var(--g2);font-weight:600">+'+earned+' SF</span></div>'
    +'</div>';
}
function renderEdictCard(e) {
  var pl=PILLARS[e.skill], done=edictDone(e);
  var badge=e.isCore?'<div class="core-badge">◈ Core</div>':'<div class="stretch-badge">✦ Stretch</div>';
  var cb=e.type==='checkbox'?'<div class="edict-checkbox '+(done?'checked':'')+'" onclick="checkEdict(\''+e.id+'\')">'+(done?'<span class="check-mark">✦</span>':'')+'</div>':'';
  var sl=e.type!=='checkbox'?renderSlider(e):'';
  var tb=e.type==='checkbox'?'<span class="edict-type-badge">✓ task</span>':e.type==='duration'?'<span class="edict-type-badge">⏱ '+e.target+e.unit+'</span>':'<span class="edict-type-badge"># '+e.target+' '+e.unit+'</span>';
  var del=!e.isCore?'<button class="edict-del" onclick="removeLibEdict(\''+e.id+'\')">remove</button>':'';
  return '<div class="edict-card '+(e.isCore?'is-core':'')+' '+(done?'is-done':'')+'" data-eid="'+e.id+'">'
    +'<div class="edict-stripe '+pl.stripe+'"></div>'+badge
    +'<div class="edict-inner"><div class="edict-top">'+cb
    +'<div class="edict-main"><div class="edict-label '+(done?'done-text':'')+'">'+esc(e.label)+'</div>'
    +'<div class="edict-meta">'+chip(e.skill)+tb+'<span class="edict-xp-tag">'+(done?'✦ ':'+')+e.xp+' SF</span></div></div></div>'
    +sl+del+'</div></div>';
}

/* ── ACTIONS ── */
function checkEdict(id) {
  var e=findEdict(id); if(!e||edictDone(e)) return;
  state.dailyDone.push(id); state.edictProgress[id]=e.target;
  awardXP(e.xp,e.skill); showToast('+'+e.xp+' Soul Fragments'); renderEdictTab();
}
function updateSlider(id, val) {
  var e=findEdict(id); if(!e) return;
  var prev=state.edictProgress[id]||0, wasComplete=prev>=e.target;
  state.edictProgress[id]=val;
  if (val>=e.target&&!wasComplete&&state.dailyDone.indexOf(id)===-1) {
    state.dailyDone.push(id); awardXP(e.xp,e.skill); showToast('+'+e.xp+' Soul Fragments ✦'); renderEdictTab();
  } else {
    saveState();
    var card=document.querySelector('[data-eid="'+id+'"]'); if(!card) return;
    var pct=Math.min((val/e.target)*100,100), atGoal=val>=e.target;
    var fill=card.querySelector('.slider-track-fill'), thumb=card.querySelector('.slider-thumb'), dot=card.querySelector('.slider-dot'), curr=card.querySelector('.slider-current'), partial=card.querySelector('.partial-earned');
    if(fill){fill.style.width=pct+'%';fill.className='slider-track-fill '+(atGoal?'fill-gold':PILLARS[e.skill].fill);}
    if(thumb){thumb.style.left=Math.min(pct,97)+'%';thumb.className='slider-thumb '+(atGoal?'at-goal':'');}
    if(dot) dot.className='slider-dot '+(atGoal?'at-goal':'');
    if(curr){curr.textContent=val;curr.className='slider-current '+(atGoal?'at-goal':'');}
    if(partial){var earned=Math.round((Math.min(val,e.target)/e.target)*e.xp);partial.style.display=(!atGoal&&val>0)?'block':'none';var sp=partial.querySelector('span');if(sp)sp.textContent='+'+earned+' SF';}
  }
}
function attachSliders() {
  var inputs=document.querySelectorAll('.slider-input'), i;
  for(i=0;i<inputs.length;i++) {
    (function(inp){
      inp.addEventListener('input',function(){ updateSlider(inp.getAttribute('data-eid'),parseInt(inp.value)); });
    })(inputs[i]);
  }
}
function removeLibEdict(id) { state.activeLibraryIds=state.activeLibraryIds.filter(function(x){return x!==id;}); saveState(); renderEdictTab(); }
function toggleLibEdict(id) {
  var idx=state.activeLibraryIds.indexOf(id);
  if(idx===-1) state.activeLibraryIds.push(id); else state.activeLibraryIds.splice(idx,1);
  saveState(); renderLibrary();
}
function removeFromLibrary(id) {
  state.edictLibrary=state.edictLibrary.filter(function(e){return e.id!==id;});
  state.activeLibraryIds=state.activeLibraryIds.filter(function(x){return x!==id;});
  saveState(); renderLibrary();
}

/* ── RENDER TABS ── */
function renderStatusTab() {
  var lvd=getLevel(state.xp), level=lvd.level, cxp=lvd.currentXP, ton=lvd.toNext;
  var xpPct=(cxp/ton)*100, soulPts=state.skills.soul||0, today=new Date().toDateString();
  var quest=getDailyQuest(), dr=daysSince(state.startDate), rn=RANKS[Math.min(level-1,RANKS.length-1)];
  var todayFocus=0, fi;
  for(fi=0;fi<state.focusLog.length;fi++) if(state.focusLog[fi].date===today) todayFocus+=state.focusLog[fi].minutes;
  var pk, pl, html='';

  html='<div class="hero"><div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div>'
    +'<div class="hero-bg-rune">Az</div>'
    +'<div class="player-eyebrow">[ Player Status ]</div>'
    +'<div class="player-name">AZRAEL</div>'
    +'<div class="player-class">Fallen Angel · '+rn+'</div>'
    +'<div class="level-block"><div class="level-num">'+level+'</div><div class="level-meta"><div class="level-tag">Ascension Level</div><div class="level-title">'+rn+'</div><div class="level-sub">'+cxp+' / '+ton+' SF to ascend</div></div></div>'
    +'<div class="xp-wrap"><div class="xp-head"><span>Soul Fragments</span><span>'+cxp+' / '+ton+'</span></div><div class="xp-track"><div class="xp-fill" style="width:'+xpPct+'%"></div></div></div>'
    +'<div class="stat-grid">';
  var pks=['comp','labor','treas','vigil','soul'];
  for(var pi=0;pi<pks.length;pi++){pk=pks[pi];pl=PILLARS[pk];html+='<div class="stat-cell"><span class="stat-em">'+pl.icon+'</span><span class="stat-lbl">'+pl.short+'</span><span class="stat-val '+(pk==='soul'?'soul-color':'')+'">'+skillRank(state.skills[pk]||0)+'</span></div>';}
  html+='</div><div class="soul-indicator"><div class="soul-orb"></div><div style="flex:1"><div class="soul-title">Soul Power</div><div class="soul-sub">All power flows from within</div></div><div class="soul-pct">'+soulPower(soulPts)+'%</div></div></div>';

  html+='<div class="fp"><div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 16px">';
  var stats=[{l:'Current Streak',v:state.streak+' days',e:'🔥'},{l:'Longest Streak',v:(state.longestStreak||0)+' days',e:'⚡'},{l:'Focus Today',v:formatMins(todayFocus)||'—',e:'⏱'},{l:'Day',v:dr,e:'📅'}];
  var si;for(si=0;si<stats.length;si++){var st2=stats[si];html+='<div style="background:rgba(90,55,15,.06);border:1px solid var(--wl2);border-radius:5px;padding:10px 12px"><div style="font-size:16px;margin-bottom:3px">'+st2.e+'</div><div style="font-family:\'Cinzel\',serif;font-size:6.5px;letter-spacing:1px;color:var(--t3);text-transform:uppercase;margin-bottom:3px">'+st2.l+'</div><div style="font-family:\'Cinzel\',serif;font-size:16px;font-weight:700;color:var(--t1)">'+st2.v+'</div></div>';}
  html+='</div></div>';

  html+='<div class="fp"><div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div><div class="fp-header"><div class="fp-bar"></div><div class="fp-title">Wings of Ascension</div><div class="fp-line"></div><div class="fp-tag">Day '+state.streak+'</div></div><div class="fp-body"><div style="font-size:13px;color:var(--t3);font-style:italic;margin-bottom:10px">Each consecutive day restores a feather. Miss one and they return to ash.</div><div class="wings-wrap">';
  var wc=Math.max(state.streak,21), wi;for(wi=0;wi<wc;wi++) html+='<div class="wing '+(wi<state.streak?'lit':'')+'"></div>';
  html+='</div></div></div>';

  html+='<div class="quest-fp"><div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div>'
    +'<div class="quest-eyebrow">Daily Quest · Resets at Midnight</div>'
    +'<div class="quest-text">'+esc(quest.text)+'</div>'
    +'<div class="quest-foot"><div><div class="quest-xp">+'+quest.xp+' Soul Fragments</div><div class="quest-skill">'+PILLARS[quest.skill].name+'</div></div>'
    +(state.questDone?'<div class="quest-done">✦ Complete</div>':'<button class="btn btn-burg" onclick="completeQuest()">Complete</button>')
    +'</div></div>';

  document.getElementById('tab-status').innerHTML=html;
}

function completeQuest() {
  if(state.questDone) return;
  var q=getDailyQuest(); state.questDone=true;
  awardXP(q.xp,q.skill); showToast('Quest complete · +'+q.xp+' SF');
  renderStatusTab(); renderEdictTab();
}

function renderEdictTab() {
  var allEdicts=[], i, e;
  for(i=0;i<CORE_EDICTS.length;i++) allEdicts.push(CORE_EDICTS[i]);
  for(i=0;i<state.edictLibrary.length;i++) if(state.activeLibraryIds.indexOf(state.edictLibrary[i].id)!==-1) allEdicts.push(state.edictLibrary[i]);
  var doneCount=0;for(i=0;i<allEdicts.length;i++) if(edictDone(allEdicts[i])) doneCount++;
  var fillPct=allEdicts.length>0?(doneCount/allEdicts.length)*100:0;

  var vc=document.getElementById('vessel-count'); if(vc) vc.textContent=doneCount+' / '+allEdicts.length;
  var vf=document.getElementById('vessel-fill'); if(vf){vf.style.width=fillPct+'%';vf.className='vessel-fill'+(fillPct>=100?' full':'');}
  var vm=document.getElementById('vessel-msg'); if(vm) vm.style.display=fillPct>=100?'block':'none';

  var quest=getDailyQuest(), html='';
  html='<div class="quest-fp" style="margin-bottom:13px"><div class="quest-eyebrow">Daily Quest</div><div class="quest-text">'+esc(quest.text)+'</div>'
    +'<div class="quest-foot"><div><div class="quest-xp">+'+quest.xp+' SF</div><div class="quest-skill">'+PILLARS[quest.skill].name+'</div></div>'
    +(state.questDone?'<div class="quest-done">✦ Complete</div>':'<button class="btn btn-burg" onclick="completeQuest()">Complete</button>')+'</div></div>';

  html+='<div class="day-sep"><div class="day-sep-line"></div><div class="day-sep-label">◈ Core Edicts</div><div class="day-sep-line"></div></div>';
  for(i=0;i<CORE_EDICTS.length;i++) html+=renderEdictCard(CORE_EDICTS[i]);

  var activeLib=[];for(i=0;i<state.edictLibrary.length;i++) if(state.activeLibraryIds.indexOf(state.edictLibrary[i].id)!==-1) activeLib.push(state.edictLibrary[i]);
  if(activeLib.length>0){html+='<div class="day-sep"><div class="day-sep-line"></div><div class="day-sep-label">Personal Edicts</div><div class="day-sep-line"></div></div>';for(i=0;i<activeLib.length;i++) html+=renderEdictCard(activeLib[i]);}
  html+='<button class="btn btn-warm btn-full mt-8" onclick="openModal(\'inscribe\')">✦ Add to Library</button>';

  var ap=document.getElementById('esub-active'); if(ap) ap.innerHTML=html;
  renderLibrary(); renderMissed(); attachSliders();
}

function renderLibrary() {
  var html='<div style="font-size:13px;color:var(--t3);font-style:italic;margin-bottom:14px;line-height:1.5">Toggle edicts to add them to your daily list.</div>', i, e, pl, isActive;
  if(state.edictLibrary.length===0) html+='<div class="empty">The library is empty. Inscribe your first edict.</div>';
  for(i=0;i<state.edictLibrary.length;i++){e=state.edictLibrary[i];pl=PILLARS[e.skill];isActive=state.activeLibraryIds.indexOf(e.id)!==-1;
    html+='<div class="lib-item"><div class="lib-stripe '+pl.stripe+'"></div><div class="lib-main"><div class="lib-label">'+esc(e.label)+'</div><div class="lib-meta">'+chip(e.skill)+'<span style="font-family:\'Cinzel\',serif;font-size:8px;color:var(--g2)">+'+e.xp+' SF</span></div></div>'
      +'<button class="lib-toggle '+(isActive?'on':'off')+'" onclick="toggleLibEdict(\''+e.id+'\')">'+(isActive?'Active':'Inactive')+'</button>'
      +'<button class="lib-del" onclick="removeFromLibrary(\''+e.id+'\')">×</button></div>';}
  html+='<button class="btn btn-warm btn-full mt-8" onclick="openModal(\'inscribe\')">✦ Inscribe New Edict</button>';
  var lp=document.getElementById('esub-library'); if(lp) lp.innerHTML=html;
}

function renderMissed() {
  var html='<div style="font-size:13px;color:var(--t3);font-style:italic;margin-bottom:14px;line-height:1.5">A permanent record. These do not disappear.</div>', i, m;
  if(state.missedCore.length===0) html+='<div class="empty">No core edicts missed. The record is clean.</div>';
  for(i=state.missedCore.length-1;i>=0;i--){m=state.missedCore[i];html+='<div class="miss-history"><div class="miss-history-date">'+esc(m.date)+'</div><div class="miss-history-label">'+esc(m.label)+'</div><div class="miss-history-note">"'+esc(m.note)+'"</div></div>';}
  var mp=document.getElementById('esub-missed'); if(mp) mp.innerHTML=html;
}

function renderCodexTab() {
  var html='<div class="sh"><div class="sh-bar"></div><div class="sh-title">The Codex</div><div class="sh-line"></div></div>'
    +'<div style="font-size:14px;color:var(--t3);font-style:italic;margin-bottom:16px;line-height:1.5">Five disciplines. Each grows independently. Soul carries the most weight.</div>';
  var keys=['comp','labor','treas','vigil','soul'], i, k, pl, pts, r, p, tf, fi;
  for(i=0;i<keys.length;i++){k=keys[i];pl=PILLARS[k];pts=state.skills[k]||0;r=skillRank(pts);p=skillPct(pts);tf=0;
    for(fi=0;fi<state.focusLog.length;fi++) if(state.focusLog[fi].skill===k) tf+=state.focusLog[fi].minutes;
    html+='<div class="skill-panel"><div class="skill-side ss-'+k+'"></div><div class="skill-inner"><div class="skill-top">'
      +'<div><span class="skill-icon">'+pl.icon+'</span><div class="skill-name">'+pl.name+'</div><div class="skill-desc">'+pl.desc+'</div></div>'
      +'<div style="text-align:right"><div class="skill-rank-num">'+r+'</div><div class="skill-rank-lbl">RANK</div></div></div>'
      +'<div class="skill-bar-bg"><div class="skill-bar-fill '+pl.sb+'" style="width:'+p+'%"></div></div>'
      +'<div class="skill-bar-labels"><span>Rank '+r+' · '+pts+' SF</span><span>'+Math.round(p)+'% → Rank '+(r+1)+'</span></div>'
      +(tf>0?'<div style="margin-top:6px;font-family:\'Crimson Pro\',serif;font-size:11px;font-style:italic;color:var(--t3)">'+formatMins(tf)+' logged lifetime</div>':'')
      +'<div style="margin-top:4px;font-family:\'Cinzel\',serif;font-size:7px;letter-spacing:1px;color:var(--g2);opacity:.6">WEIGHT ×'+pl.weight+'</div>'
      +'</div></div>';}
  document.getElementById('tab-codex').innerHTML=html;
}

function renderFocusTab() {
  var today=new Date().toDateString(), isActive=timerRunning||timerSecs>0;
  var html='<div class="sh"><div class="sh-bar"></div><div class="sh-title">Focus Session</div><div class="sh-line"></div></div>', i, k, pl, tm, pks;
  if(!isActive){
    html+='<div style="font-size:14px;color:var(--t3);font-style:italic;margin-bottom:14px;line-height:1.5">Every 5 minutes earns +3 SF and feeds that pillar\'s rank.</div>';
    pks=['comp','labor','treas','vigil','soul'];
    for(i=0;i<pks.length;i++){k=pks[i];pl=PILLARS[k];tm=0;for(var fi=0;fi<state.focusLog.length;fi++) if(state.focusLog[fi].date===today&&state.focusLog[fi].skill===k) tm+=state.focusLog[fi].minutes;
      html+='<button class="focus-btn '+(focusPillar===k?'active':'')+'" onclick="setFocusPillar(\''+k+'\')"><span class="focus-icon">'+pl.icon+'</span><div><div class="focus-name">'+pl.name+'</div><div class="focus-today">Today: '+(formatMins(tm)||'—')+'</div></div>'+(focusPillar===k?'<span class="focus-mark">✦</span>':'')+'</button>';}
    html+='<button class="btn btn-burg btn-full mt-8" onclick="beginFocus()">✦ Begin — '+PILLARS[focusPillar].name+'</button>';
  } else {
    html+='<div class="timer-panel"><div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div>'
      +'<div class="timer-label">'+PILLARS[focusPillar].icon+' '+PILLARS[focusPillar].name+'</div>'
      +'<div class="timer-clock '+(timerRunning?'running':'')+'">'+formatTime(timerSecs)+'</div>'
      +'<div class="timer-earned">✦ +'+Math.floor((timerSecs/60)/5)*3+' SF earned</div>'
      +'<div class="timer-btns">'+(timerRunning?'<button class="btn btn-warm" onclick="pauseTimer()">Pause</button>':'<button class="btn btn-burg" onclick="resumeFocus()">Resume</button>')
      +'<button class="btn btn-grn" onclick="stopAndLog()">End & Log</button>'
      +'<button class="btn btn-ghost" onclick="discardTimer()">Discard</button></div></div>';
  }
  html+='<div style="height:12px"></div><div class="graph-wrap"><div class="graph-title">✦ Focus Across Time</div><div class="graph-tabs">';
  var views=['week','month','year'], vi;for(vi=0;vi<views.length;vi++){var v=views[vi];html+='<button class="graph-tab '+(graphView===v?'active':'')+'" onclick="setGraphView(\''+v+'\')">'+v.charAt(0).toUpperCase()+v.slice(1)+'</button>';}
  html+='</div>'+(state.focusLog.length===0?'<div class="empty">No sessions yet</div>':renderGraph())+'</div>';
  html+='<div class="sh" style="margin-top:14px"><div class="sh-bar"></div><div class="sh-title">All Time</div><div class="sh-line"></div></div>';
  pks=['comp','labor','treas','vigil','soul'];
  for(i=0;i<pks.length;i++){k=pks[i];pl=PILLARS[k];var tot=0;for(var tfi=0;tfi<state.focusLog.length;tfi++) if(state.focusLog[tfi].skill===k) tot+=state.focusLog[tfi].minutes;
    html+='<div class="fp" style="margin-bottom:8px"><div class="fp-body" style="padding:11px 14px"><div style="display:flex;align-items:center;gap:12px"><span style="font-size:20px">'+pl.icon+'</span><div style="flex:1"><div style="font-family:\'Cinzel\',serif;font-size:11px;color:var(--t1);letter-spacing:1px;font-weight:600">'+pl.name+'</div><div style="font-size:12px;color:var(--t3);font-style:italic;margin-top:2px">'+(formatMins(tot)||'No sessions yet')+'</div></div><div style="font-family:\'Cinzel\',serif;font-size:18px;font-weight:900;color:var(--g2)">'+(formatMins(tot)||'—')+'</div></div></div></div>';}
  document.getElementById('tab-focus').innerHTML=html;
}

function renderSoulTab() {
  var soulPts=state.skills.soul||0, soulRank=skillRank(soulPts);
  var doy=Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0).getTime())/86400000);
  var rp=getReflectPrompt(soulRank,doy), html='', i, entry;
  html='<div class="fp" style="background:linear-gradient(158deg,#f5eef8,#ede5f0);border:1px solid rgba(90,56,168,.2);margin-bottom:13px">'
    +'<div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div>'
    +'<div class="fp-header" style="border-bottom-color:rgba(90,56,168,.15)"><div class="fp-bar" style="background:linear-gradient(180deg,var(--s3),var(--s2))"></div><div class="fp-title" style="color:var(--s3)">The Soul</div><div class="fp-line"></div><div class="fp-tag">Rank '+soulRank+'</div></div>'
    +'<div class="fp-body"><div style="font-family:\'Crimson Pro\',serif;font-size:15px;font-style:italic;color:var(--t1);line-height:1.7;margin-bottom:14px">"All powers flow from here. The strength, the foresight, the stillness. While others upgrade their egos, Azrael dims his. The soul is the source of everything."</div>'
    +'<div class="soul-indicator"><div class="soul-orb"></div><div style="flex:1"><div class="soul-title">Ego Dissolution</div><div class="soul-sub">The quieter the ego, the louder the soul</div></div><div class="soul-pct">'+soulPower(soulPts)+'%</div></div></div></div>';
  html+='<div class="sh"><div class="sh-bar" style="background:linear-gradient(180deg,var(--s3),var(--s2))"></div><div class="sh-title" style="color:var(--s3)">Today\'s Chronicle</div><div class="sh-line"></div></div>';
  html+='<div class="reflect-panel"><div class="orn tl"></div><div class="orn tr"></div><div class="reflect-q-label">Today\'s Reflection</div><div class="reflect-q">'+esc(rp)+'</div>'
    +(state.todayMood!==null?'<div style="font-size:24px;margin-bottom:8px">'+MOODS[state.todayMood]+'</div>':'')
    +(state.todayReflect?'<div style="font-family:\'Crimson Pro\',serif;font-size:14px;color:var(--t2);font-style:italic;line-height:1.6;margin-bottom:12px">'+esc(state.todayReflect)+'</div>':'<div style="font-size:13px;color:var(--t3);font-style:italic;margin-bottom:12px">Not yet answered today.</div>')
    +'<button class="btn btn-soul btn-full" onclick="openModal(\'journal\')">'+(state.todayReflect?'Update Entry':'Open Chronicle')+' ✦</button></div>';
  html+='<div class="sh" style="margin-top:16px"><div class="sh-bar"></div><div class="sh-title">Past Entries</div><div class="sh-line"></div></div>';
  if(state.journalEntries.length===0) html+='<div class="empty">The chronicle awaits its first entry.</div>';
  var jslice=state.journalEntries.slice(0,10);
  for(i=0;i<jslice.length;i++){entry=jslice[i];html+='<div class="fp" style="margin-bottom:8px"><div class="fp-body" style="padding:12px 14px"><div class="flex-between" style="margin-bottom:6px"><div style="font-family:\'Cinzel\',serif;font-size:9px;letter-spacing:1px;color:var(--t3)">'+esc(entry.date)+'</div>'+(entry.mood!=null?'<div style="font-size:16px">'+MOODS[entry.mood]+'</div>':'')+'</div>'+(entry.journal?'<div style="font-family:\'Crimson Pro\',serif;font-size:13px;color:var(--t2);margin-bottom:4px;line-height:1.5">'+esc(entry.journal.slice(0,120))+(entry.journal.length>120?'...':'')+'</div>':'')+(entry.reflect?'<div style="font-family:\'Crimson Pro\',serif;font-size:12px;font-style:italic;color:var(--t3);line-height:1.4">'+esc(entry.reflect.slice(0,100))+(entry.reflect.length>100?'...':'')+'</div>':'')+'</div></div>';}
  document.getElementById('tab-soul').innerHTML=html;
}

function renderGoalsTab() {
  var dr=daysSince(state.startDate), ms=state.milestones||{}, html='', i, gi, goal, pct;
  html='<div class="sh"><div class="sh-bar"></div><div class="sh-title">Covenants</div><div class="sh-line"></div></div>'
    +'<div style="font-size:14px;color:var(--t3);font-style:italic;margin-bottom:16px;line-height:1.5">That which Azrael has sworn to himself.</div>'
    +'<div class="sh" style="margin-bottom:10px"><div class="sh-bar"></div><div class="sh-title">Marked Moments</div><div class="sh-line"></div></div>';
  var milestones=[
    {icon:'🔥',name:'Day 100',desc:'The first real milestone',earned:dr>=100,date:ms.day100||''},
    {icon:'⚡',name:'First Rank 5',desc:ms.firstRank5?(PILLARS[ms.firstRank5.pillar]?PILLARS[ms.firstRank5.pillar].name:'A pillar'):'Any pillar reaches Rank 5',earned:!!ms.firstRank5,date:ms.firstRank5?(ms.firstRank5.date||''):''},
    {icon:'✦',name:'First Covenant Fulfilled',desc:ms.firstCovenant?(ms.firstCovenant.name||''):'Complete your first goal',earned:!!ms.firstCovenant,date:ms.firstCovenant?(ms.firstCovenant.date||''):''}
  ];
  for(i=0;i<milestones.length;i++){var m=milestones[i];html+='<div class="milestone-badge '+(m.earned?'':'locked')+'"><span class="milestone-badge-icon">'+m.icon+'</span><div><div class="milestone-badge-name">'+m.name+'</div><div class="milestone-badge-desc">'+esc(m.desc)+'</div></div>'+(m.earned?'<div class="milestone-badge-date">'+esc(m.date)+'</div>':'<div style="margin-left:auto;font-family:\'Cinzel\',serif;font-size:8px;color:var(--t4);letter-spacing:1px">LOCKED</div>')+'</div>';}
  html+='<div style="height:16px"></div><div class="sh"><div class="sh-bar"></div><div class="sh-title">Active Covenants</div><div class="sh-line"></div></div>';
  if(state.goals.length===0) html+='<div class="empty" style="padding:30px 0">No covenants sealed yet.<br>What has Azrael promised himself?</div>';
  for(gi=0;gi<state.goals.length;gi++){goal=state.goals[gi];pct=Math.min((goal.current/goal.target)*100,100);
    html+='<div class="goal-panel"><div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div>'
      +'<div class="flex-between" style="margin-bottom:8px"><div><div class="goal-name">'+esc(goal.name)+'</div>'+(goal.desc?'<div class="goal-desc">'+esc(goal.desc)+'</div>':'')+'</div>'
      +'<button style="background:none;border:1px solid rgba(110,24,40,.16);color:rgba(154,40,56,.45);font-family:\'Cinzel\',serif;font-size:7px;letter-spacing:1px;padding:3px 7px;cursor:pointer;border-radius:3px" onclick="deleteGoal(\''+goal.id+'\')">remove</button></div>'
      +'<div class="goal-pct-row"><span>'+Math.round(pct)+'% complete</span><span>'+goal.current+(goal.unit||'')+' / '+goal.target+(goal.unit||'')+'</span></div>'
      +'<div class="goal-track"><div class="goal-fill" style="width:'+pct+'%"></div></div>'
      +'<div class="milestone-row">'+[25,50,75,100].map(function(mv){return '<div class="milestone '+(pct>=mv?'reached':'')+'"></div>';}).join('')+'</div>'
      +'<div class="goal-footer">'+chip(goal.skill)+'<button class="btn btn-ghost" style="font-size:8px;padding:6px 12px" onclick="openUpdateGoal(\''+goal.id+'\')">Update</button></div>'
      +(pct>=100?'<div class="goal-fulfilled">✦ Covenant Fulfilled ✦</div>':'')+'</div>';}
  html+='<button class="btn btn-warm btn-full mt-8" onclick="openModal(\'goal\')">✦ Seal New Covenant</button>';
  document.getElementById('tab-goals').innerHTML=html;
}

function renderTreasuryTab() {
  var tb=0,td=0,tmi=0, bi,di,ii,w,wd,now=new Date(), d, dpct, paid, pct, sorted, suf, inc, html='';
  for(bi=0;bi<state.bills.length;bi++) tb+=state.bills[bi].amount;
  for(di=0;di<state.debts.length;di++) td+=state.debts[di].remaining;
  for(ii=0;ii<state.weeklyIncome.length;ii++){w=state.weeklyIncome[ii];wd=new Date(w.date);if(wd.getMonth()===now.getMonth()&&wd.getFullYear()===now.getFullYear()) tmi+=w.amount;}
  var net=tmi-tb;
  html='<div class="vault-panel"><div class="orn tl" style="border-color:rgba(36,88,40,.4)"></div><div class="orn tr" style="border-color:rgba(36,88,40,.4)"></div>'
    +'<div class="vault-label">Vault — Savings</div><div class="vault-amount">$'+state.savings.toFixed(2)+'</div>'
    +(state.savingsGoal>0?'<div style="display:flex;justify-content:space-between;font-family:\'Cinzel\',serif;font-size:8px;letter-spacing:1px;color:var(--t3);margin-bottom:5px"><span>Savings Covenant</span><span>$'+state.savings.toFixed(0)+' / $'+state.savingsGoal+'</span></div><div class="xp-track"><div class="xp-fill" style="width:'+Math.min(state.savings/state.savingsGoal*100,100)+'%"></div></div>':'')
    +'</div>';
  html+='<div class="sh"><div class="sh-bar"></div><div class="sh-title">Monthly Flow</div><div class="sh-line"></div></div>';
  html+='<div class="fp" style="margin-bottom:13px"><div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div><div class="fp-body">'
    +'<div class="ledger-row"><span class="ledger-label">Income logged</span><span class="ledger-val ledger-pos">$'+tmi.toFixed(2)+'</span></div>'
    +'<div class="ledger-row"><span class="ledger-label">Monthly bills</span><span class="ledger-val ledger-neg">-$'+tb.toFixed(2)+'</span></div>'
    +'<div class="divider" style="margin:6px 0"></div>'
    +'<div class="ledger-row"><span class="ledger-label" style="color:var(--t1)">Net</span><span class="ledger-val '+(net>=0?'ledger-pos':'ledger-neg')+'">$'+net.toFixed(2)+'</span></div></div></div>';
  html+='<div class="sh"><div class="sh-bar"></div><div class="sh-title">Debt Snowball</div><div class="sh-line"></div></div>';
  if(td>0) html+='<div style="font-family:\'Crimson Pro\',serif;font-size:13px;font-style:italic;color:var(--t3);margin-bottom:10px">Total remaining: <strong style="color:var(--bu2)">$'+td.toFixed(2)+'</strong></div>';
  html+='<div class="fp" style="margin-bottom:10px"><div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div><div class="fp-body" style="padding-top:8px;padding-bottom:8px">';
  if(state.debts.length===0){html+='<div class="empty">No debts recorded</div>';}
  else{sorted=state.debts.slice().sort(function(a,b){return a.remaining-b.remaining;});for(di=0;di<sorted.length;di++){d=sorted[di];paid=d.total-d.remaining;dpct=Math.min((paid/d.total)*100,100);html+='<div class="debt-row"><div class="flex-between" style="margin-bottom:6px"><div class="debt-name">'+(di===0?'⚔ ':'')+esc(d.name)+(di===0?' — Attack this first':'')+'</div><button style="background:none;border:1px solid rgba(110,24,40,.16);color:rgba(154,40,56,.45);font-family:\'Cinzel\',serif;font-size:7px;padding:3px 7px;cursor:pointer;border-radius:3px" onclick="deleteDebt(\''+d.id+'\')">✕</button></div><div class="debt-meta"><span>Remaining: $'+d.remaining.toFixed(2)+'</span><span>'+Math.round(dpct)+'% paid</span></div><div class="debt-track"><div class="debt-fill" style="width:'+dpct+'%"></div></div><div class="flex-between"><div style="font-family:\'Crimson Pro\',serif;font-size:11px;font-style:italic;color:var(--t3)">Min: $'+d.minPayment.toFixed(2)+'/mo</div><button class="btn btn-ghost" style="font-size:7px;padding:4px 10px" onclick="openPayDebt(\''+d.id+'\')">Log Payment</button></div></div>';}}
  html+='</div></div>';
  html+='<div class="sh"><div class="sh-bar"></div><div class="sh-title">Bills</div><div class="sh-line"></div></div>';
  html+='<div class="fp" style="margin-bottom:10px"><div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div><div class="fp-body" style="padding-top:8px;padding-bottom:8px">';
  if(state.bills.length===0){html+='<div class="empty">No bills bound</div>';}
  else{sorted=state.bills.slice().sort(function(a,b){return a.dueDay-b.dueDay;});for(bi=0;bi<sorted.length;bi++){var b=sorted[bi];suf=['st','nd','rd'][b.dueDay-1]||'th';html+='<div class="ledger-row"><div><div style="font-size:14px;color:var(--t1)">'+esc(b.label)+'</div><div style="font-size:11px;color:var(--t3);font-style:italic;margin-top:1px">Due '+b.dueDay+suf+'</div></div><div style="display:flex;align-items:center;gap:10px"><span class="ledger-val ledger-neg">-$'+parseFloat(b.amount).toFixed(2)+'</span><button style="background:none;border:1px solid rgba(110,24,40,.16);color:rgba(154,40,56,.45);font-size:12px;cursor:pointer;padding:2px 6px;border-radius:3px" onclick="deleteBill(\''+b.id+'\')">×</button></div></div>';}}
  html+='</div></div>';
  html+='<div class="sh"><div class="sh-bar"></div><div class="sh-title">Income Log</div><div class="sh-line"></div></div>';
  html+='<div class="fp" style="margin-bottom:13px"><div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div><div class="fp-body" style="padding-top:8px;padding-bottom:8px">';
  if(state.weeklyIncome.length===0){html+='<div class="empty">No income logged yet</div>';}
  else{var isl=state.weeklyIncome.slice(0,10);for(ii=0;ii<isl.length;ii++){inc=isl[ii];html+='<div class="ledger-row"><div><div style="font-size:14px;color:var(--t1)">'+esc(inc.label)+'</div><div style="font-size:11px;color:var(--t3);font-style:italic;margin-top:1px">'+esc(inc.date)+'</div></div><span class="ledger-val ledger-pos">+$'+inc.amount.toFixed(2)+'</span></div>';}}
  html+='</div></div>';
  html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><button class="btn btn-grn" onclick="openModal(\'income\')">+ Log Income</button><button class="btn btn-burg" onclick="openModal(\'debt\')">+ Add Debt</button><button class="btn btn-warm" onclick="openModal(\'bill\')">+ Bind Bill</button><button class="btn btn-ghost" onclick="openModal(\'savings\')">+ Add Savings</button></div>';
  document.getElementById('tab-treasury').innerHTML=html;
}

function renderAll() {
  renderStatusTab(); renderEdictTab(); renderCodexTab(); renderFocusTab(); renderSoulTab(); renderGoalsTab(); renderTreasuryTab();
}

/* ── GLOBAL ACTIONS ── */
window.completeQuest=completeQuest; window.checkEdict=checkEdict; window.removeLibEdict=removeLibEdict;
window.toggleLibEdict=toggleLibEdict; window.removeFromLibrary=removeFromLibrary;
window.openModal=openModal; window.closeModal=closeModal; window.switchTab=switchTab; window.switchEdictSub=switchEdictSub;
window.setFocusPillar=function(p){focusPillar=p;renderFocusTab();};
window.beginFocus=function(){startTimer();renderFocusTab();};
window.pauseTimer=pauseTimer; window.resumeFocus=function(){startTimer();renderFocusTab();};
window.stopAndLog=stopAndLog; window.discardTimer=discardTimer;
window.setGraphView=function(v){graphView=v;renderFocusTab();};
window.deleteGoal=function(id){state.goals=state.goals.filter(function(g){return g.id!=id;});saveState();renderGoalsTab();};
window.openUpdateGoal=function(id){var goal=null,i;for(i=0;i<state.goals.length;i++) if(state.goals[i].id==id){goal=state.goals[i];break;}if(!goal)return;document.getElementById('update-goal-id').value=id;document.getElementById('update-goal-val').value=goal.current;openModal('update-goal');};
window.deleteDebt=function(id){state.debts=state.debts.filter(function(d){return d.id!=id;});saveState();renderTreasuryTab();};
window.openPayDebt=function(id){document.getElementById('pay-debt-id').value=id;document.getElementById('pay-debt-val').value='';openModal('pay-debt');};
window.deleteBill=function(id){state.bills=state.bills.filter(function(b){return b.id!=id;});saveState();renderTreasuryTab();};
window.setMood=function(idx){state.todayMood=idx;var bs=document.querySelectorAll('.mood-btn'),i;for(i=0;i<bs.length;i++) bs[i].classList.toggle('selected',i===idx);};
window.selectType=function(type,btn){var bs=document.querySelectorAll('.type-btn'),i;for(i=0;i<bs.length;i++) bs[i].classList.remove('active');btn.classList.add('active');document.getElementById('inscribe-target-row').style.display=type!=='checkbox'?'flex':'none';document.getElementById('inscribe-unit-row').style.display=type==='counter'?'block':'none';};

window.submitInscribe=function(){var label=document.getElementById('inscribe-label').value.trim();if(!label){showToast('Name the edict first.');return;}var ta=document.querySelector('.type-btn.active'),type=ta?ta.getAttribute('data-type'):'checkbox',skill=document.getElementById('inscribe-skill').value,xp=parseInt(document.getElementById('inscribe-xp').value)||15,target=parseInt(document.getElementById('inscribe-target').value)||1,unit=type==='duration'?'min':(document.getElementById('inscribe-unit').value||'');state.edictLibrary.push({id:'lib-'+Date.now(),label:label,type:type,skill:skill,xp:xp,target:target,unit:unit});state.activeLibraryIds.push(state.edictLibrary[state.edictLibrary.length-1].id);saveState();closeModal();renderEdictTab();showToast('Inscribed to the library');};
window.submitJournal=function(){var j=document.getElementById('journal-text').value||'',r=document.getElementById('reflect-text').value||'',xp=Math.floor((j.length>20?8:0)+(r.length>20?10:0));state.todayJournal=j;state.todayReflect=r;state.journalEntries.unshift({date:new Date().toDateString(),mood:state.todayMood,journal:j,reflect:r});state.journalEntries=state.journalEntries.slice(0,365);if(xp>0){awardXP(xp,'soul');showToast('Reflection saved · +'+xp+' SF');}else{saveState();showToast('Reflection saved');}closeModal();renderSoulTab();};
window.submitGoal=function(){var name=document.getElementById('goal-name').value.trim();if(!name)return;state.goals.push({id:Date.now(),name:name,desc:document.getElementById('goal-desc').value,current:parseFloat(document.getElementById('goal-current').value)||0,target:parseFloat(document.getElementById('goal-target').value)||100,unit:document.getElementById('goal-unit').value,skill:document.getElementById('goal-skill').value});saveState();closeModal();renderGoalsTab();showToast('Covenant sealed');};
window.submitUpdateGoal=function(){var id=parseInt(document.getElementById('update-goal-id').value),val=parseFloat(document.getElementById('update-goal-val').value),i;if(isNaN(val))return;for(i=0;i<state.goals.length;i++){if(state.goals[i].id===id){state.goals[i].current=Math.min(val,state.goals[i].target);if(state.goals[i].current>=state.goals[i].target&&!state.milestones.firstCovenant){if(!state.milestones)state.milestones={};state.milestones.firstCovenant={name:state.goals[i].name,date:new Date().toDateString()};}break;}}saveState();closeModal();renderGoalsTab();showToast('Progress recorded');};
window.submitIncome=function(){var a=parseFloat(document.getElementById('income-amount').value);if(isNaN(a))return;state.weeklyIncome.unshift({id:Date.now(),amount:a,label:document.getElementById('income-label').value||'Weekly income',date:new Date().toLocaleDateString()});state.weeklyIncome=state.weeklyIncome.slice(0,100);saveState();closeModal();renderTreasuryTab();showToast('Income recorded');};
window.submitDebt=function(){var name=document.getElementById('debt-name').value.trim(),total=parseFloat(document.getElementById('debt-total').value),remaining=parseFloat(document.getElementById('debt-remaining').value)||total,min=parseFloat(document.getElementById('debt-min').value)||0;if(!name||isNaN(total))return;state.debts.push({id:Date.now(),name:name,total:total,remaining:remaining,minPayment:min});saveState();closeModal();renderTreasuryTab();showToast('Debt recorded');};
window.submitBill=function(){var label=document.getElementById('bill-label').value.trim(),amount=parseFloat(document.getElementById('bill-amount').value),dueDay=parseInt(document.getElementById('bill-due').value)||1;if(!label||isNaN(amount))return;state.bills.push({id:Date.now(),label:label,amount:amount,dueDay:dueDay});saveState();closeModal();renderTreasuryTab();showToast('Bill bound');};
window.submitSavings=function(){var a=parseFloat(document.getElementById('savings-amount').value);if(isNaN(a))return;state.savings+=a;saveState();closeModal();renderTreasuryTab();showToast('Savings updated');};
window.submitPayDebt=function(){var id=parseInt(document.getElementById('pay-debt-id').value),a=parseFloat(document.getElementById('pay-debt-val').value),i;if(isNaN(a))return;for(i=0;i<state.debts.length;i++){if(state.debts[i].id===id){state.debts[i].remaining=Math.max(0,state.debts[i].remaining-a);break;}}saveState();closeModal();renderTreasuryTab();showToast('Payment recorded');};

/* ── BUILD UI ── */
function buildUI() {
  var nav=document.getElementById('main-nav'), i, t, btn;
  var tabs=[{id:'status',icon:'👁',label:'Status'},{id:'edicts',icon:'📜',label:'Edicts'},{id:'codex',icon:'🜏',label:'Codex'},{id:'focus',icon:'⏱',label:'Focus'},{id:'soul',icon:'✦',label:'Soul'},{id:'goals',icon:'⚔',label:'Goals'},{id:'treasury',icon:'⚖',label:'Gold'}];
  for(i=0;i<tabs.length;i++){t=tabs[i];btn=document.createElement('button');btn.className='nav-btn'+(t.id==='status'?' active':'');btn.setAttribute('data-tab',t.id);btn.innerHTML='<span class="nav-icon">'+t.icon+'</span>'+t.label;btn.setAttribute('onclick','switchTab(\''+t.id+'\')');nav.appendChild(btn);}

  var content=document.getElementById('main-content'), panel, id;
  var tabIds=['status','edicts','codex','focus','soul','goals','treasury'];
  for(i=0;i<tabIds.length;i++){id=tabIds[i];panel=document.createElement('div');panel.className='tab-panel'+(id==='status'?' active':'');panel.id='tab-'+id;
    if(id==='edicts'){panel.innerHTML='<div class="day-vessel"><div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div><div class="day-vessel-header"><div class="day-vessel-title">Today\'s Vessel</div><div class="day-vessel-count" id="vessel-count">0 / 0</div></div><div class="vessel-track"><div class="vessel-fill" id="vessel-fill" style="width:0%"></div></div><div class="vessel-labels"><div class="vessel-label">Empty</div><div class="vessel-label">Full</div></div><div class="vessel-complete" id="vessel-msg" style="display:none">The vessel is full. Azrael kept his word today.</div></div><div class="sub-tabs"><button class="sub-tab btn btn-warm" data-sub="active" onclick="switchEdictSub(\'active\')">Today</button><button class="sub-tab btn btn-ghost" data-sub="library" onclick="switchEdictSub(\'library\')">Library</button><button class="sub-tab btn btn-ghost" data-sub="missed" onclick="switchEdictSub(\'missed\')">Missed</button></div><div id="esub-active" class="edict-sub"></div><div id="esub-library" class="edict-sub" style="display:none"></div><div id="esub-missed" class="edict-sub" style="display:none"></div>';}
    content.appendChild(panel);}

  var pillarsOpts='', pk;
  for(pk in PILLARS){if(PILLARS.hasOwnProperty(pk)) pillarsOpts+='<option value="'+pk+'">'+PILLARS[pk].icon+' '+PILLARS[pk].name+'</option>';}
  var moods_html=MOODS.map(function(m,idx){return '<button class="mood-btn" onclick="setMood('+idx+')">'+m+'</button>';}).join('');

  var overlay=document.createElement('div');overlay.id='overlay';overlay.className='overlay';overlay.setAttribute('onclick','if(event.target===this)closeModal()');
  overlay.innerHTML='<div class="modal">'
    +'<div id="modal-inscribe" class="modal-content" style="display:none"><div class="modal-title">✦ Inscribe to Library</div><input id="inscribe-label" class="inp" placeholder="The edict, stated plainly..."><div class="modal-label">Type</div><div class="type-selector"><button class="type-btn active" data-type="checkbox" onclick="selectType(\'checkbox\',this)"><span class="type-btn-icon">✓</span>Task</button><button class="type-btn" data-type="duration" onclick="selectType(\'duration\',this)"><span class="type-btn-icon">⏱</span>Duration</button><button class="type-btn" data-type="counter" onclick="selectType(\'counter\',this)"><span class="type-btn-icon">#</span>Counter</button></div><div id="inscribe-target-row" class="inp-row" style="display:none;margin-bottom:8px"><input id="inscribe-target" class="inp" type="number" placeholder="Target"></div><div id="inscribe-unit-row" style="display:none"><input id="inscribe-unit" class="inp" placeholder="Unit (pages, reps...)"></div><select id="inscribe-skill" class="inp">'+pillarsOpts+'</select><input id="inscribe-xp" class="inp" type="number" placeholder="Soul Fragments reward" value="15"><div class="btn-row"><button class="btn btn-warm" onclick="submitInscribe()">Inscribe</button><button class="btn btn-ghost" onclick="closeModal()">Cancel</button></div></div>'
    +'<div id="modal-journal" class="modal-content" style="display:none"><div class="modal-title">✦ Chronicle Entry</div><div class="modal-label">Mood Today</div><div class="mood-row">'+moods_html+'</div><div class="modal-label">Journal</div><textarea id="journal-text" class="inp" placeholder="What happened today..." style="min-height:80px"></textarea><div class="modal-label" style="color:var(--s3)">◈ Reflection</div><div id="reflect-prompt-text" style="font-family:\'Crimson Pro\',serif;font-size:14px;font-style:italic;color:var(--t2);margin-bottom:8px;line-height:1.5"></div><textarea id="reflect-text" class="inp" placeholder="Answer honestly..." style="min-height:70px"></textarea><div class="btn-row"><button class="btn btn-soul" onclick="submitJournal()">Save Entry</button><button class="btn btn-ghost" onclick="closeModal()">Later</button></div></div>'
    +'<div id="modal-goal" class="modal-content" style="display:none"><div class="modal-title">✦ Seal a Covenant</div><input id="goal-name" class="inp" placeholder="Name of this covenant..."><input id="goal-desc" class="inp" placeholder="What does this mean to you..."><div class="inp-row"><input id="goal-current" class="inp" type="number" placeholder="Current"><input id="goal-target" class="inp" type="number" placeholder="Target"></div><input id="goal-unit" class="inp" placeholder="Unit (days, $, bpm...)"><select id="goal-skill" class="inp">'+pillarsOpts+'</select><div class="btn-row"><button class="btn btn-warm" onclick="submitGoal()">Seal</button><button class="btn btn-ghost" onclick="closeModal()">Cancel</button></div></div>'
    +'<div id="modal-update-goal" class="modal-content" style="display:none"><div class="modal-title">✦ Record Progress</div><input type="hidden" id="update-goal-id"><input id="update-goal-val" class="inp" type="number" placeholder="Current value..."><div class="btn-row"><button class="btn btn-warm" onclick="submitUpdateGoal()">Record</button><button class="btn btn-ghost" onclick="closeModal()">Cancel</button></div></div>'
    +'<div id="modal-income" class="modal-content" style="display:none"><div class="modal-title">✦ Log Weekly Income</div><input id="income-amount" class="inp" type="number" placeholder="Amount earned..."><input id="income-label" class="inp" placeholder="Notes (optional)"><div class="btn-row"><button class="btn btn-grn" onclick="submitIncome()">Log</button><button class="btn btn-ghost" onclick="closeModal()">Cancel</button></div></div>'
    +'<div id="modal-debt" class="modal-content" style="display:none"><div class="modal-title">✦ Record Debt</div><input id="debt-name" class="inp" placeholder="Debt name..."><div class="inp-row"><input id="debt-total" class="inp" type="number" placeholder="Total owed"><input id="debt-remaining" class="inp" type="number" placeholder="Remaining"></div><input id="debt-min" class="inp" type="number" placeholder="Min monthly payment"><div class="btn-row"><button class="btn btn-burg" onclick="submitDebt()">Record</button><button class="btn btn-ghost" onclick="closeModal()">Cancel</button></div></div>'
    +'<div id="modal-pay-debt" class="modal-content" style="display:none"><div class="modal-title">✦ Record Payment</div><input type="hidden" id="pay-debt-id"><input id="pay-debt-val" class="inp" type="number" placeholder="Amount paid..."><div class="btn-row"><button class="btn btn-burg" onclick="submitPayDebt()">Record</button><button class="btn btn-ghost" onclick="closeModal()">Cancel</button></div></div>'
    +'<div id="modal-bill" class="modal-content" style="display:none"><div class="modal-title">✦ Bind Bill</div><input id="bill-label" class="inp" placeholder="Bill name..."><div class="inp-row"><input id="bill-amount" class="inp" type="number" placeholder="Monthly amount"><input id="bill-due" class="inp" type="number" placeholder="Due day" value="1"></div><div class="btn-row"><button class="btn btn-warm" onclick="submitBill()">Bind</button><button class="btn btn-ghost" onclick="closeModal()">Cancel</button></div></div>'
    +'<div id="modal-savings" class="modal-content" style="display:none"><div class="modal-title">✦ Add Savings</div><input id="savings-amount" class="inp" type="number" placeholder="Amount to add..."><div class="btn-row"><button class="btn btn-grn" onclick="submitSavings()">Add</button><button class="btn btn-ghost" onclick="closeModal()">Cancel</button></div></div>'
    +'</div>';
  document.body.appendChild(overlay);
}

/* ── INIT ── */
function init() {
  try {
    loadState();
    checkDailyReset();
    buildUI();
    renderAll();
    var el=document.getElementById('sf-display');
    if(el) el.textContent=state.xp+' SF';
    setTimeout(function(){var loading=document.getElementById('loading');if(loading) loading.style.display='none';},500);
  } catch(err) {
    var loading=document.getElementById('loading');
    if(loading) loading.innerHTML='<div style="font-family:\'Cinzel Decorative\',serif;color:#9a2838;font-size:11px;letter-spacing:2px;text-align:center;padding:20px">Error loading.<br><br><button onclick="localStorage.clear();location.reload()" style="background:rgba(154,40,56,0.1);border:1px solid rgba(154,40,56,0.3);color:#9a2838;font-family:\'Cinzel\',serif;font-size:9px;letter-spacing:2px;padding:10px 20px;cursor:pointer;border-radius:4px;margin-top:10px">Clear & Restart</button></div>';
    if(console&&console.error) console.error('Azrael init error:',err);
  }
}

if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init);}else{init();}
