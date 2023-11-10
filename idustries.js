const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('./expressError'); 

// Route to list all industries
router.get('/', async (req, res, next) => {
  try {
    const results = await db.query('SELECT * FROM industries');
    res.json({ industries: results.rows });
  } catch (err) {
    return next(err);
  }
});

// Route to add a new industry
router.post('/', async (req, res, next) => {
  try {
    const { code, industry } = req.body;
    const result = await db.query(
      'INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry',
      [code, industry]
    );
    res.status(201).json({ industry: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// Route to associate an industry with a company
router.post('/company_industries', async (req, res, next) => {
  try {
    const { company_code, industry_code } = req.body;
    const result = await db.query(
      'INSERT INTO company_industries (company_code, industry_code) VALUES ($1, $2) RETURNING company_code, industry_code',
      [company_code, industry_code]
    );
    res.status(201).json({ company_industry: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
