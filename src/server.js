const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();
const port = process.env.PORT;
const bodyParser = require("body-parser");
const morgan = require("morgan");
const db = require('./db/index.js');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const authRouter = require('./routes/auth.route');
const userRouter = require('./routes/user.route');
const smokingStatusRouter = require('./routes/smokingStatus.route');
const coachRouter = require('./routes/coach.route');
const meetSessionRouter = require('./routes/meetSession.route');
const postRouter = require('./routes/post.route');
const commentRouter = require('./routes/comment.route');
const badgeRouter = require('./routes/badge.route');
const tagRouter = require('./routes/tag.route');
const userBadgeRouter = require('./routes/userBadge.route');

const whiteList = ['http://localhost:5173', 'http://localhost:8080'];
const corsOptions = {
    origin: function (origin, callback) {
        if (whiteList.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(morgan("dev"));
// Connect to MongoDB
db.connect();
// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/smoking-status', smokingStatusRouter);
app.use('/api/coach', coachRouter);
app.use('/api/meet-session', meetSessionRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/badges', badgeRouter);
app.use('/api/tags', tagRouter);
app.use('/api/user-badges', userBadgeRouter);

// Swagger documentation
const swaggerDocument = require('../swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Run the server
app.get('/', (req, res) => {
    res.send('API Smoking website')
})

app.use(async (err, req, res, next) => {
    res.status = err.status || 500,
        res.send({
            "error": {
                "status": err.status || 500,
                "message": err.message
            }
        });
})

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));

