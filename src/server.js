const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();
const port = process.env.PORT;

const db = require('./configs/db/index.js');
// Connect to MongoDB
db.connect();
// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Run the server
app.get('/', (req, res) => {
    res.send('API Smoking website')
})

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));

