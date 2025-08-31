// Monetag Ads Logic
export const showRewardedAd = async (pointsCallback) => {
  if (typeof window.show_9669121 !== "function") {
    alert("Ad script not loaded.");
    return;
  }
  try {
    await window.show_9669121().then(() => {
      pointsCallback();
      alert("You earned points from the ad!");
    }).catch(async (e) => {
      console.error('Rewarded Interstitial failed, trying popup:', e);
      await window.show_9669121('pop').then(() => {
        pointsCallback();
      }).catch(e => alert('Ad failed: ' + e));
    });
  } catch (e) {
    console.error("Ad function failed:", e);
    alert("Ad failed.");
  }
};