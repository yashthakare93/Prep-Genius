const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { email, passwordHash, firstName, lastName } = req.body;

        // check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passwordHash, salt);

        // create a new user
        const user = new User({
            email,
            hashedPassword,
            firstName,
            lastName,
        })
        await user.save();
        res.status(201).json({
            message: 'user created successfully',
            userId: user._id,
            email: user.email,
        })
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @desc    Authenticate a user and get token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, hashedPassword } = req.body;

        // check if user exists
        const user = await User.findOne({ emai });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // check password
        const isPasswordValid = await bcrypt.compare(passwordHash, user.hashedPassword);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // create JWT 
        const payload = {
            userId: user._id,
            email: user.email,
        }

        // create token
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({
            message: 'Login successful',
            token,
            userId: user._id,
            email: user.email,
        });


    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error' });
    }
}


// @desc    Logout user
// @route   POST /api/auth/logout
exports.logout = async(req,res)=>{
    try {
        // Invalidate the token on the client side
        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({ message: 'Server error' });
    }
}