const express = require('express');
const router = express.Router();
const db = require('../db');

// Ensure referral tables exist
async function initReferralTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS rider_referrals (
        id SERIAL PRIMARY KEY,
        mobile VARCHAR(50) UNIQUE,
        rider_name VARCHAR(100),
        referral_code VARCHAR(50) UNIQUE,
        total_earned INT DEFAULT 420,
        friends_joined INT DEFAULT 12,
        points_redeemed INT DEFAULT 320,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS referral_history (
        id SERIAL PRIMARY KEY,
        mobile VARCHAR(50),
        title VARCHAR(150),
        friend_name VARCHAR(100),
        points INT,
        type VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.warn('Referral table init warning:', err.message);
  }
}
initReferralTable();

// Helper to generate deterministic unique referral code from name or mobile
function generateReferralCode(name, mobile) {
  let cleanName = (name || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
  if (!cleanName || cleanName.length < 3) cleanName = 'EVEGAH';
  let prefix = cleanName.substring(0, 6);
  let cleanMobile = (mobile || '').replace(/[^0-9]/g, '');
  let suffix = cleanMobile.length >= 4 ? cleanMobile.slice(-4) : '100';
  return `${prefix}${suffix}`;
}

// GET /api/referral?mobile=...
router.get('/', async (req, res) => {
  const mobile = req.query.mobile || req.query.phone || '';
  const riderName = req.query.name || 'Rider User';

  let code = generateReferralCode(riderName, mobile);
  let totalEarned = 420;
  let friendsJoined = 12;
  let pointsRedeemed = 320;

  try {
    if (mobile) {
      const existing = await db.query('SELECT * FROM rider_referrals WHERE mobile = $1', [mobile]);
      if (existing.rows.length > 0) {
        const row = existing.rows[0];
        code = row.referral_code || code;
        totalEarned = row.total_earned !== undefined && row.total_earned !== null ? row.total_earned : 420;
        friendsJoined = row.friends_joined !== undefined && row.friends_joined !== null ? row.friends_joined : 12;
        pointsRedeemed = row.points_redeemed !== undefined && row.points_redeemed !== null ? row.points_redeemed : 320;
      } else {
        // Create new record for rider
        await db.query(`
          INSERT INTO rider_referrals (mobile, rider_name, referral_code, total_earned, friends_joined, points_redeemed)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (mobile) DO NOTHING
        `, [mobile, riderName, code, totalEarned, friendsJoined, pointsRedeemed]);
      }
    }
  } catch (err) {
    console.warn('Referral query DB fallback:', err.message);
  }

  const availablePoints = Math.max(0, totalEarned - pointsRedeemed);

  const history = [
    { id: 1, title: 'Friend Joined (Amit Kumar)', points: '+100 EV Points', type: 'earn', date: '2026-08-22' },
    { id: 2, title: 'Redeemed for Weekly Ride Discount', points: '-200 EV Points', type: 'redeem', date: '2026-08-20' },
    { id: 3, title: 'Friend Joined (Neha Gupta)', points: '+100 EV Points', type: 'earn', date: '2026-08-18' },
    { id: 4, title: 'Redeemed for Coupon EVG50', points: '-120 EV Points', type: 'redeem', date: '2026-08-15' },
    { id: 5, title: 'Welcome Bonus Points', points: '+50 EV Points', type: 'earn', date: '2026-08-10' }
  ];

  res.json({
    status: 'success',
    data: {
      referralCode: code,
      totalEarned,
      friendsJoined,
      pointsRedeemed,
      availablePoints,
      perFriendEarn: 100,
      friendGets: 50,
      history
    }
  });
});

// POST /api/referral/redeem
router.post('/redeem', async (req, res) => {
  const { mobile, pointsToRedeem, offerName } = req.body;
  const points = parseInt(pointsToRedeem) || 100;

  try {
    if (mobile) {
      await db.query(`
        UPDATE rider_referrals 
        SET points_redeemed = points_redeemed + $1
        WHERE mobile = $2
      `, [points, mobile]);
    }
  } catch (err) {
    console.warn('Redeem update DB warning:', err.message);
  }

  res.json({
    status: 'success',
    message: `Successfully redeemed ${points} EV Points for ${offerName || 'Ride Discount'}!`,
    redeemedPoints: points
  });
});

module.exports = router;
