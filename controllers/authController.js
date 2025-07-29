const { User } = require("../models/User");
const asyncHandler = require("express-async-handler");
const generateToken = require("../utils/generateToken");

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
        res.status(404);
        throw new Error(
            "No encontramos una cuenta con ese identificador. Verifica e intenta de nuevo."
        );
    }

    const matchPassword = await user.matchPassword(password);

    if (!matchPassword) {
        res.status(401);
        throw new Error("La contraseña ingresada es incorrecta.");
    }

    if (user.status === "pending") {
        res.status(403);
        throw new Error(
            "Tu cuenta aún no ha sido aprobada por el administrador. Espera la confirmacion en tu correo registrado."
        );
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.json({
        message: "Login exitoso.",
        user: {
            _id: user._id,
            name: user.name,
            department: user.department,
            email: user.email,
            username: user.username,
            role: user.role,
            status: user.status,
        },
    });
});

const getMe = asyncHandler(async (req, res) => {
    const { user } = req;

    res.status(200).json({
        message: "Login exitoso.",
        user,
    });
});

const logoutUser = asyncHandler((req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    res.status(200).json({ message: "Sesión cerrada correctamente." });
});

module.exports = {
    loginUser,
    getMe,
    logoutUser,
};
