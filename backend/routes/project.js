const express = require("express");
const router = express.Router();
const { checkAuth } = require("../middlewares/authMiddleware");
const projectController = require("../controllers").projectController;

router.post("/", projectController.createProject);
router.get("/", checkAuth, projectController.getProjectsByMember);
router.get("/:projectId", checkAuth, projectController.getProjectById);
router.put("/:projectId", checkAuth, projectController.updateProjectById);
router.delete("/:projectId", checkAuth, projectController.deleteProjectById);

module.exports = router;
