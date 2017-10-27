'use strict';

const express = require('express');
const router = express.Router();
const {BlogPost, User} = require('./models');
const passport = require('passport');

const jwt = require('jsonwebtoken');
const config = require('./config');

const createAuthToken = function(user) {
  return jwt.sign({ user }, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    alogrithm: 'HS256'
  });
};


const basicAuthenticate = passport.authenticate('basic', { session: false, failWithError: true  });
const jwtAuthenticate = passport.authenticate('jwt', { session: false, failWithError: true });

//POST ENDPOINT -----------//
router.post('/login', basicAuthenticate, (req, res) => {
  const authToken = createAuthToken(req.user.apiRepr());

  logTokenDate(authToken);
  res.json({ authToken });
});

function logTokenDate(token) {
  const decoded = jwt.verify(token, config.JWT_SECRET);
  let d = new Date(0);
  d.setUTCSeconds(decoded.exp); 
  console.log(d.toLocaleString());
}

router.post('/refresh', jwt, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
});

module.exports = {router};