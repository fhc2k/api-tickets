const express = require("express");

const {
    createTicket,
    getOwnTickets,
    getAssignedTickets,
    closeAssignedTicket,
    assignTechnicianToTicket,
    getAllTickets,
    deleteTicket,
    getTicketById,
} = require("../controllers/ticketController");

const {
    protect,
    authorizeRoles,
    authorizeSelfOrRole,
    verifyActiveStatus,
} = require("../middlewares/authMiddleware");

const {
    validateCreateTicket,
    validateGetTickets,
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
    "/my-assigned/:id/close",
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

router.get(
    "/",
    protect,
    authorizeRoles("admin"),
    validateGetTickets,
    handleValidationErrors,
    getAllTickets
);

router.get("/:id", protect, getTicketById);

router.delete("/:id", protect, authorizeRoles("guest", "admin"), deleteTicket);

module.exports = router;
