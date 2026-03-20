const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const workerRoutes = require('./routes/worker1 ');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/worker', workerRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'GigShield API running' }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`GigShield server running on port 5000`);
    });
  })
  .catch(err => console.error('DB connection error:', err));
