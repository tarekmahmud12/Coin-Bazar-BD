// Telegram WebApp init
export const initTelegram = () => {
  let telegramUser = null;
  let telegramId = null;
  let referrerCode = null;
  try {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
      telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
      telegramId = String(telegramUser.id);
      referrerCode = window.Telegram.WebApp.initDataUnsafe.start_param || null;
    } else {
      telegramId = 'fallback-test-user-id';
      telegramUser = { id: telegramId, first_name: 'Fallback', last_name: 'User', username: 'fallback_user' };
    }
  } catch (e) {
    console.error("Telegram init error:", e);
    telegramId = 'fallback-test-user-id';
    telegramUser = { id: telegramId, first_name: 'Fallback', last_name: 'User', username: 'fallback_user' };
  }
  return { telegramUser, telegramId, referrerCode };
};
