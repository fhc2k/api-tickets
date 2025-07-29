const sanitizeBody = (fieldsToSanitize = []) => {
    return (req, res, next) => {
        if (!req.body) return next();

        fieldsToSanitize.forEach((field) => {
            if (req.body[field] && typeof req.body[field] === "string") {
                req.body[field] = req.body[field].trim().toLowerCase();
            }
        });

        next();
    };
};

module.exports = {
    sanitizeBody,
};
