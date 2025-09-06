import {
  db, auth, signInAnonymously, onAuthStateChanged,
  doc, setDoc, getDoc, updateDoc, increment, serverTimestamp
} from "./firebase.js";
import { DICT, applyLanguage } from "./lang.js";
import { setupTaskAndBonusListeners } from "./tasks.js";

// ======================= Telegram User Setup =======================
const tg = window.Telegram?.WebApp;
tg?.expand();
let TG_USER = tg?.initDataUnsafe?.user || null;
// Firebase UID ব্যবহার করার জন্য, TG_USER ID সরাসরি ব্যবহার করা যাবে না
let FIREBASE_UID = null;

console.log("🔹 Telegram User:", TG_USER);

// ======================= DOM Elements =======================
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
const adStatus = document.getElementById('adStatus');
const adsWatchedTodayEl = document.getElementById('adsWatchedToday');
const adsWatchedCounter = document.getElementById('adsWatched');
const cooldownTimerEl = document.getElementById('cooldownTimer');

const refLink = document.getElementById('refLink');
const copyRef = document.getElementById('copyRef');
const withdrawForm = document.getElementById('withdrawForm');

// ======================= Constants =======================
const COIN_TO_BDT = 0.01;
const DAILY_AD_LIMIT = 10;
const AD_COOLDOWN_MINUTES = 30;
const AD_REWARD_COINS = 10;
let userData = { points: 0, referrals: 0, referralPoints: 0, adsWatchedToday: 0, adsWatchedTotal: 0, lastAdWatch: null, lastResetDate: null };
let adCooldownInterval = null;
let theme = localStorage.getItem('theme') || 'auto';
let lang = localStorage.getItem('lang') || 'en';

// ======================= Theme =======================
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

// ======================= Language =======================
function applyLang(l) {
  lang = l;
  localStorage.setItem('lang', l);
  applyLanguage(l);
  languageSwitcher.value = l;
}
applyLang(lang);

// ======================= Settings =======================
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

// ======================= Telegram Theme Event =======================
tg?.onEvent?.('themeChanged', () => {
  if (theme === 'auto') applyThemeMode('auto');
});

// ======================= Navigation =======================
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.dataset.target;
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(target).classList.add('active');
  });
});

// ======================= Populate Telegram User =======================
function populateTelegram() {
  if (TG_USER) {
    profilePic.src = TG_USER.photo_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    displayName.textContent = TG_USER.first_name || TG_USER.username || 'User';
    tgIdEl.textContent = TG_USER.id;
    pUsername.textContent = TG_USER.username || TG_USER.first_name || 'User';
    pTgId.textContent = TG_USER.id;
    document.getElementById("pProfilePic").src = TG_USER.photo_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  }
}
populateTelegram();

// ======================= Ensure User Document =======================
async function ensureUserDoc() {
  if (!FIREBASE_UID) {
    console.warn("⚠️ No Firebase UID found!");
    return;
  }
  const ref = doc(db, 'users', FIREBASE_UID);
  const snap = await getDoc(ref);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!snap.exists()) {
    console.log("🆕 Creating Firestore user document...");
    await setDoc(ref, {
      firebaseUID: FIREBASE_UID,
      telegramId: TG_USER ? String(TG_USER.id) : null,
      username: TG_USER?.username || TG_USER?.first_name || 'User',
      photo: TG_USER?.photo_url || '',
      points: 0,
      referrals: 0,
      referralPoints: 0,
      adsWatchedToday: 0,
      adsWatchedTotal: 0,
      lastAdWatch: null,
      lastResetDate: serverTimestamp(),
      createdAt: serverTimestamp()
    });
  } else {
    console.log("✅ User document exists.");
    const data = snap.data();
    userData = data;
    const lastResetDate = data.lastResetDate?.toDate();
    if (lastResetDate && lastResetDate < today) {
      await updateDoc(ref, {
        adsWatchedToday: 0,
        lastResetDate: serverTimestamp()
      });
      console.log("🔄 Daily ad count reset.");
      userData.adsWatchedToday = 0;
    }
  }
}

// ======================= Load User Data =======================
async function loadUserData() {
  if (!FIREBASE_UID) return;
  const ref = doc(db, 'users', FIREBASE_UID);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    console.warn("⚠️ User data missing in Firestore!");
    return;
  }
  userData = snap.data();
  console.log("📥 User Data Loaded:", userData);

  pointsHome.textContent = String(userData.points);
  pPoints.textContent = String(userData.points);
  const money = (userData.points * COIN_TO_BDT).toFixed(2);
  moneyHome.textContent = `৳${money}`;
  pMoney.textContent = `৳${money}`;
  document.getElementById('refCount').textContent = String(userData.referrals);
  document.getElementById('refPoints').textContent = String(userData.referralPoints);
  refLink.value = `https://t.me/gravity_ad_bot?start=${TG_USER ? TG_USER.id : ''}`;

  adsWatchedTodayEl.textContent = String(userData.adsWatchedToday || 0);
  adsWatchedCounter.textContent = String(userData.adsWatchedToday || 0);

  if (userData.adsWatchedToday >= DAILY_AD_LIMIT) {
    checkAdCooldown();
  } else {
    watchAdBtn.disabled = false;
    cooldownTimerEl.classList.add('hidden');
    if (adCooldownInterval) {
      clearInterval(adCooldownInterval);
      adCooldownInterval = null;
    }
  }
}

