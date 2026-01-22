const express = require("express");
const router = express.Router();
const userController = require("../controllers").userController;
const { checkAuth } = require("../middlewares/authMiddleware");

router.post("/", checkAuth, userController.createUser);
router.get("/", userController.getAllUsers);
router.get("/:userId", userController.getUserById);
router.put("/:userId", userController.updateUserById);
router.delete("/:userId", userController.deleteUserById);

module.exports = router;
