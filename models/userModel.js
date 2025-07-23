const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
    },

    passwordHash: {
        type: String,
        required: [true, "A password is required"],
    },
    
    firstName: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    githubUrl: {
        type: String,
        default: ''
    },
    linkedinUrl: {
        type: String,
        default: ''
    },
    resumeFilePath: {
        type: String,
        default: ''
    },
    // Added field to store parsed text from the resume for AI analysis
    resumeText: {
        type: String,
        default: ''
    },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;