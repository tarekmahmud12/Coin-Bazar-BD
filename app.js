// Main app logic
import { auth, usersDocRef, signInAnonymously, onAuthStateChanged, increment, updateDoc, getDoc } from './firebase.js';
import { initTelegram, telegramUser, telegramId, referrerCode } from './telegram.js';
import { showRewardedAd } from './ads.js';
import { updateTaskButtons, updateBonusButtons } from './tasks.js';
import { setupWithdrawForm } from './withdraw.js';

document.addEventListener('DOMContentLoaded', async () => {
  const telegramInfo = initTelegram();

  // UI elements
  const userNameDisplay = document.getElementById('user-name-display');
  const profilePic = document.getElementById('profile-pic');
  const totalPointsDisplay = document.getElementById('total-points');
  const watchAdBtn = document.querySelector('.watch-ad-btn');

  let totalPoints = 0;
  let taskTimers = {};
  let bonusClaimed = {};

  // Auth
  let firebaseUID = null;
  signInAnonymously(auth).catch(console.error);
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    firebaseUID = user.uid;

    // Load user data
    const snap = await getDoc(usersDocRef(firebaseUID));
    if (snap.exists()) {
      const data = snap.data();
      totalPoints = data.points || 0;
      taskTimers = data.taskTimers || {};
      bonusClaimed = data.bonusClaimed || {};
      userNameDisplay.textContent = data.userName || telegramUser.first_name;
      profilePic.src = telegramUser.photo_url || '';
    } else {
      // New user
      await updateDoc(usersDocRef(firebaseUID), {
        userName: telegramUser.first_name,
        points: 0,
        taskTimers: {},
        bonusClaimed: {}
      });
      userNameDisplay.textContent = telegramUser.first_name;
      profilePic.src = telegramUser.photo_url || '';
    }

    // Setup withdraw form
    const withdrawForm = document.getElementById('withdraw-form');
    if (withdrawForm) withdrawForm.dataset.uid = firebaseUID;
    setupWithdrawForm(withdrawForm, totalPointsDisplay);
  });

  // Watch Ad
  watchAdBtn.addEventListener('click', async () => {
    await showRewardedAd(() => {
      totalPoints += 10;
      totalPointsDisplay.textContent = totalPoints;
      if (firebaseUID) updateDoc(usersDocRef(firebaseUID), { points: increment(10) });
    });
  });
});