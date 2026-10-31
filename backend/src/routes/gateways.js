const express = require('express');
const router = express.Router();
const db = require('../db');

// Initial default gateways blueprint
const DEFAULT_GATEWAYS = [
  {
    id: 'payu',
    name: 'PayU India',
    provider: 'payu',
    active: true,
    key_id: 'WTi3jH',
    key_secret: '9dascniXrfdMW22AJBbhmh2C7kuBibwb',
    client_id: '8ecdb3a31264fb5b8c0ef026846a904d9aefcef39acdfb55d61225cdc06eb543',
    client_secret: 'd9c50d234985c580d2ac5ea6891cfb5d7f8f12dadb5b5afb6cc565b1b28ad7e4',
    environment: 'test',
    notes: 'PayU Hosted Checkout, Cards, NetBanking, UPI'
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    provider: 'phonepe',
    active: false,
    key_id: 'PGTESTPAYUAT',
    key_secret: '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399',
    key_index: '1',
    environment: 'test',
    notes: 'PhonePe Payment Gateway'
  },
  {
    id: 'paytm',
    name: 'Paytm',
    provider: 'paytm',
    active: false,
    key_id: 'Mid_xxxxxxxxxxxxx',
    key_secret: '••••••••••••••••',
    environment: 'production',
    notes: 'Paytm All-in-one Gateway'
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    provider: 'razorpay',
    active: false,
    key_id: 'rzp_live_xxxxxxxxxxxxx',
    key_secret: '••••••••••••••••',
    environment: 'production',
    notes: 'Razorpay Payment Gateway'
  }
];

// Helper: load payments settings row
async function getPaymentSettings() {
  const res = await db.query("SELECT values FROM settings WHERE category = 'payments' LIMIT 1");
  if (res.rows.length > 0 && res.rows[0].values) {
    return res.rows[0].values;
  }
  return null;
}

// Helper: save payments settings row
async function savePaymentSettings(newValues) {
  await db.query(`
    INSERT INTO settings (category, values)
    VALUES ('payments', $1)
    ON CONFLICT (category) DO UPDATE SET values = EXCLUDED.values
  `, [JSON.stringify(newValues)]);
}

