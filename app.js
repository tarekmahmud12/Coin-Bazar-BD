import {
  db, auth, signInAnonymously, onAuthStateChanged,
  doc, setDoc, getDoc, updateDoc, increment, serverTimestamp
} from "./firebase.js";

/* ---------- Telegram WebApp ---------- */
const tg = window.Telegram?.WebApp;
tg?.expand();

let TG_USER = tg?.initDataUnsafe?.user || null;
let UID = TG_USER ? String(TG_USER.id) : null;

// UI bindings
const pages = {
  home: document.getElementById("page-home"),
  ads: document.getElementById("page-ads"),
  refer: document.getElementById("page-refer"),
  bonus: document.getElementById("page-bonus"),
  profile: document.getElementById("page-profile"),
};
const tabs = document.querySelectorAll(".bottom-nav .tab");

// Theme: follow Telegram
function applyTheme() {
  const scheme = tg?.colorScheme || "dark";
  document.body.classList.toggle("light", scheme === "light");
  document.getElementById("modePill").textContent = scheme[0].toUpperCase() + scheme.slice(1);
}
applyTheme();
tg?.onEvent("themeChanged", applyTheme);

// Nav
tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const id = btn.dataset.target;
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
  });
});
document.querySelectorAll(".nav-link").forEach(a=>{
  a.addEventListener("click", (e)=>{
    e.preventDefault();
    const id = a.dataset.target;
    tabs.forEach(b => b.classList.toggle("active", b.dataset.target===id));
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
  });
});

/* ---------- Populate Telegram info ---------- */
function populateProfileUI() {
  const avatar = document.getElementById("profilePic");
  const name = document.getElementById("displayName");
  const tgId = document.getElementById("tgId");
  const pUser = document.getElementById("pUsername");
  const pTgId = document.getElementById("pTgId");

  if (TG_USER) {
    avatar.src = TG_USER.photo_url || avatar.src;
    name.textContent = TG_USER.first_name || "User";
    tgId.textContent = UID;
    pUser.textContent = TG_USER.username || TG_USER.first_name || "User";
    pTgId.textContent = UID;
  } else {
    name.textContent = "Guest";
    tgId.textContent = "—";
    pUser.textContent = "Guest";
    pTgId.textContent = "—";
  }
}

/* ---------- Firestore Auth / Data ---------- */
async function ensureUserDoc() {
  const ref = doc(db, "users", UID);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      telegramId: UID,
      username: TG_USER?.username || TG_USER?.first_name || "User",
      points: 0,
      referrals: 0,
      referralPoints: 0,
      createdAt: serverTimestamp()
    });
  }
}

async function loadAndBind() {
  const ref = doc(db, "users", UID);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const d = snap.data();
  // Home/Profile
  document.getElementById("pointsHome").textContent = d.points || 0;
  document.getElementById("pPoints").textContent = d.points || 0;
  document.getElementById("refCountHome").textContent = d.referrals || 0;
  // Refer
  document.getElementById("refCount").textContent = d.referrals || 0;
  document.getElementById("refPoints").textContent = d.referralPoints || 0;
  document.getElementById("refLink").value = `https://t.me/gravity_ad_bot?start=${UID}`;
}

/* ---------- Ads Logic (Monetag) ---------- */
const pointsPerAd = 10;
const cycleMax = 10;
let cycleWatched = 0;
let cooldownEnds = null;
const cooldownMinutes = 30;

const watchAdBtn = document.getElementById("watchAdBtn");
const cycleWatchedEl = document.getElementById("cycleWatched");
const cycleMaxEl = document.getElementById("cycleMax");
const adTimerEl = document.getElementById("adTimer");

cycleMaxEl.textContent = String(cycleMax);

