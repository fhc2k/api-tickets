const express = require("express");
const {
    registerGuest,
    registerTechnician,
    approveOrRejectUser,
    getUsers,
    getUser,
    deleteUser,
} = require("../controllers/userController");
const {
    protect,
    authorizeRoles,
    authorizeSelfOrRole,
    verifyActiveStatus,
} = require("../middlewares/authMiddleware");

const {
    validateRegisterGuest,
    validateRegisterTechnician,
    validateApproveOrRejectUser,
    validateGetUsers,
    handleValidationErrors,
} = require("../middlewares/validationMiddleware");

const router = express.Router();

router.post(
    "/register/guest",
    validateRegisterGuest,
    handleValidationErrors,
    registerGuest
);
router.post(
    "/register/technician",
    validateRegisterTechnician,
    handleValidationErrors,
    registerTechnician
);

router.patch(
    "/status/:id",
    protect,
    authorizeRoles("admin"),
    validateApproveOrRejectUser,
    handleValidationErrors,
    approveOrRejectUser
);

router.delete("/:id", protect, authorizeRoles("admin"), deleteUser);

router.get(
    "/:id",
    protect,
    authorizeSelfOrRole("admin"),
    verifyActiveStatus,
    getUser
);

router.get(
    "/",
    protect,
    authorizeRoles("admin"),
    validateGetUsers,
    handleValidationErrors,
    getUsers
);

module.exports = router;
