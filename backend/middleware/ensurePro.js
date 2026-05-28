const User = require('../models/User');

const hasActiveProAccess = (user) => {
  if (!user) return false;

  const now = new Date();
  const stillInGrace = user.planEndsAt && new Date(user.planEndsAt) > now;

  return (
    user.plan === 'pro' &&
    (
      user.subscriptionStatus === 'active' ||
      user.subscriptionStatus === 'trialing' ||
      (user.subscriptionStatus === 'canceled' && stillInGrace)
    )
  );
};

const ensurePro = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('plan subscriptionStatus planEndsAt');
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    if (!hasActiveProAccess(user)) {
      return res.status(403).json({
        error: 'Pro access required.',
        message: 'This feature is only available to active Pro subscribers.'
      });
    }

    next();
  } catch (err) {
    console.error('ensurePro error:', err.message);
    res.status(500).json({ error: 'Unable to verify subscription status.' });
  }
};

module.exports = ensurePro;
