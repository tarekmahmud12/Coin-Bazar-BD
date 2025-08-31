import { db, auth, doc, setDoc, getDoc, updateDoc, signInAnonymously, onAuthStateChanged, serverTimestamp, increment } from './firebase.js';

const telegram = window.Telegram.WebApp;
telegram.expand();

let userData = {};
let userId;

// Telegram User Init
if (telegram.initDataUnsafe && telegram.initDataUnsafe.user) {
  const user = telegram.initDataUnsafe.user;
  userId = user.id.toString();
  document.getElementById('profile-pic').src = user.photo_url || "default.png";
  document.getElementById('username').textContent = user.first_name;
  document.getElementById('telegram-id').textContent = userId;
  document.getElementById('profile-username').textContent = user.username || user.first_name;
  document.getElementById('profile-telegram-id').textContent = userId;
}

// Firebase Auth Anonymous
signInAnonymously(auth).catch(console.error);

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        username: telegram.initDataUnsafe.user.username,
        telegramId: userId,
        points: 0,
        referrals: 0,
        referralPoints: 0,
        createdAt: serverTimestamp()
      });
    }
    loadUserData();
  }
});

async function loadUserData() {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    userData = snap.data();
    document.getElementById('points').textContent = userData.points || 0;
    document.getElementById('profile-points').textContent = userData.points || 0;
    document.getElementById('referral-count').textContent = userData.referrals || 0;
    document.getElementById('referral-points').textContent = userData.referralPoints || 0;
    document.getElementById('referral-link').value = `https://t.me/gravity_ad_bot?start=${userId}`;
  }
}

// Watch Ads
document.getElementById('watch-ad-btn').addEventListener('click', async () => {
  try {
    await window.show_9669121().then(async () => {
      await updateDoc(doc(db, "users", userId), { points: increment(10) });
      loadUserData();
      alert("You earned 10 points!");
    });
  } catch (e) {
    alert("Ad failed to load, try again later!");
  }
});

// Copy Referral Link
document.getElementById('copy-referral').addEventListener('click', () => {
  const link = document.getElementById('referral-link');
  link.select();
  document.execCommand('copy');
  alert("Referral link copied!");
});

// Withdraw Points
document.getElementById('withdraw-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const amount = parseInt(document.getElementById('withdraw-amount').value);
  const method = document.getElementById('payment-method').value;
  const accountId = document.getElementById('account-id').value;

  if (amount <= 0 || amount > userData.points) {
    return alert("Invalid amount");
  }

  await updateDoc(doc(db, "users", userId), { points: increment(-amount) });
  await setDoc(doc(db, "withdrawals", `${userId}_${Date.now()}`), {
    telegramId: userId,
    amount,
    method,
    accountId,
    status: "pending",
    createdAt: serverTimestamp()
  });
  alert("Withdrawal request submitted!");
  loadUserData();
});