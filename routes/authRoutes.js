const express = require("express");
const {
    loginUser,
    getMe,
    logoutUser,
} = require("../controllers/authController");
const { loginLimiter } = require("../middlewares/limiterMiddleware");
const {
    validateLogin,
    handleValidationErrors,
} = require("../middlewares/validationMiddleware");
const {
    protect,
    authorizeRoles,
    authorizeSelfOrRole,
    verifyActiveStatus,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
    "/",
    /*loginLimiter,*/
    validateLogin,
    handleValidationErrors,
    loginUser
);

router.get("/me", /*loginLimiter,*/ protect, verifyActiveStatus, getMe);

router.post("/logout",  protect, logoutUser);

module.exports = router;
