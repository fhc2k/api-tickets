const { User, Guest, Technician, Admin } = require("../models/User");
const asyncHandler = require("express-async-handler");
const Ticket = require("../models/Ticket");

const {
    sendWelcomeEmail,
    sendStatusChangeEmail,
} = require("../services/emailService");
const mongoose = require("mongoose");

const registerGuest = asyncHandler(async (req, res) => {
    const { name, department, email, password, role } = req.body;

    const existingUserByEmail = await User.findOne({
        email,
    });

    if (existingUserByEmail) {
        res.status(400);
        throw new Error("Ya existe un usuario asociado a este correo.");
    }

    const existingGuestForDepartment = await User.findOne({
        department: department,
        role: "guest",
    });

    if (existingGuestForDepartment) {
        res.status(400);
        throw new Error(
            `Ya existe un usuario activo o pendiente para el departamento ${department}.`
        );
    }

    const createGuest = await Guest.create({
        name: name,
        department: department,
        email: email,
        password: password,
        role: role,
    });

    if (!createGuest) {
        res.status(400);
        throw new Error("Error al crear usuario, inténtalo más tarde.");
    }

    const guest = {
        _id: createGuest._id,
        name: createGuest.name,
        email: createGuest.email,
        department: createGuest.department,
        role: createGuest.role,
        status: createGuest.status,
        createdAt: createGuest.createdAt,
    };

    //sendWelcomeEmail(guest);

    res.status(201).json({
        message:
            "Usuario invitado registrado exitosamente. Espera la aprobación del administrador.",
        user: guest,
    });
});

const registerTechnician = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const existingUserByEmail = await User.findOne({ email });

    if (existingUserByEmail) {
        res.status(400);
        throw new Error("Ya existe una usuario asociado a este correo.");
    }

    const newTechnician = await userService.createTechnician({
        name,
        email,
        password,
    });

    if (!newTechnician) {
        res.status(400);
        throw new Error("Error al crear usuario, inténtalo más tarde.");
    }

    //sendWelcomeEmail(newTechnician);

    res.status(201).json({
        message:
            "Técnico registrado exitosamente. Espera la aprobación del administrador.",
        user: newTechnician,
    });
});

const approveOrRejectUser = asyncHandler(async (req, res) => {
    const { id: userId } = req.params;
    const { action } = req.body;

    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error("Usuario no encontrado.");
    }

    if (action === "reject") {
        await user.deleteOne();

        res.status(200).json({
            message: "Usuario rechazado correctamente.",
        });
    }

    user.status = "active";
    const updatedUser = await user.save();

    res.status(200).json({
        message: "Usuario aprobado correctamente.",
        user: updatedUser,
    });
});

const getUser = asyncHandler(async (req, res) => {
    const { id: userId } = req.params;

    const user = await User.findById(userId).select("-password");

    if (!user) {
        res.status(404);
        throw new Error("Usuario no encontrado.");
    }

    res.status(200).json(user);
});

const getUsers = asyncHandler(async (req, res) => {
    const { role, status, department } = req.query;

    const query = {};

    if (role) {
        query.role = role;
    } else {
        query.role = { $ne: "admin" };
    }

    if (status) {
        query.status = status;
    }

    if (department) {
        queryFilters.department = department;
    }

    const users = await User.find(query)
        .select("-password")
        .sort({ createdAt: -1 });

    res.status(200).json(users);
});

const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error("Usuario no encontrado.");
    }

    if (user.status !== "pending") {
        res.status(400);
        throw new Error(
            "Solo puedes eliminar usuarios cuya solicitud está pendiente de aprobación."
        );
    }

    await user.deleteOne();

    res.status(200).json({
        message: "Usuario eliminado correctamente.",
    });
});

module.exports = {
    registerGuest,
    registerTechnician,
    approveOrRejectUser,
    deleteUser,
    getUsers,
    getUser,
};
