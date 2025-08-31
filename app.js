import {
  db, auth, signInAnonymously, onAuthStateChanged,
  doc, setDoc, getDoc, updateDoc, increment, serverTimestamp
} from "./firebase.js";
import { DICT, applyLanguage } from "./lang.js";
import { initTelegram } from "./telegram.js";
import { showRewardedAd } from "./ads.js";
import { setupTaskAndBonusListeners } from "./tasks.js";
import { setupWithdrawForm } from "./withdraw.js";

// Telegram
let tg = window.Telegram?.WebApp;
tg?.expand();
let UID = null;
let TG_USER = null;

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
const totalPointsDisplay = document.getElementById('pPoints'); // Used in withdraw.js

const COIN_TO_BDT = 0.01; // 1 coin = 0.01৳

// app state
let userData = { points: 0, referrals: 0, referralPoints: 0 };
let theme = localStorage.getItem('theme') || 'auto';
let lang = localStorage.getItem('lang') || 'en';

// apply saved theme
function applyThemeMode(mode) {
  if (mode === 'auto') {
    const scheme = tg?.colorScheme || 'dark';
    document.body.classList.toggle('light', scheme === 'light');
  } else {
    document.body.classList.toggle('light', mode === 'light');
  }
  themeSwitcher.value = mode;
}
applyThemeMode(theme);

// apply language
function applyLang(l) {
  lang = l;
  localStorage.setItem('lang', l);
  applyLanguage(l);
  languageSwitcher.value = l;
}
applyLang(lang);

// Settings modal toggles
settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
closeSettings.addEventListener('click', () => settingsModal.classList.add('hidden'));
saveSettings.addEventListener('click', () => {
  const t = themeSwitcher.value;
  const l = languageSwitcher.value;
  localStorage.setItem('theme', t);
  applyThemeMode(t);
  applyLang(l);
  settingsModal.classList.add('hidden');
});

// theme change by telegram event
tg?.onEvent?.('themeChanged', () => { if (theme === 'auto') applyThemeMode('auto'); });

// Navigation
const handleNavigation = (target) => {
  tabs.forEach(b => b.classList.remove('active'));
  pages.forEach(p => p.classList.remove('active'));
  const targetTab = document.querySelector(`.bottom-nav .tab[data-target="${target}"]`);
  const targetPage = document.getElementById(target);
  if (targetTab) targetTab.classList.add('active');
  if (targetPage) targetPage.classList.add('active');
};

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    handleNavigation(target);
  });
});

document.querySelectorAll('.nav-link').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const target = a.dataset.target;
    handleNavigation(target);
  });
});

// Set initial active tab and page
const initialActiveTab = document.querySelector('.bottom-nav .tab.active');
if (initialActiveTab) {
  const targetPageId = initialActiveTab.dataset.target;
  const targetPage = document.getElementById(targetPageId);
  if (targetPage) {
    targetPage.classList.add('active');
  }
}

// Function to handle profile UI updates
const updateProfileUI = (userData) => {
  if (TG_USER && TG_USER.first_name) {
    displayName.textContent = `${TG_USER.first_name} ${TG_USER.last_name || ''}`;
    tgIdEl.textContent = `@${TG_USER.username || ''}`;
    const profilePicUrl = TG_USER.photo_url || null;
    if (profilePicUrl) {
      profilePic.src = profilePicUrl;
    } else {
      profilePic.src = "https://i.ibb.co/60qYh7x/placeholder.png";
    }
  } else if (auth.currentUser) {
    displayName.textContent = auth.currentUser.uid;
    tgIdEl.textContent = 'User ID';
    profilePic.src = "https://i.ibb.co/60qYh7x/placeholder.png";
  }
  pointsHome.textContent = userData?.points || 0;
  moneyHome.textContent = (userData?.points * COIN_TO_BDT).toFixed(2) || 0;
  pPoints.textContent = userData?.points || 0;
  pMoney.textContent = (userData?.points * COIN_TO_BDT).toFixed(2) || 0;
  pUsername.textContent = displayName.textContent;
  pTgId.textContent = tgIdEl.textContent;
};

// Firestore functions
async function ensureUserDoc() {
  if (!UID) return;
  const ref = doc(db, 'users', UID);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
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
async function loadUserData() {
  if (!UID) return;
  const ref = doc(db, 'users', UID);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    userData = snap.data();
    userData.points = userData.points || 0;
    userData.referrals = userData.referrals || 0;
    userData.referralPoints = userData.referralPoints || 0;

    pointsHome.textContent = String(userData.points);
    pPoints.textContent = String(userData.points);
    const money = (userData.points * COIN_TO_BDT).toFixed(2);
    moneyHome.textContent = `৳${money}`;
    pMoney.textContent = `৳${money}`;
    document.getElementById('refCount').textContent = String(userData.referrals);
    document.getElementById('refPoints').textContent = String(userData.referralPoints);
    refLink.value = `https://t.me/gravity_ad_bot?start=${UID}`;
    updateProfileUI(userData);
  } catch (e) {
    console.error("Error loading user data:", e);
  }
}

// Firebase auth & boot
async function boot() {
  const telegramData = initTelegram();
  TG_USER = telegramData.telegramUser;
  UID = telegramData.telegramId;

  await signInAnonymously(auth).catch(console.error);
  onAuthStateChanged(auth, async () => {
    await ensureUserDoc();
    await loadUserData();
  });
}
boot();

// Initialize ads, tasks, and withdrawal logic
watchAdBtn.addEventListener('click', () => {
  if (!UID) return alert('Auth not ready');
  showRewardedAd(async () => {
    try {
      await updateDoc(doc(db, 'users', UID), { points: increment(10) });
      await loadUserData();
    } catch (e) {
      console.error('Failed to update points:', e);
      alert('Failed to update points.');
    }
  });
});

setupTaskAndBonusListeners(db, UID, loadUserData);
setupWithdrawForm(withdrawForm, totalPointsDisplay, UID);

// Copy referral
copyRef.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(refLink.value);
    alert('Referral link copied!');
  } catch (e) {
    console.error(e);
    alert('Copy failed');
  }
});
