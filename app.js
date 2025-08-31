import {
  db, auth, signInAnonymously, onAuthStateChanged,
  doc, setDoc, getDoc, updateDoc, increment, serverTimestamp
} from "./firebase.js";
import { DICT, applyLanguage } from "./lang.js";

// Telegram WebApp SDK থেকে ইউজার ডেটা
const tg = window.Telegram?.WebApp;
tg?.expand();
let TG_USER = tg?.initDataUnsafe?.user || null;
let UID = TG_USER ? String(TG_USER.id) : null;

// DOM Elements
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
const refLink = document.getElementById('refLink');
const copyRef = document.getElementById('copyRef');
const withdrawForm = document.getElementById('withdrawForm');

// ১ কয়েন = ০.০১ টাকা
const COIN_TO_BDT = 0.01;

// অ্যাপ স্টেট
let userData = { points: 0, referrals: 0, referralPoints: 0 };
let theme = localStorage.getItem('theme') || 'auto';
let lang = localStorage.getItem('lang') || 'en';

// থিম প্রয়োগ
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

// ভাষা প্রয়োগ
function applyLang(l){
  lang = l;
  localStorage.setItem('lang', l);
  applyLanguage(l);
  languageSwitcher.value = l;
}
applyLang(lang);

// সেটিংস মডাল
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

// Telegram থিম চেঞ্জ
tg?.onEvent?.('themeChanged', ()=> { 
  if(theme === 'auto') applyThemeMode('auto'); 
});

// ন্যাভিগেশন
tabs.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    tabs.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.dataset.target;
    pages.forEach(p=>p.classList.remove('active'));
    document.getElementById(target).classList.add('active');
  });
});

// Telegram থেকে ইউজারের ডেটা সেট করা
function populateTelegram(){
  if(TG_USER){
    profilePic.src = TG_USER.photo_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    displayName.textContent = TG_USER.first_name || TG_USER.username || 'User';
    tgIdEl.textContent = UID;
    pUsername.textContent = TG_USER.username || TG_USER.first_name || 'User';
    pTgId.textContent = UID;
    document.getElementById("pProfilePic").src = TG_USER.photo_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  }
}
populateTelegram();

// ইউজার ডকুমেন্ট তৈরি
async function ensureUserDoc(){
  if(!UID) return;
  const ref = doc(db, 'users', UID);
  const snap = await getDoc(ref);
  if(!snap.exists()){
    await setDoc(ref, {
      telegramId: UID,
      username: TG_USER?.username || TG_USER?.first_name || 'User',
      photo: TG_USER?.photo_url || '',
      points: 0,
      referrals: 0,
      referralPoints: 0,
      createdAt: serverTimestamp()
    });
  }
}

// ইউজারের ডেটা লোড
async function loadUserData(){
  if(!UID) return;
  const ref = doc(db, 'users', UID);
  const snap = await getDoc(ref);
  if(!snap.exists()) return;

  userData = snap.data();
  userData.points = userData.points || 0;
  userData.referrals = userData.referrals || 0;
  userData.referralPoints = userData.referralPoints || 0;

  // UI আপডেট
  pointsHome.textContent = String(userData.points);
  pPoints.textContent = String(userData.points);
  const money = (userData.points * COIN_TO_BDT).toFixed(2);
  moneyHome.textContent = `৳${money}`;
  pMoney.textContent = `৳${money}`;
  document.getElementById('refCount').textContent = String(userData.referrals);
  document.getElementById('refPoints').textContent = String(userData.referralPoints);
  refLink.value = `https://t.me/gravity_ad_bot?start=${UID}`;
}

// Firebase auth boot
async function boot(){
  await signInAnonymously(auth).catch(console.error);
  onAuthStateChanged(auth, async ()=>{
    await ensureUserDoc();
    await loadUserData();
  });
}
boot();

// Watch Ads
watchAdBtn.addEventListener('click', async ()=>{
  if(!UID) return alert('Auth not ready');
  try {
    if(typeof window.show_9669121 === 'function'){
      await window.show_9669121();
      await updateDoc(doc(db,'users',UID), { points: increment(10) });
      await loadUserData();
      alert('You earned 10 coins!');
    } else {
      alert('Ad system not loaded');
    }
  } catch (e){
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

// Referral copy
copyRef.addEventListener('click', async ()=>{
  try {
    await navigator.clipboard.writeText(refLink.value);
    alert('Referral link copied!');
  } catch (e){
    console.error(e);
    alert('Copy failed');
  }
});

// Withdraw form
withdrawForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const method = document.getElementById('payMethod').value;
  const accountId = document.getElementById('accountId').value.trim();
  const amount = Number(document.getElementById('amount').value || 0);

  if(!method || !accountId || amount <= 0) return alert('Fill fields correctly');
  if(amount > (userData.points || 0)) return alert('Not enough coins');

  const mins = { bkash:10000, nagad:10000, rocket:10000, binance:100000 };
  const min = mins[method] || 10000;
  if(amount < min) return alert(`Minimum ${min} coins for ${method}`);

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
