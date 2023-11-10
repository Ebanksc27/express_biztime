/** BizTime express application. */

const express = require("express");
const app = express();  // This needs to be defined before using app.use()
const ExpressError = require("./expressError");
const companyRoutes = require('./routes/companies'); 
const industryRoutes = require('./routes/industries'); 

app.use(express.json()); // Middleware to parse JSON

// Use the company routes with the base path '/companies'
app.use('/companies', companyRoutes);
// Use the industry routes with the base path '/industries'
app.use('/industries', industryRoutes);

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

