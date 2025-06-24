const express = require("express");
const quitPlanRouter = express.Router();
const quitPlanController = require("../controllers/quitPlan.controller");
const { validateToken, checkRole } = require("../middlewares/AuthMiddleware");

//Get all quit plan public
quitPlanRouter.get(
  "/public",
  validateToken,
  quitPlanController.getPublicPlans
);

// 🔐 Get all quit plans — Admin only
quitPlanRouter.get(
  "/",
  validateToken,
  checkRole(["admin", "user", "coach"]),
  quitPlanController.getAllQuitPlans
);

// 🔐 Get a quit plan by ID — Only owner or admin
quitPlanRouter.get("/:id", validateToken, quitPlanController.getQuitPlanById);

quitPlanRouter.get("/user/:id", validateToken, quitPlanController.getQuitPlanByUserId);
// 🔐 Create a new quit plan — User or Coach (Coach can create on behalf of user)
quitPlanRouter.post(
  "/",
  validateToken,
  checkRole(["user", "coach", "admin"]),

  quitPlanController.createQuitPlan
);

// 🔐 Update a quit plan — Only owner or admin
quitPlanRouter.put(
  "/:id",
  validateToken,
  checkRole(["user", "coach", "admin"]),
  quitPlanController.updateQuitPlan
);

// 🔐 Delete a quit plan — Admin only
quitPlanRouter.delete(
  "/:id",
  validateToken,
  checkRole(["admin"]),
  quitPlanController.deleteQuitPlan
);

// 🆕 Admin/Coach duyệt kế hoạch
quitPlanRouter.put(
  "/:id/approve",
  validateToken,
  checkRole(["admin", "coach"]),
  quitPlanController.approveQuitPlan
);
quitPlanRouter.put(
  "/:id/reject",
  validateToken,
  checkRole(["admin", "coach"]),
  quitPlanController.rejectQuitPlan
);

quitPlanRouter.post(
  "/request",
  validateToken,
  checkRole(["user", "coach", "admin"]),
  quitPlanController.sendQuitPlanRequest
);

quitPlanRouter.post(
  "/user/use/:id",
  validateToken,
  quitPlanController.usePublicPlan
);


module.exports = quitPlanRouter;
