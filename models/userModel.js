const moongoose = require('mongoose');
const userSchema = new moongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"],
    },
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
    },
    githubUrl: String,
    linkedinUrl: String,
    resumeFilePath: String,

}, { timestamps: true });

const User = moongoose.model("User", userSchema);
module.exports = User;