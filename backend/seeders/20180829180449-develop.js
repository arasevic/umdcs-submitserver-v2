'use strict';
const debug = require('debug')('backend:init');
const db = require('../models');
const util = require('../util');

// Dates used in seeded data

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
const dates = { 
  yesterday, 
  tomorrow, 
  nextWeek
};

const subDates = {};
for (let key in dates) {
  subDates[key+'Min1'] = new Date(dates[key].getTime());
  subDates[key+'Min1'].setMinutes(subDates[key+'Min1'].getMinutes() - 1);
  subDates[key+'Min2'] = new Date(dates[key].getTime());
  subDates[key+'Min2'].setMinutes(subDates[key+'Min2'].getMinutes() - 2);
  subDates[key+'Add1'] = new Date(dates[key].getTime());
  subDates[key+'Add1'].setMinutes(subDates[key+'Add1'].getMinutes() + 1);
}

const getUser = username => db.user.findOne({ where: { username } });
const getCourse = number => db.course.findOne({ where: { number } });
const getAssign = name => db.assignment.findOne({ where: { name } });


// Model initialization

function initUsers() {
  return db.user.bulkCreate([{
    name: 'Nikola',
    username: 'nikola'
  }, {
    name: 'Aleksandra',
    username: 'aleksandra'
  }, {
    name: 'Michele',
    username: 'mca'
  }, {
    name: 'Thomas Gilray',
    username: 'tgilray'
  }, {
    name: 'Javran Cheng',
    username: 'javran'
  }, {
    name: 'David Van Horn',
    username: 'dvh'
  }, {
    name: 'Nick',
    username: 'labichn',
    role: 'admin'
  }]);
}

function initCourses() {
  return db.course.bulkCreate([{
    name: 'Fundamentals of Computer Science I',
    number: 'cmsc131'
  }, {
    name: 'Introduction to Compilers',
    number: 'cmsc430'
  }]);
}

async function initAssignments() {
  const cmsc131 = await getCourse('cmsc131');
  const cmsc430 = await getCourse('cmsc430');
  return db.assignment.bulkCreate([{
    name: 'Simple functions',
    due: dates.yesterday,
    visible: true,
    courseId: cmsc131.id
  }, {
    name: 'Trees, forests, and ML',
    due: dates.nextWeek,
    courseId: cmsc131.id
  }, {
    name: 'Church encoder',
    due: dates.yesterday,
    visible: true,
    courseId: cmsc430.id
  }, {
    name: 'Desugaring, promises, exceptions',
    due: dates.tomorrow,
    visible: true,
    courseId: cmsc430.id
  }]);
};

async function initSubmissions() {
  const nikola = await getUser('nikola');
  const michele = await getUser('mca');
  const aleksandra = await getUser('aleksandra');
  const a0cmsc131 = await getAssign('Simple functions');
  const a0cmsc430 = await getAssign('Church encoder');
  const a1cmsc430 = await getAssign('Desugaring, promises, exceptions');
  const randomBuffer = () => Buffer.from(util.randomStr(20), 'utf8');
  await db.submission.bulkCreate([{
    assignmentId: a0cmsc131.id,
    userId: nikola.id,
    submitted: subDates.yesterdayMin2,
    input: randomBuffer(),
    output: 'All tests passed!'
  }, {
    assignmentId: a0cmsc131.id,
    userId: nikola.id,
    submitted: subDates.yesterdayMin1,
    input: randomBuffer(),
    output: 'All tests passed!'
  }, {
    assignmentId: a0cmsc131.id,
    userId: michele.id,
    submitted: subDates.yesterdayMin1,
    input: randomBuffer(),
    output: 'Tests failed!'
  }, {
    assignmentId: a0cmsc131.id,
    userId: michele.id,
    submitted: subDates.yesterdayAdd1,
    input: randomBuffer(),
    output: 'All tests passed!'
  }, {
    assignmentId: a0cmsc430.id,
    userId: aleksandra.id,
    submitted: subDates.yesterdayMin2,
    input: randomBuffer(),
    output: 'All tests passed!'
  }, {
    assignmentId: a0cmsc430.id,
    userId: aleksandra.id,
    submitted: subDates.yesterdayMin1,
    input: randomBuffer(),
    output: 'All tests passed!'
  }, {
    assignmentId: a0cmsc430.id,
    userId: michele.id,
    submitted: subDates.yesterdayAdd1,
    input: randomBuffer(),
    output: 'Tests failed!'
  }, {
    assignmentId: a1cmsc430.id,
    userId: aleksandra.id,
    submitted: subDates.yesterdayAdd1,
    input: randomBuffer(),
    output: 'All tests passed!'
  }]);
};

async function initPermissions() {
  const nikola = await getUser('nikola');
  const aleksandra = await getUser('aleksandra');
  const michele = await getUser('mca');
  const tom = await getUser('tgilray');
  const javran = await getUser('javran');
  const dvh = await getUser('dvh');
  const nick = await getUser('labichn');
  const cmsc131 = await getCourse('cmsc131');
  const cmsc430 = await getCourse('cmsc430');
  return db.permission.bulkCreate([{
    userId: nikola.id,
    courseId: cmsc131.id,
    role: 'student'
  }, {
    userId: nikola.id,
    courseId: cmsc430.id,
    role: 'ta'
  }, {
    userId: aleksandra.id,
    courseId: cmsc430.id,
    role: 'student'
  }, {
    userId: michele.id,
    courseId: cmsc131.id,
    role: 'student'
  }, {
    userId: michele.id,
    courseId: cmsc430.id,
    role: 'student'
  }, {
    userId: tom.id,
    courseId: cmsc430.id,
    role: 'prof'
  }, {
    userId: javran.id,
    courseId: cmsc430.id,
    role: 'ta'
  }, {
    userId: dvh.id,
    courseId: cmsc131.id,
    role: 'prof'
  }]);
}


module.exports = {
  up: async (queryInterface, Sequelize) => {
    await initUsers();
    await initCourses();
    await initAssignments();
    await initSubmissions();
    await initPermissions();
  },
  down: async (queryInterface, Sequelize) => {
    await db.permission.destroy({ where: {} });
    await db.submission.destroy({ where: {} });
    await db.assignment.destroy({ where: {} });
    await db.course.destroy({ where: {} });
    await db.user.destroy({ where: {} });
  }
};
