'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const blogPostSchema = mongoose.Schema({
  author: {
    firstName: String,
    lastName: String
  },
  title: {type: String, required: true},
  content: {type: String},
  created: {type: Date, default: Date.now}
});

blogPostSchema.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogPostSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    author: this.authorName,
    content: this.content,
    title: this.title,
    created: this.created
  };
};

const UserSchema = mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true, minlength: 6},
  firstName: {type: String, default: ''},
  lastName: {type: String, default: ''}
});

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = {BlogPost};
