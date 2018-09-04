const express = require('express');

const user = require('./user');
const permission = require('./permission');
const course = require('./course');
const assignment = require('./assignment');

const router = new express.Router();

router.use(user);
router.use(permission);
router.use(course);
router.use(assignment);

module.exports = router;
