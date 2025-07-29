const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        res.status(401);
        throw new Error("No autorizado, primero incia sesion.");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            res.status(404);
            throw new Error("No autorizado, usuario no encontrado.");
        }

        req.user = user;

        next();
    } catch (error) {
        res.status(401);
        throw new Error("No autorizado, token inválido o expirado.");
    }
});

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const { user } = req;
         console.log(req.user)

        if (!req.user || !allowedRoles.includes(user.role)) {
            return res.status(403).json({
                message: "No autorizado para acceder a este recurso.",
            });
        }
        next();
    };
};

const authorizeSelfOrRole = (...allowedRoles) => {
    return (req, res, next) => {
        const { id } = req.params;
        const { user } = req;
        const userIdFromReq = user._id.toString();

        if (userIdFromReq === id || allowedRoles.includes(user.role)) {
            return next();
        }

        return res.status(403).json({
            message: "No tienes permisos para acceder a esta información.",
        });
    };
};

const verifyActiveStatus = asyncHandler(async (req, res, next) => {
    const { user } = req;

    if (user.status !== "active") {
        res.status(403);
        throw new Error("No autorizado. Tu usuario no está activo.");
    }

    next();
});

module.exports = {
    protect,
    authorizeRoles,
    authorizeSelfOrRole,
    verifyActiveStatus,
};
