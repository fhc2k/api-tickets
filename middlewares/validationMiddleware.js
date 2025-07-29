const { body, validationResult } = require("express-validator");

const reservedWords = [
    "admin",
    "root",
    "support",
    "system",
    "moderator",
    "staff",
    "backend",
    "dev",
    "test",
];

const validateLogin = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("El email es obligatorio."),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("La contraseña es obligatoria."),
];

const validateRegisterGuest = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("El nombre es obligatorio.")
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage("El nombre solo debe contener letras y espacios.")
        .isLength({ min: 10, max: 60 })
        .withMessage("El nombre debe tener entre 10 y 60 caracteres.")
        .custom((value) => {
            const wordCount = value.trim().split(/\s+/).length;
            if (wordCount < 3) {
                throw new Error(
                    "Debes ingresar al menos tres palabras (ej. nombre y dos apellidos)."
                );
            }
            return true;
        }),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("El correo electrónico es obligatorio.")
        .isEmail()
        .withMessage("El correo electrónico no es válido.")
        .custom((value) => {
            const emailName = value.split("@")[0].toLowerCase();
            const hasReserved = reservedWords.some((word) =>
                emailName.includes(word)
            );
            if (hasReserved) {
                throw new Error(
                    "El correo contiene palabras reservadas no permitidas."
                );
            }
            return true;
        }),

    body("department")
        .notEmpty()
        .withMessage("El departamento es obligatorio para técnicos.")
        .isString()
        .withMessage("El departamento debe ser un texto."),

    body("password")
        .notEmpty()
        .withMessage("La contraseña es obligatoria.")
        .isLength({ min: 6 })
        .withMessage("La contraseña debe tener al menos 6 caracteres.")
        .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
        .withMessage(
            "Debe tener al menos 6 caracteres, una mayúscula, un número y un carácter especial."
        ),

    body("role")
        .notEmpty()
        .withMessage("El rol de usuario es obligatorio.")
        .isIn(["guest"])
        .withMessage("El rol de usuario debe ser 'guest'."),
];

const validateRegisterTechnician = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("El nombre es obligatorio.")
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage("El nombre solo debe contener letras y espacios.")
        .isLength({ min: 10, max: 60 })
        .withMessage("El nombre debe tener entre 10 y 60 caracteres.")
        .custom((value) => {
            const wordCount = value.trim().split(/\s+/).length;
            if (wordCount < 3) {
                throw new Error(
                    "Debes ingresar al menos tres palabras (ej. nombre y dos apellidos)."
                );
            }
            return true;
        }),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("El correo electrónico es obligatorio.")
        .isEmail()
        .withMessage("El correo electrónico no es válido."),

    body("password")
        .notEmpty()
        .withMessage("La contraseña es obligatoria.")
        .isLength({ min: 6 })
        .withMessage("La contraseña debe tener al menos 6 caracteres.")
        .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
        .withMessage(
            "Debe tener al menos 6 caracteres, una mayúscula, un número y un carácter especial."
        ),

    body("role")
        .notEmpty()
        .withMessage("El rol de usuario es obligatorio.")
        .isIn(["technician"])
        .withMessage("El rol de usuario debe ser 'technician'."),
];

const validateApproveOrRejectUser = [
    body("action")
        .notEmpty()
        .withMessage("El valor de action es obligatorio.")
        .isIn(["approve", "reject"])
        .withMessage("El valor de status debe de ser 'approve' o 'reject'."),
];

const validateCreateTicket = [
    body("subject")
        .notEmpty()
        .withMessage("El valor de subject es obligatorio."),
    body("description")
        .notEmpty()
        .withMessage("El valor de description es obligatorio."),
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    next();
};

module.exports = {
    validateLogin,
    validateRegisterGuest,
    validateRegisterTechnician,
    validateApproveOrRejectUser,
    validateCreateTicket,
    handleValidationErrors,
};
