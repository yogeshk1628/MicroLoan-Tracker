const express = require("express");
const multer = require("multer");
const { signup, loginUser, getUsersById } = require("../controllers/UserContoller"); 
const { verifyToken, authorizedRoles } = require("../middleware/AuthMiddleware"); 
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

router.post("/signup", upload.none(), signup);
router.post("/login", loginUser);
router.get("/user/:id", verifyToken, authorizedRoles("user"), getUsersById);
// router.put("/updateuserprofile/:id", verifyToken, authorizedRoles("user"), updateuserProfile);
// router.put("/updateuserpassword/:id", verifyToken, authorizedRoles("user"), updateuserPassword);
// router.post("/forgot-password", forgotPassword);
// router.post("/reset-password/:token", resetPassword);

module.exports = router;