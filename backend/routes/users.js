var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json([
    {id: 1, username: "Nikola"},
    {id: 2, username: "Aleksandra"}
  ]);
});

module.exports = router;
