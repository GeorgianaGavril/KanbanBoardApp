const express = require("express");
const router = express.Router();
const projectRoute = require("./project");
const userRoute = require("./user");
const columnRoute = require("./column");
const taskRoute = require("./task");

router.use("/project", projectRoute);
router.use("/user", userRoute);
router.use("/column", columnRoute);
router.use("/task", taskRoute);

module.exports = router;
