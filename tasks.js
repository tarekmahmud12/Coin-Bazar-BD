// Tasks & Bonus logic
export const updateTaskButtons = (taskButtons, taskTimers, pointsPerTask) => {
  const now = Date.now();
  taskButtons.forEach(button => {
    const taskId = button.dataset.taskId;
    const saved = taskTimers[taskId];
    let cooldownEndTime = saved ? new Date(saved).getTime() : null;

    if (cooldownEndTime && now < cooldownEndTime) {
      const timeLeft = Math.floor((cooldownEndTime - now) / 1000);
      const hours = Math.floor(timeLeft / 3600);
      const minutes = Math.floor((timeLeft % 3600) / 60);
      const seconds = timeLeft % 60;
      button.textContent = `Active in: ${hours}:${minutes}:${seconds}`;
      button.disabled = true;
    } else {
      button.textContent = `Task ${taskId}: +${pointsPerTask} Points`;
      button.disabled = false;
    }
  });
};

export const updateBonusButtons = (bonusButtons, bonusClaimed) => {
  bonusButtons.forEach(btn => {
    const bonusName = btn.dataset.bonusName;
    if (bonusClaimed[bonusName]) {
      btn.textContent = 'Join Now';
      btn.disabled = false;
    } else {
      btn.textContent = `+${btn.dataset.bonusPoints} Points`;
      btn.disabled = false;
    }
  });
};