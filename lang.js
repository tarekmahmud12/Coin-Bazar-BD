// simple dictionary for en / bn
export const DICT = {
  en: {
    appTitle: "Coin Bazar",
    settings: "Settings",
    theme: "Theme",
    language: "Language",
    close: "Close",
    save: "Save",
    coins: "Coins",
    equivalent: "Equivalent",
    watchAd: "Watch Ad & Earn 10 Coins",
    tasksTitle: "Tasks",
    tasksDesc: "Complete tasks and earn coins.",
    referTitle: "Refer & Earn",
    referDesc: "Invite friends and earn.",
    bonusTitle: "Bonus",
    profileTitle: "Your Profile",
    withdrawTitle: "Withdraw",
    totalCoins: "Total Coins",
    totalMoney: "Equivalent",
    nav_home: "Home",
    nav_tasks: "Tasks",
    nav_refer: "Refer",
    nav_bonus: "Bonus",
    nav_profile: "Profile",
    ads_today: "Ads Today",
    ads_total: "Total Ads",
    cooldown_timer: "Cooldown",
    auth_error: "Authentication not ready. Please try again.",
    ad_watch_too_short: "You must watch the ad for at least 15 seconds.",
    ad_success: "🎉 You earned 10 coins!",
    redirect_after_ads: "Daily ad limit reached. Redirecting...",
    ad_not_ready: "Ad system not ready. Try again later.",
    ad_failed: "Ad failed to load. Try again later.",
    link_copied: "Referral link copied!",
    copy_failed: "Copy failed",
    fill_form: "Fill fields correctly",
    not_enough_coins: "Not enough coins",
    min_withdraw: "Minimum {} coins for []",
    withdraw_success: "Withdrawal requested. We will process soon.",
    withdraw_failed: "Withdraw failed",
    task1_title: "Watch full video",
    task1_desc: "Stay on the page 15s",
    task2_title: "Like the short",
    task2_desc: "Open and like the short"
  },
  bn: {
    appTitle: "Gravity Ad",
    settings: "সেটিংস",
    theme: "থিম",
    language: "ভাষা",
    close: "বন্ধ",
    save: "সেভ",
    coins: "কয়েন",
    equivalent: "মূল্য",
    watchAd: "এড দেখুন & ১০ কয়েন পান",
    tasksTitle: "টাস্ক",
    tasksDesc: "টাস্ক সম্পন্ন করে কয়েন অর্জন করুন।",
    referTitle: "রেফার ও উপার্জন",
    referDesc: "দোস্তদের আমন্ত্রণ করুন এবং উপার্জন করুন।",
    bonusTitle: "বোনাস",
    profileTitle: "আপনার প্রোফাইল",
    withdrawTitle: "উইথড্র",
    totalCoins: "মোট কয়েন",
    totalMoney: "অর্থমূল্য",
    nav_home: "হোম",
    nav_tasks: "টাস্ক",
    nav_refer: "রেফার",
    nav_bonus: "বোনাস",
    nav_profile: "প্রোফাইল",
    ads_today: "আজকের দেখা এডস",
    ads_total: "মোট দেখা এডস",
    cooldown_timer: "কুলডাউন",
    auth_error: "অ্যাক্সেস নেই। আবার চেষ্টা করুন।",
    ad_watch_too_short: "আপনাকে কমপক্ষে ১৫ সেকেন্ডের জন্য অ্যাডটি দেখতে হবে।",
    ad_success: "🎉 আপনি ১০ কয়েন পেয়েছেন!",
    redirect_after_ads: "দৈনিক অ্যাডের সীমা শেষ। রিডাইরেক্ট করা হচ্ছে...",
    ad_not_ready: "অ্যাড সিস্টেম প্রস্তুত নয়। পরে আবার চেষ্টা করুন।",
    ad_failed: "অ্যাড লোড হতে ব্যর্থ। পরে আবার চেষ্টা করুন।",
    link_copied: "রেফারেল লিংক কপি হয়েছে!",
    copy_failed: "কপি ব্যর্থ",
    fill_form: "সঠিকভাবে ফর্মটি পূরণ করুন",
    not_enough_coins: "পর্যাপ্ত কয়েন নেই",
    min_withdraw: "{} কয়েনের নিচে [] তে উইথড্র করা যাবে না",
    withdraw_success: "উইথড্র সফল হয়েছে। আমরা শীঘ্রই প্রক্রিয়া করব।",
    withdraw_failed: "উইথড্র ব্যর্থ হয়েছে",
    task1_title: "সম্পূর্ণ ভিডিও দেখুন",
    task1_desc: "কমপক্ষে ১৫ সেকেন্ড থাকুন",
    task2_title: "ভিডিওতে লাইক দিন",
    task2_desc: "লিংক খুলে লাইক দিন"
  }
};

// helper: set innerText by id for keys
export function applyLanguage(lang){
  const dict = DICT[lang] || DICT.en;
  
  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (dict[key]) {
      element.textContent = dict[key];
    }
  });

  // Specific IDs
  document.getElementById('appTitle').textContent = dict.appTitle;
  document.getElementById('settingsTitle').textContent = dict.settings;
  document.getElementById('watchAdText').textContent = dict.watchAd;
  document.getElementById('coinsLabel').textContent = dict.coins;
  document.getElementById('moneyLabel').textContent = dict.equivalent;
  document.getElementById('tasksTitle').textContent = dict.tasksTitle;
  document.getElementById('tasksDesc').textContent = dict.tasksDesc;
  document.getElementById('referTitle').textContent = dict.referTitle;
  document.getElementById('referDesc').textContent = dict.referDesc;
  document.getElementById('bonusTitle').textContent = dict.bonusTitle;
  document.getElementById('withdrawTitle').textContent = dict.withdrawTitle;
  document.getElementById('totalCoinsLabel').textContent = dict.totalCoins;
  document.getElementById('totalMoneyLabel').textContent = dict.totalMoney;
  document.getElementById('refLinkLabel').textContent = dict.referralLink;
  document.getElementById('payMethodLabel').textContent = dict.payMethod;
  document.getElementById('accountIdLabel').textContent = dict.accountId;
  document.getElementById('amountLabel').textContent = dict.amount;
  document.getElementById('copyRef').textContent = dict.copy;

    }
