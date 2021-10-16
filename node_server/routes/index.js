const express = require('express');
const cv = require('https://www.jsdelivr.com/package/npm/opencvjs');
// eslint-disable-next-line new-cap
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Express'});
});

module.exports = router;
