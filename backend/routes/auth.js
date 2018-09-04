const express = require('express');
const bp = require('body-parser');
const session = require('client-sessions');

const db = require('../models');
const cookies = require('../auth/cookies');
const roles = require('../auth/roles');

const router = new express.Router();

router.get('/check', checkSession);
router.post('/logout', logout);
router.post('/login', bp.json(), login);

module.exports = router;

/**
 * Returns user session cookie to client
 */
async function checkSession(req, res) {
  const cookie = cookies.getCookie(req);
  if (cookie) res.status(200).json(cookie);
  else res.sendStatus(401);
};

/**
 * Handles logout request by resetting the session
 */
async function logout(req, res) {
  if (req.session) req.session.reset();
  res.sendStatus(200);
};

/**
 * Handle login request;
 * expects JSON body with the string field `username'
 */
async function login(req, res) {
  if (!validLogin(req.body)) {
    res.sendStatus(400);
  } else {
    const { username } = req.body;
    const user = await db.user.findOne({
      where: { username },
      attributes: { exclude: [ 'createdAt', 'updatedAt' ] },
      include: [{
        model: db.course,
        attributes: { include: [ 'id' ] },
        through: { attributes: [ 'role' ] }
      }]
    });
    if (!user) {
      res.sendStatus(401);
    } else {
      const token = user.get({ plain: true });
      if (token.role === roles.admin) {
        const courses = await db.course.findAll({
          attributes: [ 'id' ],
          raw: true
        });
        courses.forEach(c => c.permission = { role: roles.admin });
        token.courses = courses;
      }
      console.log('final token:', token);
      cookies.setCookie(req, token);
      res.status(200).json(cookies.getCookie(req));
    }
  }
}

const validString = (s) =>
  Boolean(s) && typeof s === 'string' && s.length > 0;

const validLogin = (body) =>
  Boolean(body) && validString(body.username);
