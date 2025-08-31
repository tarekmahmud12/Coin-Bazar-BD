import {
  db, auth, signInAnonymously, onAuthStateChanged,
  doc, setDoc, getDoc, updateDoc, increment, serverTimestamp
} from "./firebase.js";
import { DICT, applyLanguage } from "./lang.js"; // DICT not used directly but imported for clarity

// Telegram
const tg = window.Telegram?.WebApp;
tg?.expand();
let TG_USER = tg?.initDataUnsafe?.user || null;
let UID = TG_USER ? String(TG_USER.id) : null;

// DOM refs
const tabs = document.querySelectorAll('.bottom-nav .tab');
const pages = document.querySelectorAll('.page');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const saveSettings = document.getElementById('saveSettings');
const themeSwitcher = document.getElementById('themeSwitcher');
const languageSwitcher = document.getElementById('languageSwitcher');

const profilePic = document.getElementById('profilePic');
const displayName = document.getElementById('displayName');
const tgIdEl = document.getElementById('tgId');
const pointsHome = document.getElementById('pointsHome');
const moneyHome = document.getElementById('moneyHome');
const pPoints = document.getElementById('pPoints');
const pMoney = document.getElementById('pMoney');
const pUsername = document.getElementById('pUsername');
const pTgId = document.getElementById('pTgId');

const watchAdBtn = document.getElementById('watchAdBtn');
const tasksList = document.getElementById('tasksList');
const refLink = document.getElementById('refLink');
const copyRef = document.getElementById('copyRef');
const withdrawForm = document.getElementById('withdrawForm');

const COIN_TO_BDT = 0.01; // 1 coin = 0.01৳

// app state
let userData = { points: 0, referrals: 0, referralPoints: 0 };
let theme = localStorage.getItem('theme') || 'auto';
let lang = localStorage.getItem('lang') || 'en';

// apply saved theme
function applyThemeMode(mode){
  if(mode === 'auto') {
    const scheme = tg?.colorScheme || 'dark';
    document.body.classList.toggle('light', scheme === 'light');
  } else {
    document.body.classList.toggle('light', mode === 'light');
  }
  themeSwitcher.value = mode;
}
applyThemeMode(theme);

// apply language
function applyLang(l){
  lang = l;
  localStorage.setItem('lang', l);
  applyLanguage(l);
  languageSwitcher.value = l;
}
applyLang(lang);

// Settings modal toggles
settingsBtn.addEventListener('click', ()=> settingsModal.classList.remove('hidden'));
closeSettings.addEventListener('click', ()=> settingsModal.classList.add('hidden'));
saveSettings.addEventListener('click', ()=>{
  const t = themeSwitcher.value;
  const l = languageSwitcher.value;
  localStorage.setItem('theme', t);
  applyThemeMode(t);
  applyLang(l);
  settingsModal.classList.add('hidden');
});

// theme change by telegram event
tg?.onEvent?.('themeChanged', ()=> { if(theme === 'auto') applyThemeMode('auto'); });

// Navigation
tabs.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    tabs.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.dataset.target;
    pages.forEach(p=>p.classList.remove('active'));
    document.getElementById(target).classList.add('active');
  });
});
document.querySelectorAll('.nav-link').forEach(a=>{
  a.addEventListener('click', (e)=>{
    e.preventDefault();
    const target = a.dataset.target;
    tabs.forEach(b=>b.classList.toggle('active', b.dataset.target === target));
    pages.forEach(p=>p.classList.remove('active'));
    document.getElementById(target).classList.add('active');
  });
});

// populate telegram info
function populateTelegram(){
  if(TG_USER){
    profilePic.src = TG_USER.photo_url || profilePic.src;
    displayName.textContent = TG_USER.first_name || TG_USER.username || 'User';
    tgIdEl.textContent = UID;
    pUsername.textContent = TG_USER.username || TG_USER.first_name || 'User';
    pTgId.textContent = UID;
  }
}
populateTelegram();

// Firestore functions
async function ensureUserDoc(){
  if(!UID) return;
  const ref = doc(db, 'users', UID);
  const snap = await getDoc(ref);
  if(!snap.exists()){
    await setDoc(ref, {
      telegramId: UID,
      username: TG_USER?.username || TG_USER?.first_name || 'User',
      points: 0,
      referrals: 0,
      referralPoints: 0,
      createdAt: serverTimestamp()
    });
  }
}

// load user data from firestore
async function loadUserData(){
  if(!UID) return;
  const ref = doc(db, 'users', UID);
  const snap = await getDoc(ref);
  if(!snap.exists()) return;
  userData = snap.data();
  userData.points = userData.points || 0;
  userData.referrals = userData.referrals || 0;
  userData.referralPoints = userData.referralPoints || 0;

  // update UI
  pointsHome.textContent = String(userData.points);
  pPoints.textContent = String(userData.points);
  const money = (userData.points * COIN_TO_BDT).toFixed(2);
  moneyHome.textContent = `৳${money}`;
  pMoney.textContent = `৳${money}`;
  document.getElementById('refCount').textContent = String(userData.referrals);
  document.getElementById('refPoints').textContent = String(userData.referralPoints);
  refLink.value = `https://t.me/gravity_ad_bot?start=${UID}`; // change bot username if needed
}

