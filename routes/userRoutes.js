const express = require("express");
const {
    registerGuest,
    registerTechnician,
    approveOrRejectUser,
    getUser,
    getAllGuests,
    deleteUser,
    getAllTechnicians,
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

router.delete("/delete/:id", protect, authorizeRoles("admin"), deleteUser);

router.get("/all-guest", protect, authorizeRoles("admin"), getAllGuests);
router.get(
    "/all-technicians",
    protect,
    authorizeRoles("admin"),
    getAllTechnicians
);
router.get(
    "/:id",
    protect,
    authorizeSelfOrRole("admin"),
    verifyActiveStatus,
    getUser
);

module.exports = router;
