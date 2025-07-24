const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // check if password was provided
        if (!password) {
            return res.status(400).json({ message: 'Password is required.' });
        }

        // check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // hash the password
        const salt = await bcrypt.genSalt(10);
 
        const passwordHash = await bcrypt.hash(password, salt);

        // create a new user
        const user = new User({
            email,
            passwordHash: passwordHash,
            firstName,
            lastName,
        });
        await user.save();
        res.status(201).json({
            message: 'user created successfully',
            userId: user._id,
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @desc    Authenticate a user and get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // check password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // create JWT
        const payload = {
            userId: user._id, 
            email: user.email,
        }
        console.log("id beign put in token ", payload.userId);
        console.log("email beign put in token ", payload.email);
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({
            message: 'Login successful',
            token,
        });

    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @desc    Logout user
// @route   POST /api/auth/logout
exports.logout = (req, res) => { 
    try {
        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({ message: 'Server error' });
    }
}