// Firebase auth & boot
async function boot(){
  // anonymous auth for Firestore writes
  await signInAnonymously(auth).catch(console.error);
  onAuthStateChanged(auth, async ()=>{
    if(!UID){
      // if running outside Telegram, fallback to firebase uid
      const fallbackId = auth.currentUser?.uid;
      if(!UID && fallbackId) UID = fallbackId;
    }
    await ensureUserDoc();
    await loadUserData();
  });
}
boot();

// Watch Ads logic (Monetag)
watchAdBtn.addEventListener('click', async ()=>{
  if(!UID) return alert('Auth not ready');
  try {
    if(typeof window.show_9669121 === 'function'){
      await window.show_9669121();
      // rewarded
      await updateDoc(doc(db,'users',UID), { points: increment(10) });
      await loadUserData();
      alert('You earned 10 coins!');
    } else {
      alert('Ad system not loaded');
    }
  } catch (e){
    // try popup fallback
    try {
      await window.show_9669121('pop');
      await updateDoc(doc(db,'users',UID), { points: increment(10) });
      await loadUserData();
      alert('You earned 10 coins!');
    } catch (err){
      console.error(err);
      alert('Ad failed to load');
    }
  }
});

// Tasks logic: open link, require stay time -> award points
document.querySelectorAll('.task-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const url = btn.dataset.url;
    const pts = Number(btn.dataset.points || 0);
    // open new tab
    const w = window.open(url, '_blank');
    // wait 15s then award
    let awarded = false;
    const required = 15; // seconds
    let elapsed = 0;
    const timer = setInterval(async ()=>{
      elapsed++;
      if(elapsed >= required && !awarded){
        awarded = true;
        clearInterval(timer);
        try {
          await updateDoc(doc(db,'users',UID), { points: increment(pts) });
          await loadUserData();
          alert(`Task complete: +${pts} coins`);
        } catch (e) {
          console.error(e);
          alert('Failed to award points');
        }
      }
      // if window closed early, cancel awarding
      if(w && w.closed && !awarded){
        clearInterval(timer);
        alert('You closed the task early. No coins awarded.');
      }
    }, 1000);
  });
});

// Copy referral
copyRef.addEventListener('click', async ()=>{
  try {
    await navigator.clipboard.writeText(refLink.value);
    alert('Referral link copied!');
  } catch (e){
    console.error(e);
    alert('Copy failed');
  }
});

// Bonus join
document.querySelectorAll('.bonus-btn').forEach(btn=>{
  btn.addEventListener('click', async ()=>{
    const link = btn.dataset.link;
    const pts = Number(btn.dataset.points || 0);
    window.open(link, '_blank');

    // mark as claimed in user doc to avoid double-claim
    const ref = doc(db,'users',UID);
    const snap = await getDoc(ref);
    const data = snap.data() || {};
    const key = `bonus_${link}_claimed`;
    if(data[key]){ alert('Already claimed'); return; }
    const update = { [key]: true, points: increment(pts) };
    await updateDoc(ref, update);
    await loadUserData();
    alert(`Bonus +${pts} coins added`);
  });
});

// Withdraw form submit
withdrawForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const method = document.getElementById('payMethod').value;
  const accountId = document.getElementById('accountId').value.trim();
  const amount = Number(document.getElementById('amount').value || 0);

  if(!method || !accountId || amount <= 0) return alert('Fill fields correctly');
  if(amount > (userData.points || 0)) return alert('Not enough coins');

  // minimums (coins)
  const mins = { bkash:10000, nagad:10000, rocket:10000, binance:100000 };
  const min = mins[method] || 10000;
  if(amount < min) return alert(`Minimum ${min} coins for ${method}`);

  // deduct & create withdrawal record
  try {
    await updateDoc(doc(db,'users',UID), { points: increment(-amount) });
    const wref = doc(db,'withdrawals', `${UID}_${Date.now()}`);
    await setDoc(wref, {
      telegramId: UID,
      method, accountId, amount,
      status: 'pending', createdAt: serverTimestamp()
    });
    await loadUserData();
    alert('Withdrawal requested. We will process soon.');
    withdrawForm.reset();
  } catch (e) {
    console.error(e);
    alert('Withdraw failed');
  }
});

// initial language set
applyLanguage(lang);

// watch for theme change on Telegram and reflect if auto
tg?.onEvent?.('themeChanged', ()=>{
  if(localStorage.getItem('theme') === 'auto' || !localStorage.getItem('theme')) applyThemeMode('auto');
});

// export applyLanguage from lang.js used earlier
import { applyLanguage } from './lang.js';
function applyThemeMode(mode){
  if(mode === 'auto'){
    const scheme = tg?.colorScheme || 'dark';
    document.body.classList.toggle('light', scheme === 'light');
  } else {
    document.body.classList.toggle('light', mode === 'light');
  }
}