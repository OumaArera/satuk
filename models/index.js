const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Nominations = require('./nominations')(sequelize, Sequelize);
const Nominator = require('./nominator')(sequelize, Sequelize);
const Nominees = require('./nominee')(sequelize, Sequelize);
const Votes = require('./count')(sequelize, Sequelize); 
const User = require('./users')(sequelize, Sequelize); 

const db = {
  sequelize,
  Sequelize,
  Nominations,
  Nominator,
  Nominees,
  Votes, 
  User
};

// Define associations
if (User.associate) User.associate(db);
if (Nominations.associate) Nominations.associate(db);
if (Nominator.associate) Nominator.associate(db);
if (Nominees.associate) Nominees.associate(db);
if (Votes.associate) Votes.associate(db);

module.exports = db;
