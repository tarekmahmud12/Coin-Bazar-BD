import { auth, db } from './firebase.js';
import { signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, increment, collection } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

    const profilePic = document.getElementById('profile-pic');
    const userNameDisplay = document.getElementById('user-name-display');
    const totalPointsDisplay = document.getElementById('total-points');
    const watchAdBtn = document.querySelector('.watch-ad-btn');

    let firebaseUID = null;
    let telegramUser = null;
    let telegramId = null;
    let totalPoints = 0;

    // Telegram WebApp Integration
    try {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
            telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
            telegramId = String(telegramUser.id);
            if (telegramUser.photo_url) profilePic.src = telegramUser.photo_url;
            userNameDisplay.textContent = telegramUser.first_name;
        }
    } catch(e) {
        console.warn("Telegram init error", e);
    }

    // Firebase Anonymous Auth
    signInAnonymously(auth).catch(console.error);
    onAuthStateChanged(auth, async (user) => {
        if(!user) return;
        firebaseUID = user.uid;
        const userDoc = doc(db, "users", firebaseUID);
        const snap = await getDoc(userDoc);

        if(snap.exists()) {
            const data = snap.data();
            totalPoints = data.points || 0;
        } else {
            await setDoc(userDoc, {
                firebaseUID,
                telegramId,
                userName: telegramUser?.first_name || 'User',
                points: 0,
                lastUpdated: serverTimestamp()
            });
            totalPoints = 0;
        }
        totalPointsDisplay.textContent = totalPoints;
    });

    // Watch Ad Logic (Monetag)
    watchAdBtn.addEventListener('click', async () => {
        if(typeof window.show_9669121 === 'function') {
            window.show_9669121().then(async () => {
                totalPoints += 10;
                totalPointsDisplay.textContent = totalPoints;
                const userDoc = doc(db, "users", firebaseUID);
                await updateDoc(userDoc, { points: increment(10), lastUpdated: serverTimestamp() });
                alert('You earned 10 points!');
            }).catch(console.error);
        } else {
            alert('Ad script not loaded.');
        }
    });

});