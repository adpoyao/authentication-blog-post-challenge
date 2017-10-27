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

router.get('/', (req, res) => {
  User
    .find()
    .then(user => {
      res.json(user.map(user => user.apiRepr()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went terribly wrong'});
    });
});

router.post('/', (req, res) => {
  if (!req.body) {
    return res.status(422).json({message: 'No request body'});
  }

  if (!('username' in req.body)) {
    return res.status(422).json({message: 'Missing field username'});
  }

  if (!('password' in req.body)) {
    return res.status(422).json({message: 'Missing field password'});
  }

  let {username, password, firstName, lastName} = req.body;

  if (typeof username !== 'string') {
    return res.status(422).json({message: 'Incorrect username type.'});
  }

  username = username.trim();

  if (username === '') {
    return res.status(422).json({message: 'Username is empty string.'});
  }

  if (typeof password !== 'string') {
    return res.status(422).json({message: 'Incorrect password type.'});
  }

  password = password.trim();

  if (password === '') {
    return res.status(422).json({message: 'password is empty string.'});
  }

  return User
    .find({username})
    .count()
    .then(count => {
      if (count > 0) {
        return res.status(422).json({message: 'Username already taken'});
      }

      return User.hashPassword(password);
    })
    .then(hash => {
      return User
        .create({
          username,
          password: hash,
          firstName,
          lastName
        })
        .then(user => {
          return res.status(201).json(user.apiRepr());
        })
        .catch(err => {
          res.status(500).json({message: 'I know this doesn\'t help you, but Internal Server Error.'});
        });
    });
});

module.exports = {router};