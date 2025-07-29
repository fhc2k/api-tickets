// 🌱 Variables de entorno
require("dotenv").config();

// 🔧 Dependencias core
const express = require("express");
const http = require("http");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// 📦 Rutas y servicios
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const userRoutes = require("./routes/userRoutes");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const { setupTicketChangeStream } = require("./services/changeStreamService");

// 🌐 Configuración
const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

// 🎧 Socket.IO se inicializa después de `server`
const { Server } = require("socket.io");

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true,
    },
});
app.set("io", io); // Puedes acceder a io desde req.app.get("io")

// 🔐 Middlewares globales
app.use(helmet());
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://dulcet-fenglisu-4899cb.netlify.app",
        ],
        credentials: true,
    })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 📌 Rutas
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/users", userRoutes);

// 🛑 Middleware de errores
app.use(notFound);
app.use(errorHandler);

// 🚀 Arranque del servidor
const startServer = async () => {
    await connectDB();

    server.listen(PORT, "0.0.0.0", () => {
        console.log(`✅ Servidor escuchando`);
    });

    setupTicketChangeStream(io);
};

startServer();
