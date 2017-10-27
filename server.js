'use strict';

require('dotenv').config();
const passport = require('passport');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const { basicStrategy, jwtStrategy } = require('./auth/strategies');
const {DATABASE_URL, PORT} = require('./config');
const {BlogPost} = require('./models');
const {User} = require('./models');

const {router: apiRouter} = require('./api-router');
const {router: usersRouter} = require('./users-router');
const {router: postsRouter} = require('./posts-router');


const app = express();

app.use(morgan('common'));
app.use(cors());
app.use(bodyParser.json());

mongoose.Promise = global.Promise;

passport.use(basicStrategy);
passport.use(jwtStrategy);
app.use(passport.initialize());

app.use('/users', usersRouter);
app.use('/api', apiRouter);
app.use('/posts', postsRouter);

app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});


// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = {runServer, app, closeServer};
