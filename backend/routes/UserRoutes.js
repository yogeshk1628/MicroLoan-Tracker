const express = require("express");
const multer = require("multer");
const { signup, loginUser, getUsersById, updateuserPassword, updateuserProfile, forgotPassword, verifyOtp, resendOtp, resetPassword } = require("../controllers/UserContoller"); 
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
router.put("/updateuserprofile/:id", verifyToken, authorizedRoles("user", "admin"), updateuserProfile);
router.put("/updateuserpassword/:id", verifyToken, authorizedRoles("user"), updateuserPassword);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/reset-password/:token", resetPassword);

module.exports = router;