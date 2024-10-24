const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Nominations = require('./nominations')(sequelize, Sequelize);
const Nominator = require('./nominator')(sequelize, Sequelize);
const Nominees = require('./nominee')(sequelize, Sequelize);
const Votes = require('./count')(sequelize, Sequelize); 
const User = require('./users')(sequelize, Sequelize); // Ensure singular name matches your file
const Ticket = require('./ticket')(sequelize, Sequelize); // Ensure singular name matches your file

const db = {
  sequelize,
  Sequelize,
  Nominations,
  Nominator,
  Nominees,
  Votes, 
  User,  
  Ticket 
};

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
