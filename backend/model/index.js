const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', dbSetup);

function dbSetup() {
  const schemata = require('./schema');
  const models = {};
  for (let name in schemata) {
    models[name] = mongoose.model(name, schemata[name]);
  }
};


module.exports = mongoose;
