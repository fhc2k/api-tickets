const Ticket = require("../models/Ticket");
const { Technician } = require("../models/User");
const asyncHandler = require("express-async-handler");

const createTicket = asyncHandler(async (req, res) => {
    const { subject, description } = req.body;
    const { _id: userId, department: userDepartment } = req.user;

    const ticket = await Ticket.create({
        subject,
        description,
        department: userDepartment,
        createdBy: userId,
    });

    res.status(201).json({
        message: "Ticket creado exitosamente.",
        ticket: ticket,
    });
});

const getOwnTickets = asyncHandler(async (req, res) => {
    const { _id: userId } = req.user;

    const tickets = await Ticket.find({ createdBy: userId })
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email");

    res.status(200).json(tickets);
});

const getAssignedTickets = asyncHandler(async (req, res) => {
    const { _id: technicianId } = req.user;

    const tickets = await Ticket.find({ assignedTo: technicianId })
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email");

    res.status(200).json(tickets);
});

const closeAssignedTicket = asyncHandler(async (req, res) => {
    const { id: ticketId } = req.params;
    const { _id: technicianId } = req.user;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
        res.status(404);
        throw new Error("No se encontro ticket.");
    }

    if (
        !ticket.assignedTo ||
        ticket.assignedTo.toString() !== technicianId.toString()
    ) {
        res.status(403);
        throw new Error("No estás autorizado para cerrar este ticket.");
    }

    if (ticket.status === "closed") {
        res.status(400);
        throw new Error("Este ticket ya está cerrado.");
    }

    ticket.status = "closed";

    const closedTicket = await ticket.save();

    res.status(200).json({
        message: "Se cerro el ticket exitosamente.",
        ticket: closedTicket,
    });
});

const assignTechnicianToTicket = asyncHandler(async (req, res) => {
    const { id: ticketId } = req.params;
    const { technicianId } = req.body;

    if (!technicianId) {
        res.status(400);
        throw new Error("Se requiere el id del técnico.");
    }

    const technician = await Technician.findById(technicianId);

    if (!technician) {
        res.status(404);
        throw new Error("Técnico no encontrado.");
    }

    if (technician.status === "pending") {
        res.status(400);
        throw new Error(
            "Técnico en proceso de aprobacion, no se le pueden asignar tickets."
        );
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
        res.status(404);
        throw new Error("Ticket no encontrado.");
    }

    if (ticket.assignedTo) {
        res.status(404);
        throw new Error(
            "Ticket ya asignado, no puedes asignar un tecnico diferente."
        );
    }

    ticket.assignedTo = technician._id;

    const updatedTicket = await ticket.save();

    res.status(200).json({
        message: "Se asigno correctamente un técnico al ticket.",
        ticket: updatedTicket,
    });
});

const getTicketById = asyncHandler(async (req, res) => {
    const { id: ticketId } = req.params;
    const { _id: userId, role: userRole } = req.user;

    const query = { _id: ticketId };

    if (userRole !== "admin") {
        query.$or = [{ createdBy: userId }, { assignedTo: userId }];
    }

    const ticket = await Ticket.findOne(query)
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email");

    if (!ticket) {
        res.status(404);
        throw new Error("Ticket no encontrado o no tienes permiso para verlo.");
    }

    res.status(200).json(ticket);
});

const getAllTickets = asyncHandler(async (req, res) => {
    const { department, status, role, createdBy, assignedTo } = req.query;

    const query = {};

    if (role) {
        query.role = role;
    }

    if (status) {
        query.status = status;
    }

    if (department) {
        query.department = { $regex: department, $options: "i" };
    }

    if (createdBy) {
        query.createdBy = createdBy;
    }
    
    if (assignedTo) {
        query.assignedTo = assignedTo;
    }

    const tickets = await Ticket.find(query)
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email");

    res.status(200).json(tickets);
});

const deleteTicket = asyncHandler(async (req, res) => {
    const { id: ticketId } = req.params;
    const { id: userId, role: userRole } = req.user;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
        res.status(404);
        throw new Error("Ticket no encontrado.");
    }

    const isOwner = ticket.createdBy.toString() === userId.toString();
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
        res.status(403);
        throw new Error("No tienes permiso para eliminar este ticket.");
    }

    if (ticket.status !== "open") {
        res.status(400);
        throw new Error(
            "No se puede eliminar un ticket que ya ha sido asignado o cerrado."
        );
    }

    await ticket.deleteOne();

    res.status(200).json({ message: "Ticket eliminado correctamente." });
});

module.exports = {
    createTicket,
    getOwnTickets,
    getAssignedTickets,
    closeAssignedTicket,
    assignTechnicianToTicket,
    getTicketById,
    getAllTickets,
    deleteTicket,
};
