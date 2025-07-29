const mongoose = require("mongoose");
const { hashPassword, comparePasswords } = require("../utils/passwordUtils");

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/,
                "Por favor, introduce un email válido",
            ],
        },

        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["admin", "technician", "guest"],
            default: "pending_user",
        },
        status: {
            type: String,
            enum: ["active", "pending"],
            default: "pending",
        },
        lastToken: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await hashPassword(this.password);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await comparePasswords(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

const Guest = User.discriminator(
    "Guest",
    new mongoose.Schema({
        department: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            default: "guest",
            enum: ["guest"],
            immutable: true,
        },
    })
);

const Technician = User.discriminator(
    "Technician",
    new mongoose.Schema({
        role: {
            type: String,
            default: "technician",
            enum: ["technician"],
            immutable: true,
        },
    })
);

const Admin = User.discriminator(
    "Admin",
    new mongoose.Schema({
        role: {
            type: String,
            default: "admin",
            enum: ["admin"],
            immutable: true,
        },
        status: {
            type: String,
            enum: ["active"],
            default: "active",
        },
    })
);

module.exports = {
    User,
    Guest,
    Technician,
    Admin,
};
