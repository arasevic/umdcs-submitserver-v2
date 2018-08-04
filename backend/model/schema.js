const mongoose = require('mongoose');

const roles = require('../auth/roles');

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

// Reference to a collection of the given name
const ref = (name) => ({ type: ObjectId, ref: name });

/**
 *
 */
const User = new Schema({
  name: String,
  username: String,
  role: { 
    type: String,
    defaultValue: roles.student
  },
  courses: [{
    role: String,
    course: ref('Course')
  }]
});

/**
 *
 */
const Course = new Schema({
  name: String,
  number: String,
  assignments: [ref('Assignment')]
});

/**
 *
 */
const Assignment = new Schema({
  name: String,
  due: Date,
  visible: { type: Boolean, default: false },
  submissions: [ref('Submission')]
});

/**
 *
 */
const Submission = new Schema({
  user: ref('User'),
  date: Date,
  input: String,
  output: String
});

module.exports = {
  User, Course, Assignment, Submission
};
