const express = require("express");
const router = express.Router();
const { verifyToken, authorizedRoles } = require("../middleware/AuthMiddleware");
const { deleteUser, getAllusers } = require("../controllers/AdminContoller");


router.delete("/delete/user/:id", verifyToken, authorizedRoles("admin"), deleteUser);
router.get("/allusers", verifyToken, authorizedRoles("admin"), getAllusers);