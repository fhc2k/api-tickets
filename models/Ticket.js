const mongoose = require("mongoose");

const ticketSchema = mongoose.Schema(
    {
        /*noTicket: {
            autoincrement
        },*/
        department: {
            /*type: mongoose.Schema.Types.ObjectId,
            ref: "Department",*/
            type: String,
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            ref: "Department",
            required: true,
        },
        status: {
            type: String,
            enum: ["open", "assigned", "closed"],
            default: "open",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        closedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

ticketSchema.pre("save", function (next) {
    if (
        this.isModified("assignedTo") &&
        this.assignedTo &&
        this.status === "open"
    ) {
        this.status = "assigned";
    }

    next();
});

const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;
