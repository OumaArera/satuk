const express = require('express');
const db = require('./models');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configure CORS to allow only specific origins
const allowedOrigins = [
  'https://satuk-awards.vercel.app',
  'https://satuk-event-management.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // if you need to allow cookies/auth headers
}));

app.use(express.json());

app.use('/users/nominate', require('./nominations/nominate'));
app.use('/users/nominate', require('./nominations/getNominees'));
app.use('/users/nominate', require('./nominations/clearData'));
app.use('/users/signup', require('./authentication/signup'));
app.use('/users/login', require('./authentication/login'));
app.use('/users/ticket', require('./tickets/book'));
app.use('/users/ticket', require('./tickets/updateTicket'));
app.use('/users/ticket', require('./tickets/clearTickets'));
app.use('/users/ticket', require('./tickets/pendingTickets'));
app.use('/users/tickets', require('./tickets/paidTickets'));
app.use('/users/my-tickets', require('./tickets/myTickets'));
app.use('/users/decline-ticket', require('./tickets/declineTicket'));
app.use('/users/category', require('./vote/addCategories'));
app.use('/users/category', require('./vote/getCategories'));
app.use('/users/candidate', require('./vote/addCandidate'));
app.use('/users/candidate', require('./vote/getCandidates'));
app.use('/users/candidate', require('./vote/updateCandidate'));
app.use('/users/votees', require('./vote/vote'));
app.use('/users/votees', require('./vote/removeVoters'));
app.use('/users/voting', require('./vote/voting'));

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

db.sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
