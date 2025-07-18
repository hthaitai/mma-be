const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const port = process.env.PORT;
const bodyParser = require("body-parser");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const cookieParser = require("cookie-parser");

let open;
(async () => {
  open = (await import("open")).default;
})();

const db = require("./db/index.js");
const cors = require("cors");

const authRouter = require("./routes/auth.route");
const userRouter = require("./routes/user.route");
const smokingStatusRouter = require("./routes/smokingStatus.route");
const coachRouter = require("./routes/coach.route");
const meetSessionRouter = require("./routes/meetSession.route");
const postRouter = require("./routes/post.route");
const commentRouter = require("./routes/comment.route");
const badgeRouter = require("./routes/badge.route");
const tagRouter = require("./routes/tag.route");
const userBadgeRouter = require("./routes/userBadge.route");
const quitPlanRouter = require("./routes/quitPlan.route");
const stageRouter = require("./routes/stage.route");
const progressRouter = require("./routes/progress.route");
const notificationRouter = require("./routes/notification.route");
const subscriptionRouter = require("./routes/subscription.route.js");
const feedbackRouter = require("./routes/feedback.route");
const paymentRouter = require("./routes/payment.route.js");
const webhookRouter = require("./routes/webhook.route.js");
const packageRouter = require("./routes/package.routes");
const chatRouter = require("./routes/chat.route.js");

const whiteList = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://exhela.vercel.app",
];
const corsOptions = {
  origin: function (origin, callback) {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(cookieParser());
// app.use(bodyParser.json());
app.use(morgan("dev"));
// Connect to MongoDB
db.connect();
// Middlewares
// app.use(express.json());
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Routes

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/smoking-status", smokingStatusRouter);
app.use("/api/coach", coachRouter);
app.use("/api/meet-session", meetSessionRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);
app.use("/api/badges", badgeRouter);
app.use("/api/tags", tagRouter);
app.use("/api/user-badges", userBadgeRouter);
app.use("/api/quitPlan", quitPlanRouter);
app.use("/api/stages", stageRouter);
app.use("/api/progress", progressRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/payments/webhook", webhookRouter);
app.use("/api/packages", packageRouter);
app.use("/api/chat", chatRouter);

// Swagger documentation
const swaggerDocument = require("../swagger.json");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Run the server
app.get("/", (req, res) => {
  res.send("API Smoking website");
});

webhookRouter.get("/receive-hook", (req, res) => {
  res.status(200).send("Webhook OK");
});

app.use(async (err, req, res, next) => {
  (res.status = err.status || 500),
    res.send({
      error: {
        status: err.status || 500,
        message: err.message,
      },
    });
});

app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  const open = (await import("open")).default;
  open(`http://localhost:${port}/api-docs`);
});
