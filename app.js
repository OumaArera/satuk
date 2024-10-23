const express = require('express');
const db = require('./models');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Use CORS middleware
app.use(cors());
app.use(express.json());



app.use('/users/nominate', require('./nominations/nominate'));
app.use('/users/nominate', require('./nominations/getNominees'));
app.use('/users/nominate', require('./nominations/clearData'));
app.use('/users/signup', require('./authentication/signup'));


app.get('/', (req, res) => {
  res.send('Hello, World! Odedo');
});

db.sequelize.sync().then(() => {
    app.listen(port, () => {
    });
  }).catch(err => {
    console.error('Unable to connect to the database:', err);
  });
