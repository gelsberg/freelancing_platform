const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


 
// const mongoURI = 'mongodb+srv://gelsberge:pass1234@@cluster0.igcdv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';


mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Sample route to test connection
app.get('/', (req, res) => {
  res.send('MongoDB connection is working!');
});

// Server listening
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
