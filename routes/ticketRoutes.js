const express = require("express");

const {
    createTicket,
    getOwnTickets,
    getAssignedTickets,
    closeAssignedTicket,
    assignTechnicianToTicket,
    getAllTickets,
    deleteTicket,
} = require("../controllers/ticketController");

const {
    protect,
    authorizeRoles,
    authorizeSelfOrRole,
    verifyActiveStatus,
} = require("../middlewares/authMiddleware");

const {
    validateCreateTicket,
    handleValidationErrors,
} = require("../middlewares/validationMiddleware");

const router = express.Router();

router.post(
    "/create",
    protect,
    authorizeRoles("guest"),
    verifyActiveStatus,
    validateCreateTicket,
    handleValidationErrors,
    createTicket
);

router.get(
    "/my-tickets",
    protect,
    authorizeRoles("guest"),
    verifyActiveStatus,
    getOwnTickets
);

router.get(
    "/my-assigned",
    protect,
    authorizeRoles("technician"),
    verifyActiveStatus,
    getAssignedTickets
);

router.patch(
    "/assigned/:id/close",
    protect,
    authorizeRoles("technician"),
    verifyActiveStatus,
    closeAssignedTicket
);

router.patch(
    "/:id/assign-technician",
    protect,
    authorizeRoles("admin"),
    assignTechnicianToTicket
);

router.get("/all-tickets", protect, authorizeRoles("admin"), getAllTickets);

router.delete("/:id", protect, authorizeRoles("guest", "admin"), deleteTicket);

module.exports = router;
