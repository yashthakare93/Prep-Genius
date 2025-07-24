const User = require('../models/userModel');
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { route } = require('../routes/authRoutes');

// @desc    Get the profile of the logged-in user
// @route   GET /api/user/profile
exports.getUserProfile = async (req, res) => {
    const  userId  = req.userId;
    try {
        console.log('--inside getUserProfile--');
        console.log('--serching for user with userId:', userId);
        const user = await User.findById(userId).select('-passwordHash');
        console.log('--database returned', user);
        console.log('--end of getUserProfile--');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @desc   Update user profile of the logged-in user
// @route   PUT /api/user/profile
exports.updateUserProfile = async (req, res) => {
    const { userId } = req;

    try {
        const user = await User.findById(userId);

        if (user) {
            user.firstName = req.body.firstName || user.firstName;
            user.lastName = req.body.lastName || user.lastName;
            user.githubUrl = req.body.githubUrl || user.githubUrl;
            user.linkedinUrl = req.body.linkedinUrl || user.linkedinUrl;

            const updatedUser = await user.save();
            res.status(200).json({
                message: 'User profile updated successfully',
                user: {
                    id: updatedUser._id,
                    email: updatedUser.email,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    githubUrl: updatedUser.githubUrl,
                    linkedinUrl: updatedUser.linkedinUrl
                }
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @desc    Upload resume file and extract text
// @route  POST /api/user/resume

exports.uploadResume = async (req, res) => {
    if(!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const filepath = req.file.path;
        const dataBuffer = fs.readFileSync(filepath);
        const data = await pdf(dataBuffer);
        
        const user = await User.findById(req.userId);
        if (!user) {
            fs.unlinkSync(filepath);
            return res.status(404).json({ message: 'User not found' });
        }
        user.resumeFilePath = filepath;
        user.resumeText = data.text;
        await user.save();

        res.status(200).json({
            message: 'Resume uploaded and parsed successfully',
            fileName : req.file.originalname,
        });

    } catch (error) {
        console.error('Error uploading resume:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @desc    Get the uploaded resume file
// @route  GET /api/user/resume
exports.getResume = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user || !user.resumeFilePath) {
            return res.status(404).json({ message: 'No resume found for this user.' });
        }
        // Construct the absolute path and send the file
        const absolutePath = path.resolve(user.resumeFilePath);
        res.sendFile(absolutePath);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};