const express = require("express");
const router = express.Router();
const { checkAuth } = require("../middlewares/authMiddleware");
const projectController = require("../controllers").projectController;

router.post("/", projectController.createProject);
router.get("/", checkAuth, projectController.getProjectsByMember);
router.get("/:projectId", projectController.getProjectById);
router.put("/:projectId", projectController.updateProjectById);
router.delete("/:projectId", projectController.deleteProjectById);

module.exports = router;
