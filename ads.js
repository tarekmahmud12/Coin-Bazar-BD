// Monetag Ads Logic
export const showRewardedAd = async (pointsCallback) => {
  if (typeof window.show_9669121 !== "function") {
    alert("Ad script not loaded. Please wait a moment and try again.");
    return;
  }
  try {
    await window.show_9669121();
    pointsCallback();
  } catch (e) {
    console.error('Rewarded Interstitial failed, trying popup:', e);
    try {
      await window.show_9669121('pop');
      pointsCallback();
    } catch (err) {
      console.error("Ad function failed:", err);
      alert("Ad failed to load.");
    }
  }
};
