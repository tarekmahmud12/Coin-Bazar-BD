import { db, doc, updateDoc, increment, getDoc } from "./firebase.js";

// Tasks & Bonus logic
export const setupTaskAndBonusListeners = (firestoreDb, userId, onLoadCallback) => {
  if (!userId) {
    console.warn("User ID not available for tasks/bonus setup.");
    return;
  }

  // Task listener
  document.querySelectorAll('.task-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const url = btn.dataset.url;
      const pts = Number(btn.dataset.points || 0);
      const taskId = btn.dataset.taskId;

      // Check if task is already completed
      const userRef = doc(firestoreDb, 'users', userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      if (userData && userData.completedTasks && userData.completedTasks[taskId]) {
        alert("You have already completed this task!");
        return;
      }

      const w = window.open(url, '_blank');
      let awarded = false;
      const required = 15; // seconds
      let elapsed = 0;
      const timer = setInterval(async () => {
        elapsed++;
        if (elapsed >= required && !awarded) {
          awarded = true;
          clearInterval(timer);
          try {
            await updateDoc(userRef, {
              points: increment(pts),
              [`completedTasks.${taskId}`]: true // Mark task as completed
            });
            await onLoadCallback();
            alert(`Task complete: +${pts} coins`);
          } catch (e) {
            console.error(e);
            alert('Failed to award points');
          }
        }
        if (w && w.closed && !awarded) {
          clearInterval(timer);
          alert('You closed the task early. No coins awarded.');
        }
      }, 1000);
    });
  });

  // Bonus listener
  document.querySelectorAll('.bonus-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const link = btn.dataset.link;
      const pts = Number(btn.dataset.points || 0);
      window.open(link, '_blank');

      const userRef = doc(firestoreDb, 'users', userId);
      const snap = await getDoc(userRef);
      const data = snap.data() || {};
      const key = `bonus_${link}_claimed`;
      if (data[key]) {
        alert('Already claimed');
        return;
      }

      const update = { [key]: true, points: increment(pts) };
      await updateDoc(userRef, update);
      await onLoadCallback();
      alert(`Bonus +${pts} coins added`);
    });
  });
};