function formatLeft(sec){
  if (sec<=0) return "Ready";
  const m = Math.floor(sec/60), s = sec%60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function tickTimer(){
  if (!cooldownEnds) return;
  const left = Math.max(0, Math.floor((cooldownEnds - Date.now())/1000));
  adTimerEl.textContent = formatLeft(left);
  if (left <= 0) {
    cooldownEnds = null;
    cycleWatched = 0;
    updateAdUI();
  } else {
    requestAnimationFrame(()=>setTimeout(tickTimer, 250));
  }
}
function updateAdUI(){
  cycleWatchedEl.textContent = String(cycleWatched);
  if (cooldownEnds) {
    watchAdBtn.disabled = true;
    tickTimer();
  } else {
    adTimerEl.textContent = "Ready";
    watchAdBtn.disabled = cycleWatched >= cycleMax;
  }
}
updateAdUI();

watchAdBtn.addEventListener("click", async ()=>{
  if (watchAdBtn.disabled) return;

  try {
    await window.show_9669121(); // rewarded interstitial
    // reward on success
    await updateDoc(doc(db,"users",UID), { points: increment(pointsPerAd) });
    cycleWatched++;
    if (cycleWatched >= cycleMax) {
      cooldownEnds = Date.now() + cooldownMinutes*60*1000;
    }
    await loadAndBind();
    updateAdUI();
    alert(`You earned ${pointsPerAd} points!`);
  } catch (e) {
    // fallback: popup
    try {
      await window.show_9669121('pop');
      await updateDoc(doc(db,"users",UID), { points: increment(pointsPerAd) });
      cycleWatched++;
      if (cycleWatched >= cycleMax) {
        cooldownEnds = Date.now() + cooldownMinutes*60*1000;
      }
      await loadAndBind();
      updateAdUI();
      alert(`You earned ${pointsPerAd} points!`);
    } catch {
      alert("Ad failed to load. Please try again.");
    }
  }
});

/* ---------- Refer ---------- */
document.getElementById("copyRef").addEventListener("click", async ()=>{
  const v = document.getElementById("refLink").value;
  await navigator.clipboard.writeText(v);
  alert("Referral link copied!");
});

/* ---------- Bonus ---------- */
document.querySelectorAll(".bonus-btn").forEach(btn=>{
  btn.addEventListener("click", async ()=>{
    const name = btn.dataset.name;
    const link = btn.dataset.link;
    const pts = Number(btn.dataset.points || 0);

    // open channel
    window.open(link, "_blank");

    // write claimed flag + points
    const ref = doc(db,"users",UID);
    const snap = await getDoc(ref);
    const data = snap.data() || {};
    const key = `bonus_${name}_claimed`;
    if (data[key]) {
      // already claimed
      return;
    }
    await updateDoc(ref, { [key]: true, points: increment(pts) });
    await loadAndBind();
    alert(`Bonus +${pts} added!`);
  });
});

/* ---------- Withdraw ---------- */
document.getElementById("withdrawForm").addEventListener("submit", async (e)=>{
  e.preventDefault();
  const method = document.getElementById("payMethod").value;
  const accountId = document.getElementById("accountId").value.trim();
  const amount = Number(document.getElementById("amount").value);
  if (!method || !accountId || amount<=0) return alert("Fill all fields.");

  // Minimums by method
  const mins = { bkash:10000, nagad:10000, rocket:10000, binance:100000 };
  const minAmt = mins[method] || 10000;
  if (amount < minAmt) return alert(`Minimum is ${minAmt} points for ${method}.`);

  const uref = doc(db,"users",UID);
  const usnap = await getDoc(uref);
  const pts = (usnap.data()?.points)||0;
  if (amount > pts) return alert("Not enough points.");

  // deduct & create withdrawal
  await updateDoc(uref, { points: increment(-amount) });
  const wref = doc(db, "withdrawals", `${UID}_${Date.now()}`);
  await setDoc(wref, {
    telegramId: UID,
    method, accountId, amount,
    status: "pending", createdAt: serverTimestamp()
  });

  await loadAndBind();
  alert("Withdrawal requested. We’ll process soon.");
});

/* ---------- Boot ---------- */
async function boot() {
  populateProfileUI();

  // Anonymous auth only to enable Firestore from client
  await signInAnonymously(auth);

  onAuthStateChanged(auth, async (u)=>{
    if (!UID) {
      // If not inside Telegram, create a fallback guest id (for testing)
      UID = u?.uid || `guest_${Math.random().toString(36).slice(2,9)}`;
    }
    await ensureUserDoc();
    await loadAndBind();
  });
}
boot();