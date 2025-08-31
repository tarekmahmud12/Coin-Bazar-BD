// simple dictionary for en / bn
export const DICT = {
  en: {
    appTitle: "Gravity Ad",
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
    home: "Home",
    tasks: "Tasks",
    refer: "Refer",
    bonus: "Bonus",
    profile: "Profile",
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
    coins: "কয়েন",
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
    home: "হোম",
    tasks: "টাস্ক",
    refer: "রেফার",
    bonus: "বোনাস",
    profile: "প্রোফাইল",
    task1_title: "সম্পূর্ণ ভিডিও দেখুন",
    task1_desc: "কমপক্ষে ১৫ সেকেন্ড থাকুন",
    task2_title: "ভিডিওতে লাইক দিন",
    task2_desc: "লিংক খুলে লাইক দিন"
  }
};

// helper: set innerText by id for keys
export function applyLanguage(lang){
  const dict = DICT[lang] || DICT.en;
  document.getElementById('appTitle').textContent = dict.appTitle;
  document.getElementById('settingsTitle').textContent = dict.settings || 'Settings';
  document.getElementById('watchAdText').textContent = dict.watchAd;
  document.getElementById('pointsHome').previousElementSibling?.setAttribute('data-i18n','');
  // labels
  document.getElementById('coinsLabel').textContent = dict.coins;
  document.getElementById('moneyLabel').textContent = dict.equivalent;
  document.getElementById('tasksTitle').textContent = dict.tasksTitle;
  document.getElementById('tasksDesc').textContent = dict.tasksDesc;
  document.getElementById('referTitle').textContent = dict.referTitle;
  document.getElementById('referDesc').textContent = dict.referDesc;
  document.getElementById('bonusTitle').textContent = dict.bonusTitle;
  document.getElementById('pPoints') && (document.getElementById('totalCoinsLabel').textContent = dict.totalCoins);
  document.getElementById('totalMoneyLabel') && (document.getElementById('totalMoneyLabel').textContent = dict.totalMoney);
  // bottom nav
  document.querySelectorAll('.bottom-nav .tab span').forEach((el, idx)=>{
    const keys = ['home','tasks','refer','bonus','profile'];
    el.textContent = dict[keys[idx]] || el.textContent;
  });
  // task item translations (if present)
  const t1 = dict.task1_title; const d1 = dict.task1_desc; const t2 = dict.task2_title; const d2 = dict.task2_desc;
  document.querySelectorAll('[data-i18n="task1_title"]').forEach(el=>el.textContent = t1);
  document.querySelectorAll('[data-i18n="task1_desc"]').forEach(el=>el.textContent = d1);
  document.querySelectorAll('[data-i18n="task2_title"]').forEach(el=>el.textContent = t2);
  document.querySelectorAll('[data-i18n="task2_desc"]').forEach(el=>el.textContent = d2);
}