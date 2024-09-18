const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config(); // לקרוא משתנים מקובץ .env

const app = express();
const PORT = process.env.PORT || 5000; // הגדרת הפורט

const MONGODB_URI = process.env.MONGODB_URI;

// הגדרת CORS
app.use(cors({
  origin: ['http://localhost:3000', 'https://www.topmarket10.com'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Middleware לטיפול בנתונים
app.use(bodyParser.json()); // מנתח את גוף הבקשות ב-JSON

// חיבור ל-MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB', err));

// הגדרת המודל של הנתונים
const scoreboardSchema = new mongoose.Schema({
  name: String,
  score: Number,
});

const Scoreboard = mongoose.model('Scoreboard', scoreboardSchema);

// נתיב לקבלת לוח התוצאות
app.get('/api/scores', async (req, res) => {
  try {
    const scores = await Scoreboard.find().sort({ score: -1 });
    res.json(scores);
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).send('Internal Server Error');
  }
});

// נתיב לעדכון לוח התוצאות
app.post('/api/scores', async (req, res) => {
  try {
    const { name, score } = req.body;
    const newScore = new Scoreboard({ name, score });
    await newScore.save();
    res.status(200).send('Score updated');
  } catch (error) {
    console.error('Error updating score:', error);
    res.status(500).send('Internal Server Error');
  }
});

// נתיב לאיפוס לוח התוצאות
app.post('/api/scores/reset', async (req, res) => {
  try {
    await Scoreboard.deleteMany({});
    res.status(200).send('Leaderboard reset');
  } catch (error) {
    console.error('Error resetting leaderboard:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
