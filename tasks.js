import { db, doc, updateDoc, increment, getDoc } from "./firebase.js";

const tasks = document.querySelectorAll('.task-item');
const ONE_HOUR_MS = 60 * 60 * 1000;

export const setupTaskAndBonusListeners = (firestoreDb, userId, onLoadCallback) => {
  if (!userId) {
    console.warn("User ID not available for tasks/bonus setup.");
    return;
  }

  // Bonus listener - (kept from your original code)
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

  // Tasks Logic - Updated for your request
  tasks.forEach(taskItem => {
    const taskId = taskItem.dataset.taskId;
    const btn = taskItem.querySelector('.task-btn');
    const url = btn.dataset.url;
    const points = Number(btn.dataset.points || 0);
    const duration = Number(btn.dataset.duration || 0);
    const taskTitle = taskItem.querySelector('.task-title').textContent;

    const userRef = doc(firestoreDb, 'users', userId);

    const updateTaskState = async () => {
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() || {};
      const taskStatus = userData.completedTasks?.[taskId];

      if (taskStatus) {
        const lastCompletionTime = taskStatus.toMillis();
        const elapsedTime = Date.now() - lastCompletionTime;
        if (elapsedTime < ONE_HOUR_MS) {
          const remainingTime = ONE_HOUR_MS - elapsedTime;
          const minutes = Math.ceil(remainingTime / (60 * 1000));
          btn.disabled = true;
          btn.textContent = `Completed (${minutes}m left)`;
        } else {
          btn.disabled = false;
          btn.textContent = 'Do';
        }
      } else {
        btn.disabled = false;
        btn.textContent = 'Do';
      }
    };

    updateTaskState();
    setInterval(updateTaskState, 30 * 1000); // Check every 30 seconds

    btn.addEventListener('click', async () => {
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() || {};
      const taskStatus = userData.completedTasks?.[taskId];

      if (taskStatus) {
        const lastCompletionTime = taskStatus.toMillis();
        if (Date.now() - lastCompletionTime < ONE_HOUR_MS) {
          alert("You have already completed this task. Please wait for the cooldown to end.");
          return;
        }
      }

      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        alert("Failed to open the link. Please check your browser's pop-up settings.");
        return;
      }

      btn.disabled = true;
      let timer = duration;
      btn.textContent = `Waiting (${timer}s)`;

      const interval = setInterval(() => {
        timer--;
        btn.textContent = `Waiting (${timer}s)`;
        if (timer <= 0) {
          clearInterval(interval);
          btn.textContent = `Claim +${points}`;
          btn.disabled = false;
          btn.dataset.status = 'ready-to-claim';
          alert("Task is completed. Please click 'Claim' to get your coins.");
        }
      }, 1000);

      const checkWindowInterval = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(interval);
          clearInterval(checkWindowInterval);
          if (btn.dataset.status !== 'ready-to-claim') {
            alert("Task failed: You closed the page too early.");
            btn.textContent = 'Do';
            btn.disabled = false;
          }
        }
      }, 500);
    });

    taskItem.addEventListener('click', async (event) => {
      const targetBtn = event.target.closest('.task-btn');
      if (targetBtn && targetBtn.dataset.status === 'ready-to-claim') {
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data() || {};
        const taskStatus = userData.completedTasks?.[taskId];

        if (taskStatus && Date.now() - taskStatus.toMillis() < ONE_HOUR_MS) {
          alert("You have already claimed this task recently.");
          targetBtn.textContent = 'Do';
          delete targetBtn.dataset.status;
          return;
        }

        try {
          await updateDoc(userRef, {
            points: increment(points),
            [`completedTasks.${taskId}`]: new Date()
          });
          onLoadCallback();
          alert(`Task completed: +${points} coins`);
          targetBtn.textContent = 'Completed';
          delete targetBtn.dataset.status;
          targetBtn.disabled = true;
        } catch (e) {
          console.error(e);
          alert('Failed to award points.');
          targetBtn.textContent = 'Do';
          delete targetBtn.dataset.status;
          targetBtn.disabled = false;
        }
      }
    });
  });
};
