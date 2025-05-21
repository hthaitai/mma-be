const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();
const port = process.env.PORT;

const db = require('./configs/db/index.js');

const authRouter = require('./routes/auth.route');
// Connect to MongoDB
db.connect();
// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRouter);
// Run the server
app.get('/', (req, res) => {
    res.send('API Smoking website')
})

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));