// GET /api/payments/gateways - List all configured payment gateways
router.get('/', async (req, res) => {
  try {
    const settings = await getPaymentSettings();
    let gateways = DEFAULT_GATEWAYS;
    let primaryGateway = 'payu';

    if (settings && Array.isArray(settings.gateways) && settings.gateways.length > 0) {
      gateways = settings.gateways.filter(g => g.id !== 'icici' && g.provider !== 'icici');
      primaryGateway = settings.primary_gateway === 'icici' ? 'payu' : (settings.primary_gateway || primaryGateway);
    } else if (settings) {
      // Build gateways from legacy flat settings
      gateways = DEFAULT_GATEWAYS.map(g => {
        if (g.id === 'razorpay' && settings.razorpay_key_id) {
          return { ...g, key_id: settings.razorpay_key_id, active: !!settings.razorpay_active };
        }
        if (g.id === 'phonepe' && settings.phonepe_merchant_id) {
          return { ...g, key_id: settings.phonepe_merchant_id, active: !!settings.phonepe_active };
        }
        if (g.id === 'paytm' && settings.paytm_merchant_id) {
          return { ...g, key_id: settings.paytm_merchant_id, active: !!settings.paytm_active };
        }
        return g;
      });
      // Save merged structure
      await savePaymentSettings({
        ...(settings || {}),
        gateways,
        primary_gateway: primaryGateway
      });
    }

    res.json({
      status: 'success',
      data: {
        gateways,
        primary_gateway: primaryGateway
      }
    });
  } catch (err) {
    console.error('Error fetching gateways:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/payments/gateways/config or public active gateways
router.get('/config', async (req, res) => {
  try {
    const settings = await getPaymentSettings();
    let gateways = DEFAULT_GATEWAYS;
    let primaryGateway = 'payu';
    let paymentMethods = {
      upi: true,
      card: true,
      netbanking: true,
      wallets: true,
      cash: false
    };

    if (settings) {
      if (Array.isArray(settings.gateways) && settings.gateways.length > 0) {
        gateways = settings.gateways.filter(g => g.id !== 'icici' && g.provider !== 'icici');
      }
      primaryGateway = settings.primary_gateway === 'icici' ? 'payu' : (settings.primary_gateway || 'payu');
      paymentMethods = {
        upi: settings.methods_upi !== false,
        card: settings.methods_card !== false,
        netbanking: settings.methods_netbanking !== false,
        wallets: settings.methods_wallets !== false,
        cash: !!settings.methods_cash
      };
    }

    // Only return safe public info for active gateways
    const activeGateways = gateways
      .filter(g => g.active && g.id !== 'icici' && g.provider !== 'icici')
      .map(g => ({
        id: g.id,
        name: g.name,
        provider: g.provider,
        is_primary: g.id === primaryGateway,
        key_id: g.key_id,
        vpa: g.vpa,
        payee_name: g.payee_name,
        environment: g.environment || 'production'
      }));

    res.json({
      status: 'success',
      data: {
        active_gateways: activeGateways,
        primary_gateway: primaryGateway,
        payment_methods: paymentMethods
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/payments/gateways - Add or update a payment gateway
router.post('/', async (req, res) => {
  try {
    const { id, name, provider, active, key_id, key_secret, client_id, client_secret, vpa, payee_name, environment, notes, is_primary } = req.body;

    if (!name || (!key_id && !id)) {
      return res.status(400).json({ status: 'error', message: 'Gateway name and credentials are required' });
    }

    const gatewayId = (id || provider || name.toLowerCase().replace(/\s+/g, '_')).trim();
    const settings = (await getPaymentSettings()) || {};
    let gateways = Array.isArray(settings.gateways) ? [...settings.gateways] : [...DEFAULT_GATEWAYS];

    const existingIdx = gateways.findIndex(g => g.id === gatewayId || g.provider === (provider || gatewayId));
    
    const gatewayObj = {
      id: gatewayId,
      name: name.trim(),
      provider: provider || gatewayId,
      active: active !== undefined ? !!active : true,
      key_id: key_id || '',
      key_secret: key_secret || '',
      key_index: req.body.key_index || (existingIdx >= 0 ? gateways[existingIdx].key_index : '1') || '1',
      client_id: client_id || '',
      client_secret: client_secret || '',
      vpa: vpa || '',
      payee_name: payee_name || 'Evegah',
      environment: environment || 'production',
      notes: notes || '',
      updated_at: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      // Preserve existing secret if not provided in update
      if (!gatewayObj.key_secret && gateways[existingIdx].key_secret) {
        gatewayObj.key_secret = gateways[existingIdx].key_secret;
      }
      if (!gatewayObj.client_secret && gateways[existingIdx].client_secret) {
        gatewayObj.client_secret = gateways[existingIdx].client_secret;
      }
      gateways[existingIdx] = { ...gateways[existingIdx], ...gatewayObj };
    } else {
      gateways.push(gatewayObj);
    }

    let primaryGateway = settings.primary_gateway || 'payu';
    if (is_primary || (gatewayObj.active && !settings.primary_gateway)) {
      primaryGateway = gatewayId;
    }

    // Sync legacy flat properties for backward compatibility
    if (gatewayId === 'payu') {
      settings.payu_active = gatewayObj.active;
      settings.payu_key_id = gatewayObj.key_id;
      settings.payu_key_secret = gatewayObj.key_secret;
      settings.payu_client_id = gatewayObj.client_id;
      settings.payu_client_secret = gatewayObj.client_secret;
      settings.payu_env = gatewayObj.environment;
    } else if (gatewayId === 'razorpay') {
      settings.razorpay_active = gatewayObj.active;
      settings.razorpay_key_id = gatewayObj.key_id;
    } else if (gatewayId === 'phonepe') {
      settings.phonepe_active = gatewayObj.active;
      settings.phonepe_merchant_id = gatewayObj.key_id;
      settings.phonepe_salt_key = gatewayObj.key_secret;
      settings.phonepe_key_index = gatewayObj.key_index;
      settings.phonepe_env = gatewayObj.environment;
    } else if (gatewayId === 'paytm') {
      settings.paytm_active = gatewayObj.active;
      settings.paytm_merchant_id = gatewayObj.key_id;
    }

    settings.gateways = gateways;
    settings.primary_gateway = primaryGateway;

    await savePaymentSettings(settings);

    res.json({
      status: 'success',
      message: `Gateway '${gatewayObj.name}' saved and ${gatewayObj.active ? 'ACTIVATED' : 'deactivated'} successfully`,
      data: {
        gateway: gatewayObj,
        gateways,
        primary_gateway: primaryGateway
      }
    });
  } catch (err) {
    console.error('Error saving gateway:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// PATCH /api/payments/gateways/:id/toggle - Toggle active status instantly
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const settings = (await getPaymentSettings()) || {};
    let gateways = Array.isArray(settings.gateways) ? [...settings.gateways] : [...DEFAULT_GATEWAYS];

    const idx = gateways.findIndex(g => g.id === id);
    if (idx === -1) {
      return res.status(404).json({ status: 'error', message: `Gateway '${id}' not found` });
    }

    const newActiveState = active !== undefined ? !!active : !gateways[idx].active;
    gateways[idx].active = newActiveState;
    gateways[idx].updated_at = new Date().toISOString();

    // Sync legacy flat fields
    if (id === 'payu') settings.payu_active = newActiveState;
    if (id === 'razorpay') settings.razorpay_active = newActiveState;
    if (id === 'phonepe') settings.phonepe_active = newActiveState;
    if (id === 'paytm') settings.paytm_active = newActiveState;

    settings.gateways = gateways;
    await savePaymentSettings(settings);

    res.json({
      status: 'success',
      message: `Gateway '${gateways[idx].name}' is now ${newActiveState ? 'ACTIVE' : 'INACTIVE'}`,
      data: gateways[idx]
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/payments/gateways/:id/set-primary - Set primary default gateway
router.post('/:id/set-primary', async (req, res) => {
  try {
    const { id } = req.params;
    const settings = (await getPaymentSettings()) || {};
    let gateways = Array.isArray(settings.gateways) ? [...settings.gateways] : [...DEFAULT_GATEWAYS];

    const target = gateways.find(g => g.id === id);
    if (!target) {
      return res.status(404).json({ status: 'error', message: `Gateway '${id}' not found` });
    }

    // Auto-activate primary gateway if inactive
    target.active = true;
    settings.gateways = gateways;
    settings.primary_gateway = id;

    await savePaymentSettings(settings);

    res.json({
      status: 'success',
      message: `Primary gateway set to '${target.name}'`,
      data: { primary_gateway: id }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// DELETE /api/payments/gateways/:id - Remove a gateway
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const settings = (await getPaymentSettings()) || {};
    let gateways = Array.isArray(settings.gateways) ? [...settings.gateways] : [...DEFAULT_GATEWAYS];

    const filtered = gateways.filter(g => g.id !== id);
    settings.gateways = filtered;
    if (settings.primary_gateway === id) {
      settings.primary_gateway = filtered.length > 0 ? filtered[0].id : 'payu';
    }

    await savePaymentSettings(settings);

    res.json({
      status: 'success',
      message: `Gateway '${id}' removed successfully`,
      data: { gateways: filtered }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
