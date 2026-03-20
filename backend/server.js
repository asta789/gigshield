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

app.get('/api/health', (req, res) => {
  res.json({ status: 'GigShield API running' });
});

const PORT = process.env.PORT || 5000;

// Start server FIRST then connect to MongoDB
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('DB error:', err.message));