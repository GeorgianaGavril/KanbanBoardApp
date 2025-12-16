const express = require("express");
const router = express.Router();
const { columnController } = require("../controllers");

router.post("/project/:projectId", columnController.createColumn);
router.get("/project/:projectId", columnController.getColumnsByProject);
router.put("/:id", columnController.updateColumnById);
router.delete("/:id", columnController.deleteColumnById);

module.exports = router;