// ======================= Ad Cooldown Logic =======================
function checkAdCooldown() {
  const now = Date.now();
  const lastAdTime = userData.lastAdWatch?.toDate()?.getTime() || 0;
  const cooldownEnd = lastAdTime + AD_COOLDOWN_MINUTES * 60 * 1000;

  if (cooldownEnd > now) {
    watchAdBtn.disabled = true;
    cooldownTimerEl.classList.remove('hidden');
    updateCooldownTimer(cooldownEnd);
    if (!adCooldownInterval) {
      adCooldownInterval = setInterval(() => {
        updateCooldownTimer(cooldownEnd);
      }, 1000);
    }
  } else {
    watchAdBtn.disabled = false;
    cooldownTimerEl.classList.add('hidden');
    if (adCooldownInterval) {
      clearInterval(adCooldownInterval);
      adCooldownInterval = null;
    }
  }
}

function updateCooldownTimer(cooldownEnd) {
  const now = Date.now();
  const remainingTime = cooldownEnd - now;
  if (remainingTime <= 0) {
    watchAdBtn.disabled = false;
    cooldownTimerEl.classList.add('hidden');
    clearInterval(adCooldownInterval);
    adCooldownInterval = null;
    return;
  }
  const minutes = Math.floor(remainingTime / (60 * 1000));
  const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
  cooldownTimerEl.textContent = `${DICT[lang].cooldown_timer || 'Cooldown'}: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// ======================= Firebase Boot =======================
async function boot() {
  console.log("🚀 Booting Firebase...");
  await signInAnonymously(auth).catch(console.error);
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      FIREBASE_UID = user.uid;
      console.log("✅ Firebase UID:", FIREBASE_UID);
      await ensureUserDoc();
      await loadUserData();
      setupTaskAndBonusListeners(db, FIREBASE_UID, loadUserData);
    } else {
      console.log("❌ Firebase user not authenticated.");
    }
  });
}
boot();

// ======================= Watch Ads =======================
watchAdBtn.addEventListener('click', async () => {
  if (!FIREBASE_UID) {
    console.error("❌ Firebase UID missing. Cannot reward points.");
    return alert(DICT[lang].auth_error);
  }

  if (watchAdBtn.disabled) {
    return;
  }

  const startTime = Date.now();

  try {
    if (typeof window.show_9669121 === 'function') {
      console.log("✅ Monetag SDK Loaded. Showing ad...");
      await window.show_9669121();
      const watchTime = Date.now() - startTime;

      if (watchTime < 15000) {
        alert(DICT[lang].ad_watch_too_short);
        return;
      }

      console.log("🎯 Ad watched successfully. Updating Firestore...");

      const updatedAdsWatched = (userData.adsWatchedToday || 0) + 1;
      const isLastAd = updatedAdsWatched >= DAILY_AD_LIMIT;

      await updateDoc(doc(db, 'users', FIREBASE_UID), {
        points: increment(AD_REWARD_COINS),
        adsWatchedToday: increment(1),
        adsWatchedTotal: increment(1),
        lastAdWatch: serverTimestamp()
      });

      console.log("✅ Firestore points updated!");
      await loadUserData();
      alert(DICT[lang].ad_success);

      if (isLastAd) {
        checkAdCooldown();
        alert(DICT[lang].redirect_after_ads);
        setTimeout(() => {
          // window.location.href = "YOUR_REDIRECT_LINK_HERE";
        }, 3000);
      }

    } else {
      console.warn("⚠️ Monetag SDK not loaded yet!");
      alert(DICT[lang].ad_not_ready);
    }
  } catch (err) {
    console.error("❌ Ad failed:", err);
    alert(DICT[lang].ad_failed);
  }
});

// ======================= Copy Referral =======================
copyRef.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(refLink.value);
    alert(DICT[lang].link_copied);
  } catch (e) {
    console.error(e);
    alert(DICT[lang].copy_failed);
  }
});

// ======================= Withdraw Form =======================
withdrawForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const method = document.getElementById('payMethod').value;
  const accountId = document.getElementById('accountId').value.trim();
  const amount = Number(document.getElementById('amount').value || 0);

  if (!method || !accountId || amount <= 0) return alert(DICT[lang].fill_form);
  if (amount > (userData.points || 0)) return alert(DICT[lang].not_enough_coins);

  const mins = { bkash: 10000, nagad: 10000, rocket: 10000, binance: 100000 };
  const min = mins[method] || 10000;
  if (amount < min) return alert(DICT[lang].min_withdraw.replace('{}', min).replace('[]', method));

  try {
    await updateDoc(doc(db, 'users', FIREBASE_UID), { points: increment(-amount) });
    const wref = doc(db, 'withdrawals', `${FIREBASE_UID}_${Date.now()}`);
    await setDoc(wref, {
      telegramId: TG_USER ? String(TG_USER.id) : null,
      firebaseUID: FIREBASE_UID,
      method,
      accountId,
      amount,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    await loadUserData();
    alert(DICT[lang].withdraw_success);
    withdrawForm.reset();
  } catch (e) {
    console.error(e);
    alert(DICT[lang].withdraw_failed);
  }
});
