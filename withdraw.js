// Withdraw logic
import { usersDocRef, withdrawalsCollectionRef, serverNow } from './firebase.js';

export const setupWithdrawForm = (formEl, totalPointsDisplay) => {
  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    const paymentMethod = formEl.querySelector('#payment-method').value;
    const amount = Number(formEl.querySelector('#amount').value || 0);
    const accountId = formEl.querySelector('#account-id').value.trim();

    if (!paymentMethod || amount <= 0 || !accountId) {
      alert('Please fill all fields.');
      return;
    }

    // Firebase uid required
    const firebaseUID = formEl.dataset.uid;
    if (!firebaseUID) { alert("Auth error"); return; }

    try {
      // Deduct points
      await updateDoc(usersDocRef(firebaseUID), { points: increment(-amount) });

      // Create withdrawal request
      await setDoc(doc(withdrawalsCollectionRef()), {
        firebaseUID, paymentMethod, accountId, amount, status: 'pending', timestamp: serverNow()
      });

      alert('Withdrawal submitted!');
      formEl.reset();
      totalPointsDisplay.textContent = Number(totalPointsDisplay.textContent) - amount;
    } catch (e) {
      console.error(e);
      alert('Withdraw failed.');
    }
  });
};