const express = require("express");
const router = express.Router();
const { taskController } = require("../controllers");
const { checkAuth } = require("../middlewares/authMiddleware");

router.post("/", checkAuth, taskController.createTask);
router.get("/column/:columnId", checkAuth, taskController.getTasksByColumn);
router.put("/:id", checkAuth, taskController.updateTaskById);
router.delete("/:id", checkAuth, taskController.deleteTaskById);

module.exports = router;
