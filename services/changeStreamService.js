const Ticket = require("../models/Ticket");

const setupTicketChangeStream = (io) => {
    const changeStream = Ticket.watch();

    changeStream.on("change", async (change) => {
        switch (change.operationType) {
            case "insert":
                const newTicket = await Ticket.findById(
                    change.documentKey._id
                ).populate("assignedTo", "name");

                io.emit("ticket-created", newTicket);
                break;

            case "update":
            case "replace":
                const updatedTicket = await Ticket.findById(
                    change.documentKey._id
                ).populate("assignedTo", "name")
                .populate("createdBy", "name");

                io.emit("ticket-updated", updatedTicket);
                break;

            case "delete":
                io.emit("ticket-deleted", { _id: change.documentKey._id });
                break;
        }
    });
};

module.exports = { setupTicketChangeStream };
