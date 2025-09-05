import { db, doc, setDoc, updateDoc, increment, serverTimestamp } from "./firebase.js";

export const setupWithdrawForm = (formEl, totalPointsDisplay, UID) => {
  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const method = document.getElementById('payMethod').value;
    const accountId = document.getElementById('accountId').value.trim();
    const amount = Number(document.getElementById('amount').value || 0);

    if (!method || !accountId || amount <= 0) return alert('Fill fields correctly');
    
    // Fetch user data to check if enough coins are available
    const userRef = doc(db, 'users', UID);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    if (amount > (userData.points || 0)) return alert('Not enough coins');

    // minimums (coins)
    const mins = { bkash: 10000, nagad: 10000, rocket: 10000, binance: 100000 };
    const min = mins[method] || 10000;
    if (amount < min) return alert(`Minimum ${min} coins for ${method}`);

    // deduct & create withdrawal record
    try {
      await updateDoc(doc(db, 'users', UID), { points: increment(-amount) });
      const wref = doc(db, 'withdrawals', `${UID}_${Date.now()}`);
      await setDoc(wref, {
        telegramId: UID,
        method, accountId, amount,
        status: 'pending', createdAt: serverTimestamp()
      });
      totalPointsDisplay.textContent = Number(totalPointsDisplay.textContent) - amount;
      alert('Withdrawal requested. We will process soon.');
      formEl.reset();
    } catch (e) {
      console.error(e);
      alert('Withdraw failed');
    }
  });
};