/**
 * FIN-01 — GST invoice list with CGST/SGST/IGST breakdown and refund docs.
 */
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, requireRoles } = require('../middleware/auth');
const { writeAudit } = require('../utils/auditHelper');

async function ensureTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS gst_invoices (
      id SERIAL PRIMARY KEY,
      invoice_no VARCHAR(80) UNIQUE NOT NULL,
      customer_name VARCHAR(200),
      customer_gstin VARCHAR(20),
      transaction_id VARCHAR(150),
      place_of_supply VARCHAR(100) DEFAULT 'Gujarat',
      taxable_amount DECIMAL(14,2) NOT NULL,
      cgst DECIMAL(14,2) DEFAULT 0,
      sgst DECIMAL(14,2) DEFAULT 0,
      igst DECIMAL(14,2) DEFAULT 0,
      total_amount DECIMAL(14,2) NOT NULL,
      invoice_type VARCHAR(40) DEFAULT 'tax_invoice',
      source_event VARCHAR(100),
      status VARCHAR(40) DEFAULT 'issued',
      pdf_uri TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `).catch(() => {});

  const count = await db.query('SELECT COUNT(*)::int AS c FROM gst_invoices').catch(() => ({ rows: [{ c: 0 }] }));
  if ((count.rows[0]?.c || 0) === 0) {
    await db.query(`
      INSERT INTO gst_invoices (
        invoice_no, customer_name, customer_gstin, transaction_id, place_of_supply,
        taxable_amount, cgst, sgst, igst, total_amount, source_event, pdf_uri
      ) VALUES
      ('EVG-INV-1001','Aarav Shah',NULL,'TXN-9001','Gujarat',500.00,45.00,45.00,0,590.00,'ride_completion','/api/receipts/EVG-INV-1001'),
      ('EVG-INV-1002','Neha Patel',NULL,'TXN-9002','Maharashtra',1000.00,0,0,180.00,1180.00,'ride_completion','/api/receipts/EVG-INV-1002'),
      ('EVG-CN-1001','Aarav Shah',NULL,'TXN-9001','Gujarat',100.00,9.00,9.00,0,118.00,'partial_refund','/api/receipts/EVG-CN-1001')
    `).catch(() => {});
    await db.query(`UPDATE gst_invoices SET invoice_type='credit_note', status='issued' WHERE invoice_no='EVG-CN-1001'`).catch(() => {});
  }
}
ensureTables();

router.get(
  '/',
  authenticate,
  requireRoles('Super Admin', 'Franchise Owner', 'Franchise Manager'),
  async (req, res) => {
    try {
      const { search, type } = req.query;
      let q = 'SELECT * FROM gst_invoices WHERE 1=1';
      const params = [];
      if (type) {
        params.push(type);
        q += ` AND invoice_type = $${params.length}`;
      }
      if (search) {
        params.push(`%${search}%`);
        q += ` AND (invoice_no ILIKE $${params.length} OR customer_name ILIKE $${params.length} OR transaction_id ILIKE $${params.length})`;
      }
      q += ' ORDER BY created_at DESC LIMIT 200';
      const result = await db.query(q, params);
      res.json({ status: 'success', data: result.rows });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

router.get(
  '/:invoiceNo',
  authenticate,
  requireRoles('Super Admin', 'Franchise Owner', 'Franchise Manager'),
  async (req, res) => {
    try {
      const result = await db.query('SELECT * FROM gst_invoices WHERE invoice_no = $1', [req.params.invoiceNo]);
      if (!result.rows.length) {
        return res.status(404).json({ status: 'error', message: 'Invoice not found' });
      }
      const inv = result.rows[0];
      res.json({
        status: 'success',
        data: {
          ...inv,
          tax_breakdown: {
            cgst: inv.cgst,
            sgst: inv.sgst,
            igst: inv.igst,
          },
          reconciles_to: inv.transaction_id,
        },
      });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

router.post(
  '/generate',
  authenticate,
  requireRoles('Super Admin', 'Franchise Owner', 'Franchise Manager'),
  async (req, res) => {
    try {
      const {
        customer_name,
        customer_gstin,
        transaction_id,
        place_of_supply = 'Gujarat',
        taxable_amount,
        source_event = 'billable_event',
        invoice_type = 'tax_invoice',
      } = req.body || {};

      if (!customer_name || !transaction_id || taxable_amount == null) {
        return res.status(400).json({
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: 'customer_name, transaction_id, and taxable_amount are required',
        });
      }

      const taxable = Number(taxable_amount);
      const isInter = String(place_of_supply).toLowerCase() !== 'gujarat';
      const cgst = isInter ? 0 : Number((taxable * 0.09).toFixed(2));
      const sgst = isInter ? 0 : Number((taxable * 0.09).toFixed(2));
      const igst = isInter ? Number((taxable * 0.18).toFixed(2)) : 0;
      const total = Number((taxable + cgst + sgst + igst).toFixed(2));
      const prefix = invoice_type === 'credit_note' ? 'EVG-CN' : 'EVG-INV';
      const invoiceNo = `${prefix}-${Date.now().toString().slice(-6)}`;

      const inserted = await db.query(
        `
        INSERT INTO gst_invoices (
          invoice_no, customer_name, customer_gstin, transaction_id, place_of_supply,
          taxable_amount, cgst, sgst, igst, total_amount, invoice_type, source_event, pdf_uri
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        RETURNING *
        `,
        [
          invoiceNo,
          customer_name,
          customer_gstin || null,
          transaction_id,
          place_of_supply,
          taxable,
          cgst,
          sgst,
          igst,
          total,
          invoice_type,
          source_event,
          `/api/receipts/${invoiceNo}`,
        ]
      );

      await writeAudit({
        req,
        action: 'GST_INVOICE_GENERATE',
        module: 'Finance',
        entity_type: 'invoice',
        entity_id: invoiceNo,
        details: inserted.rows[0],
        outcome: 'success',
      });

      res.status(201).json({ status: 'success', data: inserted.rows[0] });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

module.exports = router;
