/* ═══════════════════════════════════════════════════════
AZRAEL’S CHRONICLE
“All power flows from the soul, not the ego.”
═══════════════════════════════════════════════════════ */

/* ── CONSTANTS ── */
const STORAGE_KEY = ‘azrael-chronicle-v1’;
const LEVEL_CAP = 20;
const SKILL_PTS_PER_RANK = 80; // harder to rank up — unlimited ceiling
const DAYS = [‘Sun’,‘Mon’,‘Tue’,‘Wed’,‘Thu’,‘Fri’,‘Sat’];
const MOODS = [‘💀’,‘😔’,‘😐’,‘🙂’,‘✨’];

/*
XP CURVE — 20 levels, early fast, late brutal
Level 1-5:   ~300-600 SF each  (days to a few weeks)
Level 6-10:  ~800-2000 SF each (weeks to months)
Level 11-15: ~3000-8000 SF each (several months each)
Level 16-20: ~12000-40000 SF each (many months to a year+)

Formula: XP to reach level N = floor(BASE * EXPONENT^(N-1))
Base=300, Exponent=1.55 gives this arc.

Cumulative SF to hit each level:
L1→L2:   300       total: 300
L2→L3:   465       total: 765
L3→L4:   720       total: 1,485
L4→L5:   1,116     total: 2,601
L5→L6:   1,730     total: 4,331
L6→L7:   2,681     total: 7,012
L7→L8:   4,155     total: 11,167
L8→L9:   6,440     total: 17,607
L9→L10:  9,982     total: 27,589
L10→L11: 15,472    total: 43,061
L11→L12: 23,982    total: 67,043
L12→L13: 37,172    total: 104,215
L13→L14: 57,616    total: 161,831
L14→L15: 89,305    total: 251,136
L15→L16: 138,422   total: 389,558
…and so on to 20

A solid day = ~60-120 SF
So level 10 ≈ 27,589 SF ÷ ~90/day ≈ 300 days (~10 months)
Level 20 is years of real sustained work.
*/
const XP_BASE = 300;
const XP_EXPONENT = 1.55;

