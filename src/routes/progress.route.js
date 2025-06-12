const express = require("express");
const progressRouter = express.Router();
const progressController = require("../controllers/progress.controller");
const { validateToken, checkRole } = require("../middlewares/AuthMiddleware");

progressRouter.post(
  "/",
  validateToken,
  checkRole(["coach", "admin"]),
  progressController.createProgress
);

progressRouter.get(
  "/stage/:stageId",
  validateToken,
  checkRole(["coach", "admin"]),
  progressController.getProgressByStage
);

progressRouter.get(
  "/:id",
  validateToken,
  checkRole(["coach", "admin"]),
  progressController.getProgressById
);

progressRouter.put(
  "/:id",
  validateToken,
  checkRole(["coach", "admin"]),
  progressController.updateProgress
);

progressRouter.delete(
  "/:id",
  validateToken,
  checkRole(["coach", "admin"]),
  progressController.deleteProgress
);
// 🔐 Get all progress — Admin, Coach, User (lọc theo quyền trong controller)
progressRouter.get(
  "/",
  validateToken,
  checkRole(["user", "coach", "admin"]),
  progressController.getAllProgress
);

module.exports = progressRouter;
