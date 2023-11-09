/** BizTime express application. */

const express = require("express");
const ExpressError = require("./expressError");
const companyRoutes = require('./routes/companies'); // Import company routes

const app = express();

app.use(express.json()); // Middleware to parse JSON

// Here you would add other middleware or route handlers if needed

// Use the company routes with the base path '/companies'
app.use('/companies', companyRoutes);

/** 404 handler */
app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */
app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});

module.exports = app;

