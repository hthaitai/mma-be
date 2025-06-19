const express = require("express");
const webhookRouter = express.Router();
const { handlePaymentWebhook } = require("../controllers/webhook.controller");

webhookRouter.post("/receive-hook", handlePaymentWebhook);

module.exports = webhookRouter;
