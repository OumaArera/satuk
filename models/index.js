const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Nominations = require('./nominations')(sequelize, Sequelize);
const Nominator = require('./nominator')(sequelize, Sequelize);
const Nominees = require('./nominee')(sequelize, Sequelize);
const Votes = require('./count')(sequelize, Sequelize); 
const User = require('./users')(sequelize, Sequelize); 
const Ticket = require('./ticket')(sequelize, Sequelize); 
const Category = require("./category")(sequelize, Sequelize); 
const Candidate = require('./candidate')(sequelize, Sequelize); 
const Voter = require('./voter')(sequelize, Sequelize); 

const db = {
  sequelize,
  Sequelize,
  Nominations,
  Nominator,
  Nominees,
  Votes, 
  User,  
  Ticket,
  Category,
  Candidate,
  Voter 
};

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
