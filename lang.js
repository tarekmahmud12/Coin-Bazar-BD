// ===================== Language Dictionary =====================
export const DICT = {
  en: {
    app_title: "Gravity Ad",
    settings_title: "Settings",
    theme: "Theme",
    theme_auto: "Auto",
    theme_light: "Light",
    theme_dark: "Dark",
    language: "Language",
    close: "Close",
    save: "Save",
    coins: "Coins",
    equivalent: "Equivalent",
    watch_ad: "Watch Ad & Earn 10 Coins",
    ads_today: "Ads Watched Today",
    ads_total: "Total Ads Watched",
    tasks_title: "Tasks",
    tasks_desc: "Complete tasks and earn coins.",
    refer_title: "Refer & Earn",
    refer_desc: "Invite friends and earn.",
    bonus_title: "Bonus",
    profile_title: "Your Profile",
    withdraw_title: "Withdraw",
    total_coins: "Total Coins",
    total_money: "Equivalent",
    nav_home: "Home",
    nav_tasks: "Tasks",
    nav_refer: "Refer",
    nav_bonus: "Bonus",
    nav_profile: "Profile",
    task1_title: "Watch full video",
    task1_desc: "Stay on the page 15s",
    task2_title: "Like the short",
    task2_desc: "Open and like the short",
    pay_method: "Payment Method",
    account_id: "Account ID",
    amount: "Amount (coins)",
    withdraw_btn: "Withdraw",
    reset: "Reset",
    join: "Join",
    copy: "Copy",
    ref_link_label: "Your referral link",
    referrals: "Referrals",
    ref_points: "Referral Points",
    bonus_subscribe: "Subscribe Channel",
    telegram_id: "Telegram ID"
  },
  bn: {
    app_title: "গ্রাভিটি অ্যাড",
    settings_title: "সেটিংস",
    theme: "থিম",
    theme_auto: "অটো",
    theme_light: "লাইট",
    theme_dark: "ডার্ক",
    language: "ভাষা",
    close: "বন্ধ",
    save: "সেভ",
    coins: "কয়েন",
    equivalent: "মূল্য",
    watch_ad: "এড দেখুন & ১০ কয়েন পান",
    ads_today: "আজকের দেখা এডস",
    ads_total: "মোট দেখা এডস",
    tasks_title: "টাস্ক",
    tasks_desc: "টাস্ক সম্পন্ন করে কয়েন অর্জন করুন।",
    refer_title: "রেফার ও উপার্জন",
    refer_desc: "বন্ধুদের আমন্ত্রণ করুন এবং উপার্জন করুন।",
    bonus_title: "বোনাস",
    profile_title: "আপনার প্রোফাইল",
    withdraw_title: "উইথড্র",
    total_coins: "মোট কয়েন",
    total_money: "অর্থমূল্য",
    nav_home: "হোম",
    nav_tasks: "টাস্ক",
    nav_refer: "রেফার",
    nav_bonus: "বোনাস",
    nav_profile: "প্রোফাইল",
    task1_title: "সম্পূর্ণ ভিডিও দেখুন",
    task1_desc: "কমপক্ষে ১৫ সেকেন্ড থাকুন",
    task2_title: "ভিডিওতে লাইক দিন",
    task2_desc: "লিংক খুলে লাইক দিন",
    pay_method: "পেমেন্ট পদ্ধতি",
    account_id: "অ্যাকাউন্ট আইডি",
    amount: "পরিমাণ (কয়েন)",
    withdraw_btn: "উইথড্র",
    reset: "রিসেট",
    join: "জয়েন",
    copy: "কপি",
    ref_link_label: "আপনার রেফারেল লিংক",
    referrals: "রেফার",
    ref_points: "রেফারেল পয়েন্ট",
    bonus_subscribe: "চ্যানেলে সাবস্ক্রাইব করুন",
    telegram_id: "টেলিগ্রাম আইডি"
  }
};

// ===================== Apply Language Function =====================
export function applyLanguage(lang) {
  // যদি ভুল ভাষা আসে, ডিফল্ট ইংরেজি নেবে
  const dict = DICT[lang] || DICT.en;

  // সব data-i18n এলিমেন্টকে খুঁজে বের করব
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // সিলেক্ট ইনপুটের ভ্যালু সেট করব
  const langSwitcher = document.getElementById("languageSwitcher");
  if (langSwitcher) {
    langSwitcher.value = lang;
  }

  // নির্বাচিত ভাষা localStorage-এ সেভ করে রাখব
  localStorage.setItem("selectedLang", lang);
}

// ===================== Initialize Language =====================
document.addEventListener("DOMContentLoaded", () => {
  // localStorage থেকে ভাষা লোড করব, না থাকলে ইংরেজি নেবে
  const savedLang = localStorage.getItem("selectedLang") || "en";
  applyLanguage(savedLang);

  // ভাষা পরিবর্তন হলে আপডেট হবে
  const langSwitcher = document.getElementById("languageSwitcher");
  if (langSwitcher) {
    langSwitcher.addEventListener("change", (e) => {
      applyLanguage(e.target.value);
    });
  }
});