const notFound = (req, res, next) => {
    const error = new Error(`Recurso no encontrado - ${req.originalUrl}`);
    res.status(404);
    next(error);
};


const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    if (err.name === "CastError" && err.kind === "ObjectId") {
        statusCode = 400;
        err.message = "ID de recurso inválido.";
    }

    if (err.name === "ValidationError") {
        statusCode = 400;
        err.message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
    }

    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        err.message = `El campo '${field}' ya existe. Por favor, use otro valor.`;
    }

    res.status(statusCode).json({
        ok: false,
        status: statusCode,
        message: statusCode === 500 ? "Error interno del servidor" : err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};

module.exports = {
    notFound,
    errorHandler,
};
