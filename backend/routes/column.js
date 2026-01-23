const express = require("express");
const router = express.Router();
const { columnController } = require("../controllers");
const { checkAuth } = require("../middlewares/authMiddleware");

router.post("/project/:projectId", checkAuth, columnController.createColumn);
router.get(
  "/project/:projectId",
  checkAuth,
  columnController.getColumnsByProject
);
router.put("/:id", checkAuth, columnController.updateColumnById);
router.delete("/:id", checkAuth, columnController.deleteColumnById);

module.exports = router;
