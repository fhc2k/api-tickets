const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5, 
    message: {
        message:
            "Demasiados intentos de inicio de sesión. Inténtalo de nuevo más tarde.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    loginLimiter
}