const PILLARS = {
comp:  { name:‘The Composition’, short:‘COMP’,  icon:‘🎹’, stripeClass:‘stripe-comp’,  sbClass:‘sb-comp’,  chipClass:‘ch-comp’,  fillClass:‘fill-comp’,  libClass:‘stripe-comp’,  weight:1.0, desc:‘Dissolving into the music’ },
labor: { name:‘The Labor’,       short:‘LABOR’, icon:‘⚒️’, stripeClass:‘stripe-labor’, sbClass:‘sb-labor’, chipClass:‘ch-labor’, fillClass:‘fill-labor’, libClass:‘stripe-labor’, weight:0.9, desc:‘Work without need for recognition’ },
treas: { name:‘The Treasury’,    short:‘TREAS’, icon:‘💰’, stripeClass:‘stripe-treas’, sbClass:‘sb-treas’, chipClass:‘ch-treas’, fillClass:‘fill-treas’, libClass:‘stripe-treas’, weight:0.8, desc:‘Removing chaos, not accumulating’ },
vigil: { name:‘The Vigil’,       short:‘VIGIL’, icon:‘📖’, stripeClass:‘stripe-vigil’, sbClass:‘sb-vigil’, chipClass:‘ch-vigil’, fillClass:‘fill-vigil’, libClass:‘stripe-vigil’, weight:0.9, desc:‘Clarity without ego's filter’ },
soul:  { name:‘The Soul’,        short:‘SOUL’,  icon:‘✦’,  stripeClass:‘stripe-soul’,  sbClass:‘sb-soul’,  chipClass:‘ch-soul’,  fillClass:‘fill-soul’,  libClass:‘stripe-soul’,  weight:1.3, desc:‘Source of all power. Ego dissolution.’ },
};

const RANKS = [
‘The Condemned’,       // 1
‘The Condemned’,       // 2 - still in the dark
‘Hollow Spirit’,       // 3
‘Hollow Spirit’,       // 4
‘Wandering Shade’,     // 5 - first real shift
‘Awakening Fallen’,    // 6
‘Seeker of the Void’,  // 7
‘Bearer of Ash’,       // 8
‘One Who Remembers’,   // 9
‘The Unbroken’,        // 10 - first major milestone
‘Keeper of the Codex’, // 11
‘Keeper of the Codex’, // 12
‘Grimoire Ascendant’,  // 13
‘Grimoire Ascendant’,  // 14
‘Sovereign of Ash’,    // 15 - second major milestone
‘Sovereign of Ash’,    // 16
‘Between Worlds’,      // 17
‘Between Worlds’,      // 18
‘The Eternal’,         // 19
‘The Eternal’,         // 20 - the ceiling
];

const SKILL_MILESTONE_RANKS = [5, 10, 15, 20];

const PILLAR_RANK_TITLES = {
comp:  { 5:‘Apprentice of Sound’, 10:‘Voice of the Instrument’, 15:‘One Who Disappears Into Music’, 20:‘The Music Itself’ },
labor: { 5:‘Worker Without Complaint’, 10:‘Bearer of the Unseen Load’, 15:‘Strength Without Ego’, 20:‘The Body That Endures’ },
treas: { 5:‘Keeper of the Ledger’, 10:‘Free of Financial Chaos’, 15:‘Steward of the Vault’, 20:‘Master of the Flow’ },
vigil: { 5:‘Student of the Mind’, 10:‘Seeker of Clarity’, 15:‘The Undistracted’, 20:‘Clarity Without Effort’ },
soul:  { 5:‘Aware of the Ego’, 10:‘Dimmer of the Ego’, 15:‘Vessel of the Soul’, 20:‘Ego Dissolved’ },
};

const SKILL_RANK_UNLOCKS = {
comp:  { 5:‘Stretch goals for The Composition now escalate.’, 10:‘Reflection prompts reach deeper into the creative soul.’, 15:‘Advanced composition challenges unlock.’, 20:‘You do not play music. You become it.’ },
labor: { 5:‘Physical stretch goals now push harder.’, 10:‘Labor edicts carry heavier requirements.’, 15:‘The body has become an instrument of discipline.’, 20:‘You work without self. The task is the teacher.’ },
treas: { 5:‘Financial tracking deepens. The numbers no longer hide.’, 10:‘Debt and savings goals show advanced projections.’, 15:‘Financial chaos is behind you.’, 20:‘Money is a tool. You are its master.’ },
vigil: { 5:‘Study prompts now go deeper.’, 10:‘The Vigil demands real output — not just reading.’, 15:‘Clarity arrives without effort.’, 20:‘You see through the noise without trying.’ },
soul:  { 5:‘Reflection prompts escalate to Tier 2.’, 10:‘Reflection prompts escalate to Tier 3.’, 15:‘The ego is quiet. The soul begins to speak clearly.’, 20:‘All powers flow freely. The ego no longer leads.’ },
};

const REFLECT_PROMPTS = [
[‘What did your ego want today that your soul didn't need?’,‘Name one moment today when you were fully present.’,‘What did you avoid today, and why?’,‘What emotion showed up today that you didn't choose?’],
[‘Describe a moment today where you responded instead of reacted.’,‘What pattern showed up again today that you recognize?’,‘What did you do today that required no external validation?’,‘What would your soul have done differently than your ego did?’],
[‘What part of your ego died a little today?’,‘When did the music play itself — where did you disappear?’,‘What truth are you still protecting yourself from?’,‘What would Azrael do that Brenden is still afraid to?’],
];

const CORE_EDICTS = [
{ id:‘core-piano’, label:‘Observe 45 minutes at the instrument. Let nothing interrupt.’, xp:20, skill:‘comp’, type:‘duration’, target:45, unit:‘min’, isCore:true, days:[] },
{ id:‘core-labor’, label:‘Account for the body's labor today. Hours worked. Something carried.’, xp:12, skill:‘labor’, type:‘checkbox’, target:1, unit:’’, isCore:true, days:[] },
{ id:‘core-soul’,  label:‘Tend to the soul. Time given. Something written.’, xp:16, skill:‘soul’, type:‘duration’, target:15, unit:‘min’, isCore:true, days:[], requiresNote:true },
];

const STRETCH_POOLS = {
physical: [
{ label:‘Walk for 20 minutes. No phone.’, xp:12, skill:‘labor’, type:‘checkbox’ },
{ label:‘Do 50 push-ups before the day ends.’, xp:14, skill:‘labor’, type:‘counter’, target:50, unit:‘reps’ },
{ label:‘30 minutes of deliberate physical movement.’, xp:16, skill:‘labor’, type:‘duration’, target:30, unit:‘min’ },
{ label:‘Work until your body asks you to stop. Then do more.’, xp:18, skill:‘labor’, type:‘checkbox’ },
{ label:‘Do the most demanding physical task available today.’, xp:20, skill:‘labor’, type:‘checkbox’ },
],
financial: [
{ label:‘Move money toward a debt or savings. Any amount.’, xp:12, skill:‘treas’, type:‘checkbox’ },
{ label:‘Review every bill and find one thing to cut.’, xp:14, skill:‘treas’, type:‘checkbox’ },
{ label:‘Calculate your exact net worth today.’, xp:16, skill:‘treas’, type:‘checkbox’ },
{ label:‘Log every dollar spent today before midnight.’, xp:14, skill:‘treas’, type:‘checkbox’ },
{ label:‘Make a payment on your smallest debt.’, xp:18, skill:‘treas’, type:‘checkbox’ },
],
creative: [
{ label:‘Compose at least four bars of original music.’, xp:20, skill:‘comp’, type:‘checkbox’ },
{ label:‘Record something — rough, imperfect, done.’, xp:22, skill:‘comp’, type:‘checkbox’ },
{ label:‘Practice one piece until it plays itself through you.’, xp:18, skill:‘comp’, type:‘duration’, target:30, unit:‘min’ },
{ label:‘Finish something musical you started and left incomplete.’, xp:24, skill:‘comp’, type:‘checkbox’ },
{ label:‘Play with your eyes closed for 15 minutes.’, xp:18, skill:‘comp’, type:‘duration’, target:15, unit:‘min’ },
],
soul_s: [
{ label:‘Sit in complete silence for 10 minutes. No input.’, xp:18, skill:‘soul’, type:‘duration’, target:10, unit:‘min’ },
{ label:‘Notice the moment your ego wants credit. Do not take it.’, xp:20, skill:‘soul’, type:‘checkbox’ },
{ label:‘Write one true sentence about who you actually are.’, xp:18, skill:‘soul’, type:‘checkbox’ },
{ label:‘Identify one pattern your ego ran today. Name it.’, xp:20, skill:‘soul’, type:‘checkbox’ },
{ label:‘Give Willow one hour of your full undivided presence.’, xp:18, skill:‘soul’, type:‘duration’, target:60, unit:‘min’ },
],
};

const QUESTS = [
{ text:‘Play piano for 45 minutes. No phone. Let the music lead.’, skill:‘comp’, xp:28 },
{ text:‘Work today in complete silence. Just the labor and your thoughts.’, skill:‘labor’, xp:22 },
{ text:‘Sit still for 10 minutes and do nothing. Notice every impulse.’, skill:‘soul’, xp:30 },
{ text:‘Compose something. Even one bar. Finish it tonight.’, skill:‘comp’, xp:25 },
{ text:‘Do something physically demanding that nobody will know about.’, skill:‘labor’, xp:20 },
{ text:‘Notice the next time your ego wants credit. Don't take it.’, skill:‘soul’, xp:32 },
{ text:‘Practice one passage until you disappear into it entirely.’, skill:‘comp’, xp:26 },
{ text:‘Write one true sentence about who you actually are right now.’, skill:‘soul’, xp:28 },
{ text:‘Give Willow one uninterrupted hour. Be fully present.’, skill:‘soul’, xp:22 },
{ text:‘Calculate your exact net worth today. Write it down.’, skill:‘treas’, xp:22 },
{ text:‘Do the hardest task on your list first. Before anything else.’, skill:‘vigil’, xp:24 },
{ text:‘Identify one way your ego ran the show today. Write it.’, skill:‘soul’, xp:30 },
{ text:‘Fix something at work everyone else ignored. Don't mention it.’, skill:‘labor’, xp:22 },
{ text:‘Record every dollar that moved today. Face the full number.’, skill:‘treas’, xp:18 },
{ text:‘At the end of today — did Azrael act like who he is becoming?’, skill:‘soul’, xp:30 },
{ text:‘Play piano with your eyes closed. Trust what your hands know.’, skill:‘comp’, xp:24 },
{ text:‘Move money toward a debt or savings. The act matters.’, skill:‘treas’, xp:16 },
{ text:‘Read something that challenges how you see yourself.’, skill:‘vigil’, xp:20 },
{ text:‘Say no to one thing that drains you. No explanation needed.’, skill:‘vigil’, xp:18 },
{ text:‘Carry something heavy today — at work, at home, in yourself.’, skill:‘labor’, xp:16 },
];

/* ── STATE ── */
const DEFAULT_STATE = {
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
pendingMiss: [],
journalEntries: [],
todayMood: null,
todayJournal: ‘’,
todayReflect: ‘’,
weeklyIncome: [],
savings: 0,
savingsGoal: 5000,
bills: [],
debts: [],
goals: [],
focusLog: [],
milestones: {},
};

let state = { …DEFAULT_STATE };

/* ── PERSISTENCE ── */
function loadState() {
try {
const raw = localStorage.getItem(STORAGE_KEY);
if (raw) {
const saved = JSON.parse(raw);
state = { …DEFAULT_STATE, …saved };
}
} catch(e) { console.warn(‘Load error:’, e); }
}

function saveState() {
try {
localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
} catch(e) { console.warn(‘Save error:’, e); }
}

/* ── CALCULATIONS ── */
function xpToNextLevel(level) {
if (level >= LEVEL_CAP) return Infinity; // capped at 20
return Math.floor(XP_BASE * Math.pow(XP_EXPONENT, level - 1));
}

function getLevel(totalXP) {
let level = 1, remaining = totalXP;
while (level < LEVEL_CAP && remaining >= xpToNextLevel(level)) {
remaining -= xpToNextLevel(level);
level++;
}
if (level >= LEVEL_CAP) {
return { level: LEVEL_CAP, currentXP: remaining, toNext: null, maxed: true };
}
return { level, currentXP: remaining, toNext: xpToNextLevel(level) };
}

// Cumulative XP needed to reach a given level
function xpForLevel(target) {
let total = 0;
for (let l = 1; l < target; l++) total += xpToNextLevel(l);
return total;
}

function skillRank(pts) { return Math.floor(pts / SKILL_PTS_PER_RANK) + 1; }
function skillPct(pts)  { return ((pts % SKILL_PTS_PER_RANK) / SKILL_PTS_PER_RANK) * 100; }

// Soul power now scales to rank 20 of Soul pillar (20 * 80 = 1600 SF max)
function soulPower(pts) { return Math.min(Math.floor((pts / 1600) * 100), 100); }

// Check if a skill just hit a milestone rank - call after awarding XP
function checkSkillMilestone(skill, oldPts, newPts) {
const oldRank = Math.floor(oldPts / SKILL_PTS_PER_RANK) + 1;
const newRank = Math.floor(newPts / SKILL_PTS_PER_RANK) + 1;
if (newRank > oldRank) {
// New rank reached
if (SKILL_MILESTONE_RANKS.includes(newRank)) {
return { rank: newRank, title: PILLAR_RANK_TITLES[skill]?.[newRank], unlock: SKILL_RANK_UNLOCKS[skill]?.[newRank] };
}
return { rank: newRank, title: null, unlock: null };
}
return null;
}

// Check if overall level just changed
function checkLevelUp(oldXP, newXP) {
const oldLvl = getLevel(oldXP).level;
const newLvl = getLevel(newXP).level;
return newLvl > oldLvl ? { from: oldLvl, to: newLvl } : null;
}

function daysSince(dateStr) {
if (!dateStr) return 0;
return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function getDailyQuest() {
const today = new Date().toDateString();
let h = 0;
for (let i = 0; i < today.length; i++) h = (h * 31 + today.charCodeAt(i)) & 0xffffffff;
return { …QUESTS[Math.abs(h) % QUESTS.length], date: today };
}

function getDayStretches(date, level) {
let h = 0;
for (let i = 0; i < date.length; i++) h = (h * 31 + date.charCodeAt(i)) & 0xffffffff;
const pools = Object.values(STRETCH_POOLS);
return pools.map((pool, i) => {
const idx = Math.abs(h + (i * 7)) % pool.length;
const bonus = Math.floor(level / 3);
const base = pool[idx];
return {
…base,
id: `stretch-${date}-${i}`,
isStretch: true,
xp: (base.xp || 12) + bonus,
days: [],
target: base.target || 1,
unit: base.unit || ‘’,
};
});
}

function getReflectPrompt(soulRank, dayOfYear) {
const tier = soulRank <= 2 ? 0 : soulRank <= 4 ? 1 : 2;
const pool = REFLECT_PROMPTS[tier];
return pool[dayOfYear % pool.length];
}

function formatTime(seconds) {
const h = Math.floor(seconds / 3600);
const m = Math.floor((seconds % 3600) / 60);
const s = seconds % 60;
return h > 0
? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
: `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function formatMins(mins) {
if (mins < 1) return ‘’;
if (mins < 60) return `${Math.round(mins)}m`;
return `${Math.floor(mins/60)}h ${Math.round(mins%60)}m`;
}

/* ── DAILY RESET ── */
function checkDailyReset() {
const today = new Date().toDateString();
if (state.lastReset !== today) {
const wasYesterday = state.lastCheckin === new Date(Date.now() - 86400000).toDateString();
const newStreak = wasYesterday ? state.streak + 1 : 0;

```
// Record any unresolved missed cores
if (state.lastReset && state.pendingMiss.length > 0) {
  state.pendingMiss.forEach(eid => {
    if (!state.missedCore.find(m => m.date === state.lastReset && m.edictId === eid)) {
      state.missedCore.push({ date: state.lastReset, edictId: eid, label: CORE_EDICTS.find(c=>c.id===eid)?.label || eid, note: '[No explanation given]' });
    }
  });
}

state.dailyDone = [];
state.questDone = false;
state.edictProgress = {};
state.lastReset = today;
state.todayMood = null;
state.todayJournal = '';
state.todayReflect = '';
state.pendingMiss = [];
state.streak = newStreak;
state.longestStreak = Math.max(state.longestStreak || 0, newStreak);
saveState();
```

}
}

/* ── XP / SKILLS ── */
function awardXP(amount, skill, today) {
const oldXP = state.xp;
const oldSkillPts = state.skills[skill] || 0;

state.xp += amount;
state.skills[skill] = oldSkillPts + amount;

if (state.lastCheckin !== today) {
state.streak = state.streak + 1;
state.longestStreak = Math.max(state.longestStreak || 0, state.streak);
state.lastCheckin = today;
}

// Check level up
const lvlUp = checkLevelUp(oldXP, state.xp);
if (lvlUp) {
const newTitle = RANKS[lvlUp.to - 1];
const oldTitle = RANKS[lvlUp.from - 1];
if (newTitle !== oldTitle) {
// Title changed — queue a special notification
state._pendingLevelUp = { from: lvlUp.from, to: lvlUp.to, title: newTitle };
} else {
state._pendingLevelUp = { from: lvlUp.from, to: lvlUp.to, title: null };
}
}

// Check skill milestone
const milestone = checkSkillMilestone(skill, oldSkillPts, state.skills[skill]);
if (milestone && (milestone.title || milestone.unlock)) {
state._pendingMilestone = { skill, …milestone };
// Record in milestones history
if (!state.milestones) state.milestones = {};
const key = `${skill}-rank-${milestone.rank}`;
if (!state.milestones[key]) {
state.milestones[key] = { date: today, rank: milestone.rank, title: milestone.title };
}
}

saveState();
}

// Show any pending level up or milestone notifications
function showPendingNotifications() {
if (state._pendingLevelUp) {
const lu = state._pendingLevelUp;
delete state._pendingLevelUp;
if (lu.title) {
setTimeout(() => showLevelUpModal(lu), 400);
} else {
showToast();
}
}
if (state._pendingMilestone) {
const ms = state._pendingMilestone;
delete state._pendingMilestone;
setTimeout(() => showMilestoneModal(ms), state._pendingLevelUp ? 2000 : 400);
}
}

function showLevelUpModal(lu) {
const overlay = document.getElementById(‘overlay’);
const modal = document.getElementById(‘modal-levelup’);
if (!modal) return;
document.getElementById(‘levelup-from’).textContent = lu.from;
document.getElementById(‘levelup-to’).textContent = lu.to;
document.getElementById(‘levelup-title’).textContent = lu.title;
document.querySelectorAll(’.modal-content’).forEach(m => m.style.display = ‘none’);
modal.style.display = ‘block’;
overlay.classList.add(‘open’);
}

function showMilestoneModal(ms) {
const overlay = document.getElementById(‘overlay’);
const modal = document.getElementById(‘modal-milestone’);
if (!modal) return;
document.getElementById(‘milestone-pillar’).textContent = PILLARS[ms.skill].icon + ’ ’ + PILLARS[ms.skill].name;
document.getElementById(‘milestone-rank’).textContent = ‘Rank ’ + ms.rank;
document.getElementById(‘milestone-title’).textContent = ms.title || ‘’;
document.getElementById(‘milestone-unlock’).textContent = ms.unlock || ‘’;
document.querySelectorAll(’.modal-content’).forEach(m => m.style.display = ‘none’);
modal.style.display = ‘block’;
overlay.classList.add(‘open’);
}

/* ── EDICT LOGIC ── */
function completeEdict(edict) {
const today = new Date().toDateString();
if (state.dailyDone.includes(edict.id)) return;
state.dailyDone.push(edict.id);
state.edictProgress[edict.id] = edict.target || 1;
awardXP(edict.xp, edict.skill, today);
showToast(`+${edict.xp} Soul Fragments`);
render();
}

function updateEdictProgress(edict, value) {
const prev = state.edictProgress[edict.id] || 0;
const wasComplete = prev >= edict.target;
state.edictProgress[edict.id] = value;

if (value >= edict.target && !wasComplete && !state.dailyDone.includes(edict.id)) {
const today = new Date().toDateString();
state.dailyDone.push(edict.id);
awardXP(edict.xp, edict.skill, today);
showToast(`+${edict.xp} Soul Fragments ✦`);
render();
} else {
saveState();
// Update just the slider display without full re-render for performance
updateSliderDisplay(edict.id, value, edict);
}
}

function updateSliderDisplay(edictId, value, edict) {
const card = document.querySelector(`[data-edict-id="${edictId}"]`);
if (!card) return;
const pct = Math.min((value / edict.target) * 100, 100);
const atGoal = value >= edict.target;

const fill = card.querySelector(’.slider-track-fill’);
const thumb = card.querySelector(’.slider-thumb’);
const dot = card.querySelector(’.slider-dot’);
const curr = card.querySelector(’.slider-current’);
const partial = card.querySelector(’.partial-earned span’);

if (fill) { fill.style.width = pct + ‘%’; fill.className = `slider-track-fill ${atGoal ? 'fill-gold' : PILLARS[edict.skill].fillClass}`; }
if (thumb) { thumb.style.left = Math.min(pct, 98) + ‘%’; thumb.className = `slider-thumb ${atGoal ? 'at-goal' : ''}`; }
if (dot) dot.className = `slider-dot ${atGoal ? 'at-goal' : ''}`;
if (curr) { curr.textContent = value; curr.className = `slider-current ${atGoal ? 'at-goal' : ''}`; }
if (partial) {
const earned = Math.round((Math.min(value, edict.target) / edict.target) * edict.xp);
if (partial.parentElement) partial.parentElement.style.display = (!atGoal && value > 0) ? ‘block’ : ‘none’;
partial.textContent = `+${earned} SF`;
}
}

function recordMissedCore(edictId, note) {
const today = new Date().toDateString();
state.missedCore.push({ date: today, edictId, label: CORE_EDICTS.find(c=>c.id===edictId)?.label || edictId, note });
state.pendingMiss = state.pendingMiss.filter(id => id !== edictId);
state.dailyDone.push(edictId + ‘_missed’);
saveState();
showToast(‘Absence recorded’);
render();
}

/* ── QUEST ── */
function completeQuest() {
if (state.questDone) return;
const quest = getDailyQuest();
const today = new Date().toDateString();
state.questDone = true;
awardXP(quest.xp, quest.skill, today);
showToast(`Quest complete · +${quest.xp} SF`);
render();
}

/* ── FOCUS TIMER ── */
let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;
let currentFocusPillar = ‘comp’;

function startTimer() {
timerRunning = true;
timerInterval = setInterval(() => {
timerSeconds++;
updateTimerDisplay();
}, 1000);
}

function pauseTimer() {
timerRunning = false;
clearInterval(timerInterval);
updateTimerDisplay();
}

function stopAndLogTimer() {
clearInterval(timerInterval);
timerRunning = false;
if (timerSeconds < 60) { timerSeconds = 0; render(); return; }
const mins = timerSeconds / 60;
const earned = Math.floor(mins / 5) * 3;
const today = new Date().toDateString();
state.focusLog.push({ skill: currentFocusPillar, minutes: mins, date: today });
if (earned > 0) awardXP(earned, currentFocusPillar, today);
showToast(`${formatMins(mins)} logged · +${earned} SF`);
timerSeconds = 0;
render();
}

function discardTimer() {
clearInterval(timerInterval);
timerRunning = false;
timerSeconds = 0;
render();
}

function updateTimerDisplay() {
const el = document.querySelector(’.timer-clock’);
if (el) el.textContent = formatTime(timerSeconds);
const earned = document.querySelector(’.timer-earned’);
if (earned) earned.textContent = `✦ +${Math.floor((timerSeconds/60)/5)*3} SF earned`;
}

/* ── JOURNAL ── */
function saveJournal() {
const journalText = document.getElementById(‘journal-text’)?.value || ‘’;
const reflectText = document.getElementById(‘reflect-text’)?.value || ‘’;
const xpEarned = Math.floor((journalText.length > 20 ? 8 : 0) + (reflectText.length > 20 ? 10 : 0));

state.todayJournal = journalText;
state.todayReflect = reflectText;
state.journalEntries.unshift({ date: new Date().toDateString(), mood: state.todayMood, journal: journalText, reflect: reflectText });
state.journalEntries = state.journalEntries.slice(0, 365);

if (xpEarned > 0) {
const today = new Date().toDateString();
awardXP(xpEarned, ‘soul’, today);
showToast(`Reflection saved · +${xpEarned} SF`);
} else {
saveState();
showToast(‘Reflection saved’);
}
closeModal();
render();
}

/* ── TOAST ── */
let toastTimeout;
function showToast(msg) {
const el = document.getElementById(‘toast’);
if (!el) return;
el.textContent = msg;
el.classList.add(‘show’);
clearTimeout(toastTimeout);
toastTimeout = setTimeout(() => el.classList.remove(‘show’), 2800);
}

/* ── MODAL ── */
let activeModal = null;
function openModal(id) {
activeModal = id;
const overlay = document.getElementById(‘overlay’);
const modal = document.getElementById(‘modal-’ + id);
if (!overlay || !modal) return;
document.querySelectorAll(’.modal-content’).forEach(m => m.style.display = ‘none’);
modal.style.display = ‘block’;
overlay.classList.add(‘open’);
}

function closeModal() {
activeModal = null;
const overlay = document.getElementById(‘overlay’);
if (overlay) overlay.classList.remove(‘open’);
}

/* ── NAVIGATION ── */
let currentTab = ‘status’;
let currentEdictSubTab = ‘active’;

function switchTab(tabId) {
currentTab = tabId;
document.querySelectorAll(’.nav-btn’).forEach(b => b.classList.toggle(‘active’, b.dataset.tab === tabId));
document.querySelectorAll(’.tab-panel’).forEach(p => p.classList.toggle(‘active’, p.id === ‘tab-’ + tabId));
}

function switchEdictSubTab(tabId) {
currentEdictSubTab = tabId;
document.querySelectorAll(’.sub-tab’).forEach(b => b.classList.toggle(‘btn-warm’, b.dataset.subtab === tabId));
document.querySelectorAll(’.sub-tab’).forEach(b => b.classList.toggle(‘btn-ghost’, b.dataset.subtab !== tabId));
document.querySelectorAll(’.edict-sub-panel’).forEach(p => p.classList.toggle(‘active’, p.id === ‘edict-sub-’ + tabId));
document.querySelectorAll(’.edict-sub-panel’).forEach(p => p.style.display = p.id === ‘edict-sub-’ + tabId ? ‘block’ : ‘none’);
}

/* ── RENDERING ── */

function renderChip(pillar) {
return `<span class="chip ${PILLARS[pillar].chipClass}">${PILLARS[pillar].icon} ${PILLARS[pillar].short}</span>`;
}

function renderTypeBadge(edict) {
if (edict.type === ‘checkbox’) return `<span class="edict-type-badge">✓ task</span>`;
if (edict.type === ‘duration’) return `<span class="edict-type-badge">⏱ ${edict.target}${edict.unit}</span>`;
return `<span class="edict-type-badge"># ${edict.target} ${edict.unit}</span>`;
}

function renderSlider(edict) {
const progress = state.edictProgress[edict.id] || 0;
const pct = Math.min((progress / edict.target) * 100, 100);
const atGoal = progress >= edict.target;
const earned = Math.round((Math.min(progress, edict.target) / edict.target) * edict.xp);
const pl = PILLARS[edict.skill];

let ticks = ‘’;
if (edict.type === ‘duration’) {
const ts = [0, Math.round(edict.target*0.25), Math.round(edict.target*0.5), Math.round(edict.target*0.75), edict.target];
ticks = `<div class="slider-ticks">${ts.map((t,i) => `<span class="slider-tick">${t}${i===ts.length-1?edict.unit:’’}</span>`).join('')}</div>`;
} else if (edict.type === ‘counter’) {
const ts = [0, Math.round(edict.target/2), edict.target];
ticks = `<div class="slider-ticks">${ts.map((t,i) => `<span class="slider-tick">${t}${i===ts.length-1?edict.unit:’’}</span>`).join('')}</div>`;
}

return `<div class="slider-section"> <div class="slider-progress-row"> <div> <span class="slider-current ${atGoal?'at-goal':''}">${progress}</span> <span class="slider-unit">${edict.unit}</span> </div> <span class="slider-target">of ${edict.target}${edict.unit}</span> </div> <div class="slider-wrap"> <div class="slider-track-bg"> <div class="slider-track-fill ${atGoal?'fill-gold':pl.fillClass}" style="width:${pct}%"></div> </div> <div class="slider-thumb ${atGoal?'at-goal':''}" style="left:${Math.min(pct,98)}%"> <div class="slider-dot ${atGoal?'at-goal':''}"></div> </div> <input type="range" class="slider-input" min="0" max="${edict.target}" step="1" value="${progress}" data-edict-id="${edict.id}" ${state.dailyDone.includes(edict.id)?'disabled':''}> </div> ${ticks} <div class="partial-earned" style="display:${!atGoal&&progress>0?'block':'none'}"> Progress earns <span>+${earned} SF</span> </div> </div>`;
}

function renderEdictCard(edict) {
const pl = PILLARS[edict.skill];
const progress = state.edictProgress[edict.id] || 0;
const done = state.dailyDone.includes(edict.id) || (edict.type !== ‘checkbox’ && progress >= edict.target);
const isMissed = state.pendingMiss.includes(edict.id) || (state.missedCore.some(m => m.date === new Date().toDateString() && m.edictId === edict.id));
const atGoal = done || (edict.type !== ‘checkbox’ && progress >= edict.target);

// Check day filter
const todayIdx = new Date().getDay();
if (edict.days && edict.days.length > 0 && !edict.days.includes(todayIdx)) return ‘’;

const soulNote = edict.requiresNote && done ? `<div class="soul-note-label">What was tended to</div> <textarea class="soul-note-input" placeholder="What did the soul receive today..." rows="3" data-soul-note="${edict.id}"></textarea>` : ‘’;

const missExplain = isMissed && edict.isCore && !state.missedCore.find(m => m.date === new Date().toDateString() && m.edictId === edict.id) ? `<div class="miss-explain"> <div class="miss-label">Explain the absence. One honest sentence.</div> <input class="miss-input" placeholder="Why it didn't happen..." data-miss-id="${edict.id}"> <button class="miss-submit" onclick="submitMiss('${edict.id}')">Record & Close</button> </div>` : ‘’;

const checkbox = edict.type === ‘checkbox’ ? `<div class="edict-checkbox ${done?'checked':''}" onclick="handleEdictCheck('${edict.id}')"> ${done ? '<span class="check-mark">✦</span>' : isMissed ? '<span class="miss-mark">✕</span>' : ''} </div>` : ‘’;

const slider = edict.type !== ‘checkbox’ && !isMissed ? renderSlider(edict) : ‘’;

const delBtn = !edict.isCore ? `<button class="edict-del" onclick="deleteLibEdict('${edict.id}')">remove</button>` : ‘’;

return `<div class="edict-card ${edict.isCore?'is-core':''} ${atGoal?'is-done':''} ${isMissed?'is-missed':''}" data-edict-id="${edict.id}"> <div class="edict-stripe ${pl.stripeClass}"></div> ${edict.isCore ? '<div class="core-badge">◈ Core</div>' : '<div class="stretch-badge">✦ Stretch</div>'} <div class="edict-inner"> <div class="edict-top"> ${checkbox} <div class="edict-main"> <div class="edict-label ${atGoal?'done-text':''}">${edict.label}</div> <div class="edict-meta"> ${renderChip(edict.skill)} ${renderTypeBadge(edict)} <span class="edict-xp-tag">${atGoal?'✦ ':'+'} ${edict.xp} SF</span> </div> </div> </div> ${slider} ${soulNote} ${missExplain} ${delBtn} </div> </div>`;
}

function handleEdictCheck(edictId) {
const edict = […CORE_EDICTS, …state.edictLibrary.filter(e => state.activeLibraryIds.includes(e.id))].find(e => e.id === edictId);
if (!edict) return;
if (state.dailyDone.includes(edictId)) return;
completeEdict(edict);
}

function submitMiss(edictId) {
const input = document.querySelector(`[data-miss-id="${edictId}"]`);
if (!input || !input.value.trim()) { showToast(‘Write what happened first.’); return; }
recordMissedCore(edictId, input.value.trim());
}

function deleteLibEdict(edictId) {
state.activeLibraryIds = state.activeLibraryIds.filter(id => id !== edictId);
saveState();
render();
}

/* ── GRAPH ── */
let graphView = ‘week’;

function renderGraph() {
const now = new Date();
let data = [];

if (graphView === ‘week’) {
for (let i = 6; i >= 0; i–) {
const d = new Date(now); d.setDate(d.getDate() - i);
const total = state.focusLog.filter(l => l.date === d.toDateString()).reduce((a,l) => a+l.minutes, 0);
data.push({ label: [‘Su’,‘Mo’,‘Tu’,‘We’,‘Th’,‘Fr’,‘Sa’][d.getDay()], total });
}
} else if (graphView === ‘month’) {
for (let i = 0; i < 5; i++) {
const total = state.focusLog.reduce((a,l) => {
const d = new Date(l.date);
return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && Math.floor((d.getDate()-1)/7) === i ? a+l.minutes : a;
}, 0);
data.push({ label: `W${i+1}`, total });
}
} else {
[‘J’,‘F’,‘M’,‘A’,‘M’,‘J’,‘J’,‘A’,‘S’,‘O’,‘N’,‘D’].forEach((label,i) => {
const total = state.focusLog.filter(l => { const d=new Date(l.date); return d.getMonth()===i&&d.getFullYear()===now.getFullYear(); }).reduce((a,l)=>a+l.minutes,0);
data.push({ label, total });
});
}

const max = Math.max(…data.map(d=>d.total), 1);
const W = 300, H = 80, pad = 14, bw = (W-pad*2)/data.length - 4;

const bars = data.map((d,i) => {
const x = pad + i*((W-pad*2)/data.length) + 2;
const bh = d.total === 0 ? 1 : (d.total/max)*H;
const y = H - bh;
return ` <g> <rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="url(#barGrad)" rx="2"/> <text x="${x+bw/2}" y="${H+14}" fill="#8a6838" font-size="7" text-anchor="middle" font-family="Cinzel">${d.label}</text> ${d.total>0?`<text x="${x+bw/2}" y="${y-4}" fill="#8a5f18" font-size="7" text-anchor="middle" font-family="Cinzel">${Math.round(d.total)}</text>`:''} </g> `;
}).join(’’);

return `<svg viewBox="0 0 ${W} ${H+26}" style="width:100%;overflow:visible"> <defs> <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1"> <stop offset="0%" stop-color="#b07828" stop-opacity="0.9"/> <stop offset="100%" stop-color="#6a4010" stop-opacity="0.3"/> </linearGradient> </defs> ${bars} </svg>`;
}

/* ── MAIN RENDER ── */
function render() {
const { level, currentXP, toNext, maxed } = getLevel(state.xp);
const xpPct = maxed ? 100 : (currentXP / toNext) * 100;

// Show any pending level-up or milestone notifications
if (state._pendingLevelUp || state._pendingMilestone) showPendingNotifications();
const soulPts = state.skills.soul || 0;
const soulRank = skillRank(soulPts);
const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0).getTime()) / 86400000);
const rp = getReflectPrompt(soulRank, doy);
const quest = getDailyQuest();
const today = new Date().toDateString();
const { level: lv } = getLevel(state.xp);
const todayStretches = getDayStretches(today, lv);
const activeLib = state.edictLibrary.filter(e => state.activeLibraryIds.includes(e.id));
const allEdicts = […CORE_EDICTS, …activeLib, …todayStretches];
const todayEdicts = allEdicts.filter(e => !e.days || e.days.length === 0 || e.days.includes(new Date().getDay()));
const doneCount = todayEdicts.filter(e => state.dailyDone.includes(e.id) || (e.type !== ‘checkbox’ && (state.edictProgress[e.id]||0) >= e.target)).length;
const fillPct = todayEdicts.length > 0 ? (doneCount / todayEdicts.length) * 100 : 0;
const daysRunning = daysSince(state.startDate);

// ── STATUS TAB ──
document.getElementById(‘tab-status’).innerHTML = `<div class="hero"> <div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div> <div class="hero-bg-rune">Az</div> <div class="player-eyebrow">[ Player Status ]</div> <div class="player-name">AZRAEL</div> <div class="player-class">Fallen Angel · ${RANKS[Math.min(level-1,RANKS.length-1)]}</div> <div class="level-block"> <div class="level-num">${level}</div> <div class="level-meta"> <div class="level-tag">Ascension Level</div> <div class="level-title">${RANKS[Math.min(level-1,RANKS.length-1)]}</div> <div class="level-sub">${currentXP} / ${toNext} SF to ascend</div> </div> </div> <div class="xp-wrap"> <div class="xp-head"> <span>Soul Fragments</span> <span>${maxed ? 'MAX LEVEL' : currentXP + ' / ' + toNext}</span> </div> <div class="xp-track"><div class="xp-fill" style="width:${maxed ? 100 : xpPct}%"></div></div> ${maxed ? '<div style="font-family:Cinzel,serif;font-size:9px;letter-spacing:2px;color:var(--g2);text-align:center;margin-top:6px">✦ The Eternal ✦</div>' : ''} </div> <div class="stat-grid"> ${Object.entries(PILLARS).map(([k,pl]) =>`
<div class="stat-cell">
<span class="stat-em">${pl.icon}</span>
<span class="stat-lbl">${pl.short}</span>
<span class="stat-val ${k==='soul'?'soul-color':''}">${skillRank(state.skills[k]||0)}</span>
</div>
`).join(’’)}
</div>
<div class="soul-indicator">
<div class="soul-orb"></div>
<div style="flex:1">
<div class="soul-title">Soul Power</div>
<div class="soul-sub">All power flows from within</div>
</div>
<div class="soul-pct">${soulPower(soulPts)}%</div>
</div>
</div>

```
<div class="fp">
  <div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:14px 16px;">
    ${[
      {label:'Current Streak',val:`${state.streak} days`,em:'🔥'},
      {label:'Longest Streak',val:`${state.longestStreak||0} days`,em:'⚡'},
      {label:'Focus Today',val:formatMins(state.focusLog.filter(l=>l.date===today).reduce((a,l)=>a+l.minutes,0))||'—',em:'⏱'},
      {label:'Day',val:daysRunning,em:'📅'},
    ].map(s=>`
      <div style="background:rgba(90,55,15,.06);border:1px solid var(--wl2);border-radius:5px;padding:10px 12px;">
        <div style="font-size:16px;margin-bottom:3px">${s.em}</div>
        <div style="font-family:'Cinzel',serif;font-size:6.5px;letter-spacing:1px;color:var(--t3);text-transform:uppercase;margin-bottom:3px">${s.label}</div>
        <div style="font-family:'Cinzel',serif;font-size:16px;font-weight:700;color:var(--t1)">${s.val}</div>
      </div>
    `).join('')}
  </div>
</div>

<div class="fp">
  <div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div>
  <div class="fp-header"><div class="fp-bar"></div><div class="fp-title">Wings of Ascension</div><div class="fp-line"></div><div class="fp-tag">Day ${state.streak}</div></div>
  <div class="fp-body">
    <div style="font-size:13px;color:var(--t3);font-style:italic;margin-bottom:10px">Each consecutive day restores a feather. Miss one and they return to ash.</div>
    <div class="wings-wrap">${Array.from({length:Math.max(state.streak,21)}).map((_,i)=>`<div class="wing ${i<state.streak?'lit':''}"></div>`).join('')}</div>
  </div>
</div>

<div class="quest-fp">
  <div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div>
  <div class="quest-eyebrow">Daily Quest · Resets at Midnight</div>
  <div class="quest-text">${quest.text}</div>
  <div class="quest-foot">
    <div>
      <div class="quest-xp">+${quest.xp} Soul Fragments</div>
      <div class="quest-skill">${PILLARS[quest.skill].name}</div>
    </div>
    ${state.questDone
      ? '<div class="quest-done">✦ Complete</div>'
      : '<button class="btn btn-burg" onclick="completeQuest()">Complete</button>'
    }
  </div>
</div>
```

`;

// ── EDICTS TAB ──
const coreHTML = CORE_EDICTS.map(e => renderEdictCard(e)).join(’’);
const libActiveHTML = activeLib.map(e => renderEdictCard(e)).join(’’) || ‘’;
const stretchHTML = todayStretches.map(e => renderEdictCard(e)).join(’’);

document.getElementById(‘edict-sub-active’).innerHTML = `<div class="quest-fp" style="margin-bottom:13px"> <div class="quest-eyebrow">Daily Quest</div> <div class="quest-text">${quest.text}</div> <div class="quest-foot"> <div> <div class="quest-xp">+${quest.xp} SF</div> <div class="quest-skill">${PILLARS[quest.skill].name}</div> </div> ${state.questDone ? '<div class="quest-done">✦ Complete</div>' : '<button class="btn btn-burg" onclick="completeQuest()">Complete</button>'} </div> </div> <div class="day-sep"><div class="day-sep-line"></div><div class="day-sep-label">◈ Core Edicts</div><div class="day-sep-line"></div></div> ${coreHTML} ${activeLib.length > 0 ?`
<div class="day-sep"><div class="day-sep-line"></div><div class="day-sep-label">Personal Edicts</div><div class="day-sep-line"></div></div>
${libActiveHTML}
`: ''} <div class="day-sep"><div class="day-sep-line"></div><div class="day-sep-label">✦ Stretch Goals</div><div class="day-sep-line"></div></div> <div style="font-size:12px;color:var(--t3);font-style:italic;margin-bottom:12px">Rotate every day. Escalate as you ascend.</div> ${stretchHTML} <button class="btn btn-warm btn-full mt-8" onclick="openModal('inscribe')">✦ Add to Library</button>`;

document.getElementById(‘edict-sub-library’).innerHTML = `<div style="font-size:13px;color:var(--t3);font-style:italic;margin-bottom:14px;line-height:1.5">Every edict inscribed. Toggle to add to your daily list.</div> ${state.edictLibrary.length === 0 ? '<div class="empty">The library is empty. Inscribe your first edict.</div>' : ''} ${state.edictLibrary.map(e => { const pl = PILLARS[e.skill]; const isActive = state.activeLibraryIds.includes(e.id); return`
<div class="lib-item">
<div class="lib-stripe ${pl.stripeClass}"></div>
<div class="lib-main">
<div class="lib-label">${e.label}</div>
<div class="lib-meta">
${renderChip(e.skill)}
<span class="edict-type-badge" style="font-size:7px;padding:2px 6px;border-radius:8px">${e.type===‘checkbox’?‘task’:e.type===‘duration’?`${e.target}${e.unit}`:`${e.target} ${e.unit}`}</span>
<span style="font-family:'Cinzel',serif;font-size:8px;color:var(--g2)">+${e.xp} SF</span>
${e.days && e.days.length > 0 ? `<span style="font-family:'Cinzel',serif;font-size:7px;color:var(--t4)">${e.days.map(d=>DAYS[d]).join('·')}</span>` : ‘’}
</div>
</div>
<button class="lib-toggle ${isActive?'on':'off'}" onclick="toggleLibEdict('${e.id}')">${isActive?‘Active’:‘Inactive’}</button>
<button class="lib-del" onclick="removeFromLibrary('${e.id}')">×</button>
</div>
`; }).join('')} <button class="btn btn-warm btn-full mt-8" onclick="openModal('inscribe')">✦ Inscribe New Edict</button> `;

document.getElementById(‘edict-sub-missed’).innerHTML = `<div style="font-size:13px;color:var(--t3);font-style:italic;margin-bottom:14px;line-height:1.5">A permanent record. These do not disappear.</div> ${state.missedCore.length === 0 ? '<div class="empty">No core edicts missed. The record is clean.</div>' : ''} ${[...state.missedCore].reverse().map(m =>`
<div class="miss-history">
<div class="miss-history-date">${m.date}</div>
<div class="miss-history-label">${m.label}</div>
<div class="miss-history-note">”${m.note}”</div>
</div>
`).join('')} `;

// Vessel fill
document.getElementById(‘tab-edicts’).querySelector(’.day-vessel-count’).textContent = `${doneCount} / ${todayEdicts.length}`;
const vFill = document.getElementById(‘tab-edicts’).querySelector(’.vessel-fill’);
if (vFill) {
vFill.style.width = fillPct + ‘%’;
vFill.classList.toggle(‘full’, fillPct >= 100);
}
const vMsg = document.getElementById(‘tab-edicts’).querySelector(’.vessel-complete’);
if (vMsg) vMsg.style.display = fillPct >= 100 ? ‘block’ : ‘none’;

// ── CODEX TAB ──
document.getElementById(‘tab-codex’).innerHTML = `<div class="sh"><div class="sh-bar"></div><div class="sh-title">The Codex</div><div class="sh-line"></div></div> <div style="font-size:14px;color:var(--t3);font-style:italic;margin-bottom:16px;line-height:1.5">Five disciplines. Each grows independently and feeds your ascension. Soul carries the most weight.</div> ${Object.entries(PILLARS).map(([key,pl]) => { const pts = state.skills[key] || 0; const r = skillRank(pts), p = skillPct(pts); const totalFocus = state.focusLog.filter(l=>l.skill===key).reduce((a,l)=>a+l.minutes,0); return`
<div class="skill-panel">
<div class="skill-side ${pl.stripeClass.replace('stripe-','ss-')}"></div>
<div class="skill-inner">
<div class="skill-top">
<div>
<span class="skill-icon">${pl.icon}</span>
<div class="skill-name">${pl.name}</div>
<div class="skill-desc">${pl.desc}</div>
</div>
<div style="text-align:right">
<div class="skill-rank-num">${r}</div>
<div class="skill-rank-lbl">RANK</div>
</div>
</div>
<div class="skill-bar-bg">
<div class="skill-bar-fill ${pl.sbClass}" style="width:${p}%"></div>
</div>
<div class="skill-bar-labels">
<span>Rank ${r} · ${pts} SF</span>
<span>${Math.round(p)}% → Rank ${r+1}</span>
</div>
${PILLAR_RANK_TITLES[key]?.[r] ? `<div style="margin-top:6px;font-family:'Cinzel',serif;font-size:9px;letter-spacing:1.5px;color:var(--g2)">${PILLAR_RANK_TITLES[key][r]}</div>` : ‘’}
${totalFocus > 0 ? `<div style="margin-top:5px;font-family:'Crimson Pro',serif;font-size:11px;font-style:italic;color:var(--t3)">${formatMins(totalFocus)} logged lifetime</div>` : ‘’}
</div>
</div>
`; }).join('')} `;

// ── FOCUS TAB ──
const isTimerActive = timerRunning || timerSeconds > 0;
document.getElementById(‘tab-focus’).innerHTML = `<div class="sh"><div class="sh-bar"></div><div class="sh-title">Focus Session</div><div class="sh-line"></div></div> ${!isTimerActive ?`
<div style="font-size:14px;color:var(--t3);font-style:italic;margin-bottom:14px;line-height:1.5">Every 5 minutes earns +3 SF and feeds that pillar’s rank.</div>
${Object.entries(PILLARS).map(([key,pl]) => {
const todayMins = state.focusLog.filter(l=>l.date===today&&l.skill===key).reduce((a,l)=>a+l.minutes,0);
return `<button class="focus-btn ${currentFocusPillar===key?'active':''}" onclick="setFocusPillar('${key}')"> <span class="focus-icon">${pl.icon}</span> <div> <div class="focus-name">${pl.name}</div> <div class="focus-today">Today: ${formatMins(todayMins)||'—'}</div> </div> ${currentFocusPillar===key?'<span class="focus-mark">✦</span>':''} </button>`;
}).join(’’)}
<button class="btn btn-burg btn-full mt-8" onclick="startTimerSession()">✦ Begin — ${PILLARS[currentFocusPillar].name}</button>
`:`
<div class="timer-panel">
<div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div>
<div class="timer-label">${PILLARS[currentFocusPillar].icon} ${PILLARS[currentFocusPillar].name}</div>
<div class="timer-clock ${timerRunning?'running':''}">${formatTime(timerSeconds)}</div>
<div class="timer-earned">✦ +${Math.floor((timerSeconds/60)/5)*3} SF earned</div>
<div class="timer-btns">
${timerRunning
? ‘<button class="btn btn-warm" onclick="pauseTimer()">Pause</button>’
: ‘<button class="btn btn-burg" onclick="resumeTimer()">Resume</button>’
}
<button class="btn btn-grn" onclick="stopAndLogTimer()">End & Log</button>
<button class="btn btn-ghost" onclick="discardTimer()">Discard</button>
</div>
</div>
`} <div style="height:12px"></div> <div class="graph-wrap"> <div class="graph-title">✦ Focus Across Time</div> <div class="graph-tabs"> ${['week','month','year'].map(v=>`<button class="graph-tab ${graphView===v?'active':''}" onclick="setGraphView('${v}')">${v.charAt(0).toUpperCase()+v.slice(1)}</button>`).join('')} </div> ${state.focusLog.length === 0 ? '<div class="empty">No sessions yet</div>' : renderGraph()} </div> <div class="sh" style="margin-top:14px"><div class="sh-bar"></div><div class="sh-title">All Time</div><div class="sh-line"></div></div> ${Object.entries(PILLARS).map(([key,pl]) => { const total = state.focusLog.filter(l=>l.skill===key).reduce((a,l)=>a+l.minutes,0); return `
<div class="fp" style="margin-bottom:8px">
<div class="fp-body" style="padding:11px 14px">
<div style="display:flex;align-items:center;gap:12px">
<span style="font-size:20px">${pl.icon}</span>
<div style="flex:1">
<div style="font-family:'Cinzel',serif;font-size:11px;color:var(--t1);letter-spacing:1px;font-weight:600">${pl.name}</div>
<div style="font-size:12px;color:var(--t3);font-style:italic;margin-top:2px">${formatMins(total)||‘No sessions yet’}</div>
</div>
<div style="font-family:'Cinzel',serif;font-size:18px;font-weight:900;color:var(--g2)">${formatMins(total)||’—’}</div>
</div>
</div>
</div>
`; }).join('')} `;

// ── SOUL TAB ──
document.getElementById(‘tab-soul’).innerHTML = `<div class="fp" style="background:linear-gradient(158deg,#f5eef8,#ede5f0);border:1px solid rgba(90,56,168,.2);margin-bottom:13px"> <div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div> <div class="fp-header" style="border-bottom-color:rgba(90,56,168,.15)"> <div class="fp-bar" style="background:linear-gradient(180deg,var(--s3),var(--s2))"></div> <div class="fp-title" style="color:var(--s3)">The Soul</div> <div class="fp-line"></div> <div class="fp-tag">Rank ${soulRank}</div> </div> <div class="fp-body"> <div style="font-family:'Crimson Pro',serif;font-size:15px;font-style:italic;color:var(--t1);line-height:1.7;margin-bottom:14px"> "All powers flow from here. The strength, the foresight, the stillness. While others upgrade their egos, Azrael dims his. The soul is the source of everything." </div> <div class="soul-indicator"> <div class="soul-orb"></div> <div style="flex:1"><div class="soul-title">Ego Dissolution</div><div class="soul-sub">The quieter the ego, the louder the soul</div></div> <div class="soul-pct">${soulPower(soulPts)}%</div> </div> </div> </div> <div class="sh"><div class="sh-bar" style="background:linear-gradient(180deg,var(--s3),var(--s2))"></div><div class="sh-title" style="color:var(--s3)">Today's Chronicle</div><div class="sh-line"></div></div> <div class="reflect-panel"> <div class="orn tl"></div><div class="orn tr"></div> <div class="reflect-q-label">Today's Reflection</div> <div class="reflect-q">${rp}</div> ${state.todayMood !== null ?`<div style="font-size:24px;margin-bottom:8px">${MOODS[state.todayMood]}</div>`: ''} ${state.todayReflect ?`<div style="font-family:'Crimson Pro',serif;font-size:14px;color:var(--t2);font-style:italic;line-height:1.6;margin-bottom:12px">${state.todayReflect}</div>`: '<div style="font-size:13px;color:var(--t3);font-style:italic;margin-bottom:12px">Not yet answered today.</div>' } <button class="btn btn-soul btn-full" onclick="openModal('journal')">${state.todayReflect?'Update Entry':'Open Chronicle'} ✦</button> </div> <div class="sh" style="margin-top:16px"><div class="sh-bar"></div><div class="sh-title">Past Entries</div><div class="sh-line"></div></div> ${state.journalEntries.length === 0 ? '<div class="empty">The chronicle awaits its first entry.</div>' : ''} ${state.journalEntries.slice(0,10).map(entry =>`
<div class="fp" style="margin-bottom:8px">
<div class="fp-body" style="padding:12px 14px">
<div class="flex-between" style="margin-bottom:6px">
<div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:1px;color:var(--t3)">${entry.date}</div>
${entry.mood != null ? `<div style="font-size:16px">${MOODS[entry.mood]}</div>` : ‘’}
</div>
${entry.journal ? `<div style="font-family:'Crimson Pro',serif;font-size:13px;color:var(--t2);margin-bottom:4px;line-height:1.5">${entry.journal.slice(0,120)}${entry.journal.length>120?'...':''}</div>` : ‘’}
${entry.reflect ? `<div style="font-family:'Crimson Pro',serif;font-size:12px;font-style:italic;color:var(--t3);line-height:1.4">${entry.reflect.slice(0,100)}${entry.reflect.length>100?'...':''}</div>` : ‘’}
</div>
</div>
`).join('')} `;

// ── GOALS TAB ──
document.getElementById(‘tab-goals’).innerHTML = `<div class="sh"><div class="sh-bar"></div><div class="sh-title">Covenants</div><div class="sh-line"></div></div> <div style="font-size:14px;color:var(--t3);font-style:italic;margin-bottom:16px;line-height:1.5">That which Azrael has sworn to himself.</div> <div class="sh" style="margin-bottom:10px"><div class="sh-bar"></div><div class="sh-title">Marked Moments</div><div class="sh-line"></div></div> ${[ { key:'day100', icon:'🔥', name:'Day 100', desc:'The first real milestone', check:() => daysRunning >= 100, date:state.milestones?.day100 }, { key:'firstRank5', icon:'⚡', name:'First Rank 5', desc: state.milestones?.firstRank5 ? PILLARS[state.milestones.firstRank5.pillar]?.name : 'Any pillar reaches Rank 5', check:() => !!state.milestones?.firstRank5, date:state.milestones?.firstRank5?.date }, { key:'firstCovenant', icon:'✦', name:'First Covenant Fulfilled', desc: state.milestones?.firstCovenant?.name || 'Complete your first goal', check:() => !!state.milestones?.firstCovenant, date:state.milestones?.firstCovenant?.date }, ].map(m => { const earned = m.check(); return`
<div class="milestone-badge ${earned?'':'locked'}">
<span class="milestone-badge-icon">${m.icon}</span>
<div>
<div class="milestone-badge-name">${m.name}</div>
<div class="milestone-badge-desc">${m.desc}</div>
</div>
${earned ? `<div class="milestone-badge-date">${m.date}</div>` : ‘<div style="margin-left:auto;font-family:\'Cinzel\',serif;font-size:8px;color:var(--t4);letter-spacing:1px">LOCKED</div>’}
</div>
`;
}).join(’’)}

```
<div style="height:16px"></div>
<div class="sh"><div class="sh-bar"></div><div class="sh-title">Active Covenants</div><div class="sh-line"></div></div>
${state.goals.length === 0 ? '<div class="empty" style="padding:30px 0">No covenants sealed yet.<br>What has Azrael promised himself?</div>' : ''}
${state.goals.map(goal => {
  const pct = Math.min((goal.current/goal.target)*100, 100);
  return `
    <div class="goal-panel">
      <div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div>
      <div class="flex-between" style="margin-bottom:8px">
        <div>
          <div class="goal-name">${goal.name}</div>
          ${goal.desc ? `<div class="goal-desc">${goal.desc}</div>` : ''}
        </div>
        <button style="background:none;border:1px solid rgba(110,24,40,.16);color:rgba(154,40,56,.45);font-family:'Cinzel',serif;font-size:7px;letter-spacing:1px;padding:3px 7px;cursor:pointer;border-radius:3px" onclick="deleteGoal('${goal.id}')">remove</button>
      </div>
      <div class="goal-pct-row"><span>${Math.round(pct)}% complete</span><span>${goal.current}${goal.unit} / ${goal.target}${goal.unit}</span></div>
      <div class="goal-track"><div class="goal-fill" style="width:${pct}%"></div></div>
      <div class="milestone-row">${[25,50,75,100].map(m=>`<div class="milestone ${pct>=m?'reached':''}"></div>`).join('')}</div>
      <div class="goal-footer">
        ${renderChip(goal.skill)}
        <button class="btn btn-ghost" style="font-size:8px;padding:6px 12px" onclick="openUpdateGoal('${goal.id}')">Update</button>
      </div>
      ${pct >= 100 ? '<div class="goal-fulfilled">✦ Covenant Fulfilled ✦</div>' : ''}
    </div>
  `;
}).join('')}
<button class="btn btn-warm btn-full mt-8" onclick="openModal('goal')">✦ Seal New Covenant</button>
```

`;

// ── TREASURY TAB ──
const totalBills = state.bills.reduce((a,b) => a+b.amount, 0);
const totalDebt = state.debts.reduce((a,d) => a+d.remaining, 0);
const thisMonthIncome = state.weeklyIncome.filter(w => {
const d=new Date(w.date), n=new Date();
return d.getMonth()===n.getMonth() && d.getFullYear()===n.getFullYear();
}).reduce((a,w) => a+w.amount, 0);

document.getElementById(‘tab-treasury’).innerHTML = `<div class="vault-panel"> <div class="orn tl" style="border-color:rgba(36,88,40,.4)"></div><div class="orn tr" style="border-color:rgba(36,88,40,.4)"></div> <div class="vault-label">Vault — Savings</div> <div class="vault-amount">$${state.savings.toFixed(2)}</div> ${state.savingsGoal > 0 ?`
<div style="display:flex;justify-content:space-between;font-family:'Cinzel',serif;font-size:8px;letter-spacing:1px;color:var(--t3);margin-bottom:5px">
<span>Savings Covenant</span><span>$${state.savings.toFixed(0)} / $${state.savingsGoal}</span>
</div>
<div class="xp-track"><div class="xp-fill" style="width:${Math.min(state.savings/state.savingsGoal*100,100)}%"></div></div>
` : ‘’}
</div>

```
<div class="sh"><div class="sh-bar"></div><div class="sh-title">Monthly Flow</div><div class="sh-line"></div></div>
<div class="fp" style="margin-bottom:13px">
  <div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div>
  <div class="fp-body">
    <div class="ledger-row"><span class="ledger-label">Income logged</span><span class="ledger-val ledger-pos">$${thisMonthIncome.toFixed(2)}</span></div>
    <div class="ledger-row"><span class="ledger-label">Monthly bills</span><span class="ledger-val ledger-neg">-$${totalBills.toFixed(2)}</span></div>
    <div class="divider" style="margin:6px 0"></div>
    <div class="ledger-row"><span class="ledger-label" style="color:var(--t1)">Net</span><span class="ledger-val ${thisMonthIncome-totalBills>=0?'ledger-pos':'ledger-neg'}">$${(thisMonthIncome-totalBills).toFixed(2)}</span></div>
  </div>
</div>

<div class="sh"><div class="sh-bar"></div><div class="sh-title">Debt Snowball</div><div class="sh-line"></div></div>
${totalDebt > 0 ? `<div style="font-family:'Crimson Pro',serif;font-size:13px;font-style:italic;color:var(--t3);margin-bottom:10px">Total remaining: <strong style="color:var(--bu2)">$${totalDebt.toFixed(2)}</strong></div>` : ''}
<div class="fp" style="margin-bottom:10px">
  <div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div>
  <div class="fp-body" style="padding-top:8px;padding-bottom:8px">
    ${state.debts.length === 0 ? '<div class="empty">No debts recorded</div>' : ''}
    ${[...state.debts].sort((a,b)=>a.remaining-b.remaining).map((d,i) => {
      const paid = d.total - d.remaining, pct = Math.min((paid/d.total)*100,100);
      return `
        <div class="debt-row">
          <div class="flex-between" style="margin-bottom:6px">
            <div class="debt-name">${i===0?'⚔ ':''}${d.name}${i===0?' — Attack this first':''}</div>
            <button style="background:none;border:1px solid rgba(110,24,40,.16);color:rgba(154,40,56,.45);font-family:'Cinzel',serif;font-size:7px;padding:3px 7px;cursor:pointer;border-radius:3px" onclick="deleteDebt('${d.id}')">✕</button>
          </div>
          <div class="debt-meta"><span>Remaining: $${d.remaining.toFixed(2)}</span><span>${Math.round(pct)}% paid</span></div>
          <div class="debt-track"><div class="debt-fill" style="width:${pct}%"></div></div>
          <div class="flex-between">
            <div style="font-family:'Crimson Pro',serif;font-size:11px;font-style:italic;color:var(--t3)">Min: $${d.minPayment.toFixed(2)}/mo</div>
            <button class="btn btn-ghost" style="font-size:7px;padding:4px 10px" onclick="openPayDebt('${d.id}')">Log Payment</button>
          </div>
        </div>
      `;
    }).join('')}
  </div>
</div>

<div class="sh"><div class="sh-bar"></div><div class="sh-title">Bills</div><div class="sh-line"></div></div>
<div class="fp" style="margin-bottom:10px">
  <div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div>
  <div class="fp-body" style="padding-top:8px;padding-bottom:8px">
    ${state.bills.length === 0 ? '<div class="empty">No bills bound</div>' : ''}
    ${[...state.bills].sort((a,b)=>a.dueDay-b.dueDay).map(b => `
      <div class="ledger-row">
        <div>
          <div style="font-size:14px;color:var(--t1)">${b.label}</div>
          <div style="font-size:11px;color:var(--t3);font-style:italic;margin-top:1px">Due ${b.dueDay}${['st','nd','rd'][b.dueDay-1]||'th'}</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <span class="ledger-val ledger-neg">-$${parseFloat(b.amount).toFixed(2)}</span>
          <button style="background:none;border:1px solid rgba(110,24,40,.16);color:rgba(154,40,56,.45);font-size:12px;cursor:pointer;padding:2px 6px;border-radius:3px" onclick="deleteBill('${b.id}')">×</button>
        </div>
      </div>
    `).join('')}
  </div>
</div>

<div class="sh"><div class="sh-bar"></div><div class="sh-title">Income Log</div><div class="sh-line"></div></div>
<div class="fp" style="margin-bottom:13px">
  <div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div>
  <div class="fp-body" style="padding-top:8px;padding-bottom:8px">
    ${state.weeklyIncome.length === 0 ? '<div class="empty">No income logged yet</div>' : ''}
    ${state.weeklyIncome.slice(0,10).map(w => `
      <div class="ledger-row">
        <div>
          <div style="font-size:14px;color:var(--t1)">${w.label}</div>
          <div style="font-size:11px;color:var(--t3);font-style:italic;margin-top:1px">${w.date}</div>
        </div>
        <span class="ledger-val ledger-pos">+$${w.amount.toFixed(2)}</span>
      </div>
    `).join('')}
  </div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
  <button class="btn btn-grn" onclick="openModal('income')">+ Log Income</button>
  <button class="btn btn-burg" onclick="openModal('debt')">+ Add Debt</button>
  <button class="btn btn-warm" onclick="openModal('bill')">+ Bind Bill</button>
  <button class="btn btn-ghost" onclick="openModal('savings')">+ Add Savings</button>
</div>
```

`;

// Re-attach slider events after render
attachSliderEvents();
}

function attachSliderEvents() {
document.querySelectorAll(’.slider-input’).forEach(input => {
const edictId = input.dataset.edictId;
const edict = findEdict(edictId);
if (!edict) return;
input.addEventListener(‘input’, (e) => {
updateEdictProgress(edict, parseInt(e.target.value));
});
});
}

function findEdict(id) {
// Check cores
const core = CORE_EDICTS.find(e => e.id === id);
if (core) return core;
// Check library
const lib = state.edictLibrary.find(e => e.id === id);
if (lib) return lib;
// Check stretches
const today = new Date().toDateString();
const { level } = getLevel(state.xp);
const stretches = getDayStretches(today, level);
return stretches.find(e => e.id === id);
}

/* ── GLOBAL ACTIONS ── */
window.completeQuest = completeQuest;
window.handleEdictCheck = handleEdictCheck;
window.submitMiss = submitMiss;
window.deleteLibEdict = deleteLibEdict;
window.toggleLibEdict = (id) => { state.activeLibraryIds = state.activeLibraryIds.includes(id) ? state.activeLibraryIds.filter(x=>x!==id) : […state.activeLibraryIds,id]; saveState(); render(); };
window.removeFromLibrary = (id) => { state.edictLibrary = state.edictLibrary.filter(e=>e.id!==id); state.activeLibraryIds = state.activeLibraryIds.filter(x=>x!==id); saveState(); render(); };
window.setFocusPillar = (pillar) => { currentFocusPillar = pillar; render(); };
window.startTimerSession = () => { startTimer(); render(); };
window.pauseTimer = () => { pauseTimer(); render(); };
window.resumeTimer = () => { startTimer(); render(); };
window.stopAndLogTimer = stopAndLogTimer;
window.discardTimer = discardTimer;
window.setGraphView = (v) => { graphView = v; render(); };
window.deleteGoal = (id) => { state.goals = state.goals.filter(g=>g.id!==id); saveState(); render(); };
window.openUpdateGoal = (id) => { const goal = state.goals.find(g=>g.id===id); if (!goal) return; document.getElementById(‘update-goal-id’).value = id; document.getElementById(‘update-goal-val’).value = goal.current; openModal(‘update-goal’); };
window.deleteDebt = (id) => { state.debts = state.debts.filter(d=>d.id!==id); saveState(); render(); };
window.deleteBill = (id) => { state.bills = state.bills.filter(b=>b.id!==id); saveState(); render(); };
window.openPayDebt = (id) => { document.getElementById(‘pay-debt-id’).value = id; document.getElementById(‘pay-debt-val’).value = ‘’; openModal(‘pay-debt’); };
window.openModal = openModal;
window.closeModal = closeModal;

/* ── MODAL FORMS ── */
window.submitInscribe = () => {
const label = document.getElementById(‘inscribe-label’).value.trim();
if (!label) return;
const type = document.querySelector(’.type-selector .type-btn.active’)?.dataset.type || ‘checkbox’;
const skill = document.getElementById(‘inscribe-skill’).value;
const xp = parseInt(document.getElementById(‘inscribe-xp’).value) || 10;
const target = parseInt(document.getElementById(‘inscribe-target’).value) || 1;
const unit = type === ‘duration’ ? ‘min’ : (document.getElementById(‘inscribe-unit’).value || ‘’);
const days = Array.from(document.querySelectorAll(’.day-pill.active’)).map(p => parseInt(p.dataset.day));

const newEdict = { id:`lib-${Date.now()}`, label, type, skill, xp, target, unit, days, isLib:true };
state.edictLibrary.push(newEdict);
state.activeLibraryIds.push(newEdict.id);
saveState(); closeModal(); render();
showToast(‘Inscribed to the library’);
};

window.submitJournal = saveJournal;

window.submitGoal = () => {
const name = document.getElementById(‘goal-name’).value.trim();
if (!name) return;
const goal = {
id: Date.now(),
name,
desc: document.getElementById(‘goal-desc’).value,
current: parseFloat(document.getElementById(‘goal-current’).value) || 0,
target: parseFloat(document.getElementById(‘goal-target’).value) || 100,
unit: document.getElementById(‘goal-unit’).value,
skill: document.getElementById(‘goal-skill’).value,
};
state.goals.push(goal);
saveState(); closeModal(); render();
showToast(‘Covenant sealed’);
};

window.submitUpdateGoal = () => {
const id = parseInt(document.getElementById(‘update-goal-id’).value);
const val = parseFloat(document.getElementById(‘update-goal-val’).value);
if (isNaN(val)) return;
state.goals = state.goals.map(g => g.id === id ? { …g, current: Math.min(val, g.target) } : g);

// Check milestone
const goal = state.goals.find(g=>g.id===id);
if (goal && goal.current >= goal.target && !state.milestones.firstCovenant) {
state.milestones.firstCovenant = { name: goal.name, date: new Date().toDateString() };
}
saveState(); closeModal(); render();
showToast(‘Progress recorded’);
};

window.submitIncome = () => {
const amount = parseFloat(document.getElementById(‘income-amount’).value);
if (isNaN(amount)) return;
state.weeklyIncome.unshift({ id:Date.now(), amount, label:document.getElementById(‘income-label’).value||‘Weekly income’, date:new Date().toLocaleDateString() });
state.weeklyIncome = state.weeklyIncome.slice(0,100);
saveState(); closeModal(); render(); showToast(‘Income recorded’);
};

window.submitDebt = () => {
const name = document.getElementById(‘debt-name’).value.trim();
const total = parseFloat(document.getElementById(‘debt-total’).value);
const remaining = parseFloat(document.getElementById(‘debt-remaining’).value) || total;
const minPayment = parseFloat(document.getElementById(‘debt-min’).value) || 0;
if (!name || isNaN(total)) return;
state.debts.push({ id:Date.now(), name, total, remaining, minPayment });
saveState(); closeModal(); render(); showToast(‘Debt recorded’);
};

window.submitBill = () => {
const label = document.getElementById(‘bill-label’).value.trim();
const amount = parseFloat(document.getElementById(‘bill-amount’).value);
const dueDay = parseInt(document.getElementById(‘bill-due’).value) || 1;
if (!label || isNaN(amount)) return;
state.bills.push({ id:Date.now(), label, amount, dueDay });
saveState(); closeModal(); render(); showToast(‘Bill bound’);
};

window.submitSavings = () => {
const amount = parseFloat(document.getElementById(‘savings-amount’).value);
if (isNaN(amount)) return;
state.savings += amount;
saveState(); closeModal(); render(); showToast(‘Savings updated’);
};

window.submitPayDebt = () => {
const id = parseInt(document.getElementById(‘pay-debt-id’).value);
const amount = parseFloat(document.getElementById(‘pay-debt-val’).value);
if (isNaN(amount)) return;
state.debts = state.debts.map(d => d.id===id ? {…d, remaining: Math.max(0, d.remaining-amount)} : d);
saveState(); closeModal(); render(); showToast(‘Payment recorded’);
};

window.setMood = (idx) => {
state.todayMood = idx;
document.querySelectorAll(’.mood-btn’).forEach((b,i) => b.classList.toggle(‘selected’, i===idx));
};

window.selectType = (type, btn) => {
document.querySelectorAll(’.type-selector .type-btn’).forEach(b => b.classList.remove(‘active’));
btn.classList.add(‘active’);
btn.dataset.type = type;
document.getElementById(‘inscribe-target-row’).style.display = type !== ‘checkbox’ ? ‘flex’ : ‘none’;
document.getElementById(‘inscribe-unit-row’).style.display = type === ‘counter’ ? ‘block’ : ‘none’;
};

window.toggleDay = (day, el) => {
el.classList.toggle(‘active’);
};

/* ── INIT ── */
function buildStaticUI() {
// Build nav
const nav = document.getElementById(‘main-nav’);
[
{id:‘status’,icon:‘👁’,label:‘Status’},
{id:‘edicts’,icon:‘📜’,label:‘Edicts’},
{id:‘codex’,icon:‘🜏’,label:‘Codex’},
{id:‘focus’,icon:‘⏱’,label:‘Focus’},
{id:‘soul’,icon:‘✦’,label:‘Soul’},
{id:‘goals’,icon:‘⚔’,label:‘Goals’},
{id:‘treasury’,icon:‘⚖’,label:‘Gold’},
].forEach(t => {
const btn = document.createElement(‘button’);
btn.className = ‘nav-btn’ + (t.id===‘status’?’ active’:’’);
btn.dataset.tab = t.id;
btn.innerHTML = `<span class="nav-icon">${t.icon}</span>${t.label}`;
btn.onclick = () => switchTab(t.id);
nav.appendChild(btn);
});

// Build tab panels
const content = document.getElementById(‘main-content’);
[‘status’,‘edicts’,‘codex’,‘focus’,‘soul’,‘goals’,‘treasury’].forEach(id => {
const panel = document.createElement(‘div’);
panel.className = ‘tab-panel’ + (id===‘status’?’ active’:’’);
panel.id = ‘tab-’ + id;

```
if (id === 'edicts') {
  panel.innerHTML = `
    <div class="day-vessel">
      <div class="orn tl"></div><div class="orn tr"></div><div class="orn bl"></div><div class="orn br"></div>
      <div class="day-vessel-header">
        <div class="day-vessel-title">Today's Vessel</div>
        <div class="day-vessel-count">0 / 0</div>
      </div>
      <div class="vessel-track"><div class="vessel-fill" style="width:0%"></div></div>
      <div class="vessel-labels"><div class="vessel-label">Empty</div><div class="vessel-label">Full</div></div>
      <div class="vessel-complete" style="display:none">The vessel is full. Azrael kept his word today.</div>
    </div>
    <div class="sub-tabs">
      <button class="sub-tab btn btn-warm" data-subtab="active" onclick="switchEdictSubTab('active')">Today</button>
      <button class="sub-tab btn btn-ghost" data-subtab="library" onclick="switchEdictSubTab('library')">Library</button>
      <button class="sub-tab btn btn-ghost" data-subtab="missed" onclick="switchEdictSubTab('missed')">Missed</button>
    </div>
    <div id="edict-sub-active" class="edict-sub-panel"></div>
    <div id="edict-sub-library" class="edict-sub-panel" style="display:none"></div>
    <div id="edict-sub-missed" class="edict-sub-panel" style="display:none"></div>
  `;
}
content.appendChild(panel);
```

});

// Build overlay / modals
const overlay = document.createElement(‘div’);
overlay.id = ‘overlay’;
overlay.className = ‘overlay’;
overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

const pillarsOptions = Object.entries(PILLARS).map(([k,v]) => `<option value="${k}">${v.icon} ${v.name}</option>`).join(’’);

overlay.innerHTML = `
<div class="modal">

```
  <!-- INSCRIBE EDICT -->
  <div id="modal-inscribe" class="modal-content" style="display:none">
    <div class="modal-title">✦ Inscribe to Library</div>
    <input id="inscribe-label" class="inp" placeholder="The edict, stated plainly...">
    <div class="modal-label">Type</div>
    <div class="type-selector">
      <button class="type-btn active" data-type="checkbox" onclick="selectType('checkbox',this)"><span class="type-btn-icon">✓</span>Task</button>
      <button class="type-btn" data-type="duration" onclick="selectType('duration',this)"><span class="type-btn-icon">⏱</span>Duration</button>
      <button class="type-btn" data-type="counter" onclick="selectType('counter',this)"><span class="type-btn-icon">#</span>Counter</button>
    </div>
    <div id="inscribe-target-row" class="inp-row" style="display:none;margin-bottom:8px">
      <input id="inscribe-target" class="inp" type="number" placeholder="Target (minutes or count)">
    </div>
    <div id="inscribe-unit-row" style="display:none">
      <input id="inscribe-unit" class="inp" placeholder="Unit (pages, sets, reps...)">
    </div>
    <select id="inscribe-skill" class="inp">${pillarsOptions}</select>
    <input id="inscribe-xp" class="inp" type="number" placeholder="Soul Fragments on completion" value="15">
    <div class="modal-label">Days (empty = every day)</div>
    <div class="day-picker">${DAYS.map((d,i)=>`<button class="day-pill" data-day="${i}" onclick="this.classList.toggle('active')">${d.slice(0,2)}</button>`).join('')}</div>
    <div class="btn-row">
      <button class="btn btn-warm" onclick="submitInscribe()">Inscribe</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>
  </div>

  <!-- JOURNAL -->
  <div id="modal-journal" class="modal-content" style="display:none">
    <div class="modal-title">✦ Chronicle Entry</div>
    <div class="modal-label">Mood Today</div>
    <div class="mood-row">${MOODS.map((m,i)=>`<button class="mood-btn" onclick="setMood(${i})">${m}</button>`).join('')}</div>
    <div class="modal-label">Journal</div>
    <textarea id="journal-text" class="inp" placeholder="What happened today..."></textarea>
    <div class="modal-label" style="color:var(--s3)">◈ Reflection</div>
    <div id="reflect-prompt-text" style="font-family:'Crimson Pro',serif;font-size:14px;font-style:italic;color:var(--t2);margin-bottom:8px;line-height:1.5"></div>
    <textarea id="reflect-text" class="inp" placeholder="Answer honestly..." style="min-height:70px"></textarea>
    <div class="btn-row">
      <button class="btn btn-soul" onclick="submitJournal()">Save Entry</button>
      <button class="btn btn-ghost" onclick="closeModal()">Later</button>
    </div>
  </div>

  <!-- GOAL -->
  <div id="modal-goal" class="modal-content" style="display:none">
    <div class="modal-title">✦ Seal a Covenant</div>
    <input id="goal-name" class="inp" placeholder="Name of this covenant...">
    <input id="goal-desc" class="inp" placeholder="What does this mean to you...">
    <div class="inp-row">
      <input id="goal-current" class="inp" type="number" placeholder="Current">
      <input id="goal-target" class="inp" type="number" placeholder="Target">
    </div>
    <input id="goal-unit" class="inp" placeholder="Unit (days, $, bpm...)">
    <select id="goal-skill" class="inp">${pillarsOptions}</select>
    <div class="btn-row">
      <button class="btn btn-warm" onclick="submitGoal()">Seal</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>
  </div>

  <!-- UPDATE GOAL -->
  <div id="modal-update-goal" class="modal-content" style="display:none">
    <div class="modal-title">✦ Record Progress</div>
    <input type="hidden" id="update-goal-id">
    <input id="update-goal-val" class="inp" type="number" placeholder="Current value...">
    <div class="btn-row">
      <button class="btn btn-warm" onclick="submitUpdateGoal()">Record</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>
  </div>

  <!-- INCOME -->
  <div id="modal-income" class="modal-content" style="display:none">
    <div class="modal-title">✦ Log Weekly Income</div>
    <input id="income-amount" class="inp" type="number" placeholder="Amount earned this week...">
    <input id="income-label" class="inp" placeholder="Notes (optional)">
    <div class="btn-row">
      <button class="btn btn-grn" onclick="submitIncome()">Log</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>
  </div>

  <!-- DEBT -->
  <div id="modal-debt" class="modal-content" style="display:none">
    <div class="modal-title">✦ Record Debt</div>
    <input id="debt-name" class="inp" placeholder="Debt name...">
    <div class="inp-row">
      <input id="debt-total" class="inp" type="number" placeholder="Total owed">
      <input id="debt-remaining" class="inp" type="number" placeholder="Remaining">
    </div>
    <input id="debt-min" class="inp" type="number" placeholder="Min monthly payment">
    <div class="btn-row">
      <button class="btn btn-burg" onclick="submitDebt()">Record</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>
  </div>

  <!-- PAY DEBT -->
  <div id="modal-pay-debt" class="modal-content" style="display:none">
    <div class="modal-title">✦ Record Payment</div>
    <input type="hidden" id="pay-debt-id">
    <input id="pay-debt-val" class="inp" type="number" placeholder="Amount paid...">
    <div class="btn-row">
      <button class="btn btn-burg" onclick="submitPayDebt()">Record</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>
  </div>

  <!-- BILL -->
  <div id="modal-bill" class="modal-content" style="display:none">
    <div class="modal-title">✦ Bind Bill</div>
    <input id="bill-label" class="inp" placeholder="Bill name...">
    <div class="inp-row">
      <input id="bill-amount" class="inp" type="number" placeholder="Monthly amount">
      <input id="bill-due" class="inp" type="number" placeholder="Due day" value="1">
    </div>
    <div class="btn-row">
      <button class="btn btn-warm" onclick="submitBill()">Bind</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>
  </div>

  <!-- SAVINGS -->
  <div id="modal-savings" class="modal-content" style="display:none">
    <div class="modal-title">✦ Add Savings</div>
    <input id="savings-amount" class="inp" type="number" placeholder="Amount to add...">
    <div class="btn-row">
      <button class="btn btn-grn" onclick="submitSavings()">Add</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>
  </div>

  <!-- LEVEL UP -->
  <div id="modal-levelup" class="modal-content" style="display:none">
    <div style="text-align:center;padding:20px 0 10px">
      <div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:3px;color:var(--g2);text-transform:uppercase;margin-bottom:16px">Ascension</div>
      <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:16px">
        <div style="font-family:'Cinzel',serif;font-size:40px;color:var(--t3)" id="levelup-from"></div>
        <div style="font-family:'Cinzel',serif;font-size:20px;color:var(--g2)">→</div>
        <div style="font-family:'Cinzel',serif;font-size:60px;font-weight:900;color:var(--g2);text-shadow:0 0 30px rgba(180,130,40,.4)" id="levelup-to"></div>
      </div>
      <div style="font-family:'Crimson Pro',serif;font-size:20px;font-style:italic;color:var(--t1);margin-bottom:8px" id="levelup-title"></div>
      <div style="font-family:'Crimson Pro',serif;font-size:13px;color:var(--t3);font-style:italic;margin-bottom:24px">A new rank has been earned.</div>
      <button class="btn btn-warm" style="width:100%" onclick="closeModal()">✦ Continue</button>
    </div>
  </div>

  <!-- SKILL MILESTONE -->
  <div id="modal-milestone" class="modal-content" style="display:none">
    <div style="text-align:center;padding:20px 0 10px">
      <div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:3px;color:var(--s3);text-transform:uppercase;margin-bottom:12px">◈ Milestone Reached</div>
      <div style="font-family:'Cinzel',serif;font-size:14px;color:var(--t1);letter-spacing:1px;margin-bottom:4px" id="milestone-pillar"></div>
      <div style="font-family:'Cinzel',serif;font-size:11px;color:var(--g2);letter-spacing:2px;margin-bottom:12px" id="milestone-rank"></div>
      <div style="font-family:'Crimson Pro',serif;font-size:18px;font-style:italic;color:var(--t1);margin-bottom:12px" id="milestone-title"></div>
      <div style="font-family:'Crimson Pro',serif;font-size:14px;color:var(--t2);font-style:italic;line-height:1.6;margin-bottom:24px" id="milestone-unlock"></div>
      <button class="btn btn-soul" style="width:100%" onclick="closeModal()">◈ Understood</button>
    </div>
  </div>

</div>
```

`;
document.body.appendChild(overlay);

// Update reflect prompt when journal modal opens
const origOpenModal = openModal;
}

function hideLoading() {
const loading = document.getElementById(‘loading’);
if (loading) loading.style.display = ‘none’;
}

function init() {
// Always hide loading after 3s max no matter what
setTimeout(hideLoading, 3000);

try {
loadState();
// Clear any pending notifications that may have been saved mid-session
delete state._pendingLevelUp;
delete state._pendingMilestone;
} catch(e) {
console.error(‘loadState failed:’, e);
state = { …DEFAULT_STATE };
}

try {
checkDailyReset();
} catch(e) {
console.error(‘checkDailyReset failed:’, e);
}

try {
buildStaticUI();
} catch(e) {
console.error(‘buildStaticUI failed:’, e);
hideLoading();
return;
}

try {
render();
} catch(e) {
console.error(‘render failed:’, e);
}

// Hide loading screen
setTimeout(hideLoading, 400);

// Patch openModal to update journal prompt
const _open = openModal;
window.openModal = (id) => {
_open(id);
if (id === ‘journal’) {
const soulPts = state.skills.soul || 0;
const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0).getTime()) / 86400000);
const prompt = getReflectPrompt(skillRank(soulPts), doy);
const promptEl = document.getElementById(‘reflect-prompt-text’);
if (promptEl) promptEl.textContent = prompt;
const jt = document.getElementById(‘journal-text’);
if (jt) jt.value = state.todayJournal || ‘’;
const rt = document.getElementById(‘reflect-text’);
if (rt) rt.value = state.todayReflect || ‘’;
// Set mood buttons
document.querySelectorAll(’.mood-btn’).forEach((b,i) => b.classList.toggle(‘selected’, i === state.todayMood));
}
};
}

// Boot
if (document.readyState === ‘loading’) {
document.addEventListener(‘DOMContentLoaded’, init);
} else {
init();
}
