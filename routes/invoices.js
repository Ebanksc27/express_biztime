const express = require('express');
const router = express.Router();
const db = require('../db'); 

// Return info on all invoices
router.get('/', async (req, res, next) => {
  try {
    const results = await db.query('SELECT id, comp_code FROM invoices');
    res.json({ invoices: results.rows });
  } catch (err) {
    return next(err);
  }
});

// Returns info on a single invoice
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, 
             c.code, c.name, c.description
      FROM invoices AS i
        JOIN companies AS c ON i.comp_code = c.code
      WHERE i.id = $1`, [id]);

    if (result.rows.length === 0) {
      return next(new ExpressError("Invoice not found", 404));
    }

    const invoice = result.rows[0];
    const invoiceData = {
      id: invoice.id,
      amt: invoice.amt,
      paid: invoice.paid,
      add_date: invoice.add_date,
      paid_date: invoice.paid_date,
      company: {
        code: invoice.code,
        name: invoice.name,
        description: invoice.description
      }
    };

    res.json({ invoice: invoiceData });
  } catch (err) {
    return next(err);
  }
});

// Adds a new invoice
router.post('/', async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(`
      INSERT INTO invoices (comp_code, amt) 
      VALUES ($1, $2) 
      RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]);

    res.status(201).json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// Updates an invoice
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt } = req.body;
    const result = await db.query(`
      UPDATE invoices 
      SET amt = $1 
      WHERE id = $2 
      RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, id]);

    if (result.rows.length === 0) {
      return next(new ExpressError("Invoice not found", 404));
    }

    res.json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// Deletes an invoice
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      DELETE FROM invoices 
      WHERE id = $1 
      RETURNING id`, [id]);

    if (result.rows.length === 0) {
      return next(new ExpressError("Invoice not found", 404));
    }

    res.json({ status: "deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
