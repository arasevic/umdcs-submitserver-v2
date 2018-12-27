const dotenv = require('dotenv').config();
const Sequelize = require('sequelize');

module.exports = {
  development: {
    user: 'submitserver',
    username: 'submitserver',
    password: 'password',
    database: 'umdcs-submitserver-v2-dev',
    host: '127.0.0.1',
    port: 5432,
    dialect: "postgres",
    operatorsAliases: false,
    logging: console.log,
    seederStorage: 'json'
  },
  test: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASS,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    dialect: "postgres",
    operatorsAliases: false,
  },
  production: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASS,
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    dialect: "postgres",
    operatorsAliases: false
  }
};
