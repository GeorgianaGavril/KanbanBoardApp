const express = require("express");
const router = express.Router();
const { taskController } = require("../controllers");

router.post("/", taskController.createTask);
router.get("/column/:columnId", taskController.getTasksByColumn);
router.put("/:id", taskController.updateTaskById);
router.delete("/:id", taskController.deleteTaskById);

module.exports = router;
