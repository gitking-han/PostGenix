const checkAndResetCredits = async (user) => {
  // 1. If user is 'pro' AND status is 'active', they have unlimited credits
  // We check subscriptionStatus to ensure their payment didn't fail
  if (user.plan === 'pro' && user.subscriptionStatus === 'active') {
    return user;
  }

  // 2. Otherwise (Free users or Inactive Pro users), apply 12-hour limit
  const now = new Date();
  const lastReset = new Date(user.lastCreditReset);
  
  // Calculate difference in hours
  const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);

  // If 12 hours or more have passed, reset tokens to 10
  if (hoursSinceReset >= 12) {
    user.credits = 10;
    user.lastCreditReset = now;
    // Note: We only save here if the data actually changed
    await user.save();
  }
  
  return user;
};

module.exports = { checkAndResetCredits };