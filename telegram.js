// Telegram WebApp init
export let telegramUser = null;
export let telegramId = null;
export let referrerCode = null;

export const initTelegram = () => {
  try {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe) {
      telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
      telegramId = String(telegramUser.id);
      referrerCode = window.Telegram.WebApp.initDataUnsafe.start_param || null;
      return { telegramUser, telegramId, referrerCode };
    } else {
      telegramId = 'fallback-test-user-id';
      telegramUser = { id: telegramId, first_name: 'Fallback', last_name: 'User', username: 'fallback_user' };
      return { telegramUser, telegramId, referrerCode: null };
    }
  } catch (e) {
    console.error("Telegram init error:", e);
    telegramId = 'fallback-test-user-id';
    telegramUser = { id: telegramId, first_name: 'Fallback', last_name: 'User', username: 'fallback_user' };
    return { telegramUser, telegramId, referrerCode: null };
  }
};