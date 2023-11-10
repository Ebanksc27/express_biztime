const express = require('express');
const router = express.Router();
const db = require('../db');
const slugify = require('slugify');

// Returns a list of companies
router.get('/', async (req, res, next) => {
    try {
      const results = await db.query('SELECT code, name FROM companies');
      res.json({ companies: results.rows });
    } catch (err) {
      console.error(err);
      next(new ExpressError("Internal Server Error", 500));
    }
  });
  

// Returns a single company along with its invoices and industries
router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const companyResult = await db.query(
      'SELECT code, name, description FROM companies WHERE code = $1', [code]
    );

    if (companyResult.rows.length === 0) {
      throw new ExpressError(`Cannot find company with code of ${code}`, 404);
    }

    // Query to get all invoices related to the company
    const invoicesResult = await db.query(
      'SELECT id FROM invoices WHERE comp_code = $1', [code]
    );

    // New query to get all industries related to the company
    const industriesResult = await db.query(
      `SELECT industry FROM industries 
       JOIN company_industries ON industries.code = company_industries.industry_code 
       WHERE company_code = $1`, 
      [code]
    );

    const company = companyResult.rows[0];
    company.invoices = invoicesResult.rows.map(inv => inv.id);
    company.industries = industriesResult.rows.map(ind => ind.industry);

    res.json({ company });
  } catch (err) {
    return next(err);
  }
});

// Adds a new company
router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    // Generate a slugified code from the company name
    const code = slugify(name, { lower: true, strict: true });
    const result = await db.query(
      'INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description',
      [code, name, description]
    );
    
    return res.status(201).json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// Edits an existing company
router.put('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;
    const result = await db.query(
      'UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description',
      [name, description, code]
    );
    
    if (result.rows.length === 0) {
      throw new ExpressError(`Cannot find company with code of ${code}`, 404);
    }

    return res.json({ company: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

// Deletes a company
router.delete('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const result = await db.query('DELETE FROM companies WHERE code = $1 RETURNING code', [code]);
    
    if (result.rows.length === 0) {
      throw new ExpressError(`Cannot find company with code of ${code}`, 404);
    }

    return res.json({ status: "deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
