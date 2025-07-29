const mongoose = require("mongoose");

const departmentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        trim: true,
    },
});

const Department = mongoose.model("Department", departmentSchema);
module.exports = Department;
