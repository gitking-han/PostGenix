require('dotenv').config();
const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
require('./config/passportGoogle');

const paddleRoutes = require('./routes/paddle');
const postRoutes = require('./routes/postRoutes');
const chatRoutes = require('./routes/chatRoutes');
const aiRoutes = require('./routes/aiRoutes')
connectToMongo();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json({
  verify: (req, res, buf) => {
    // This saves the raw bytes as a string before Express touches them
    if (req.originalUrl === '/api/paddle/webhook') {
      req.rawBody = buf.toString();
    }
  }
}));
// --- CRITICAL CHANGE END ---

app.use(cors()); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'Postgenix',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes Registration
app.use('/api/paddle', paddleRoutes);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/public', require('./routes/publicroutes'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/posts', postRoutes); 
app.use('/api/chats', chatRoutes);
app.use('/api/ai', aiRoutes);


app.listen(port, () => {
  console.log(`Backend Postgenix listening at http://localhost:${port}`);
});