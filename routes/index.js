var express = require('express');
var router = express.Router();
const PlatformStats = require('../models/platform-stats');

/* GET home page. */
router.get('/', function(req, res, next) {
  PlatformStats.findOne().exec()
  .then(stats => {
    if (!stats) {
      stats.amountRaised = 2000;
      stats.workers = 20;
      stats.rate = 100;
    }
    let renderedStats = stats.toObject();
    renderedStats.amountRaised = parseFloat(renderedStats.amountRaised.toFixed(2));
    renderedStats.rate = parseFloat(renderedStats.rate.toFixed(2)) * 24;
    renderedStats.title = 'Mine for Houston';
    res.render('index', renderedStats);
  });
});

module.exports = router;
