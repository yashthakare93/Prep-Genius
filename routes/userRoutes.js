const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { uploadResume, getUserProfile, updateUserProfile,getResume } = require('../controllers/userController');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => { // Corrected: Use 'file'
        cb(null, 'uploads/resumes');
    },
    filename: (req, file, cb) => { // Corrected: Use 'file'
        cb(null, `user-${req.userId}-${Date.now()}.pdf`);
    }
});

// Initialize multer with the storage configuration
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => { // <-- FIX IS HERE
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

// Protect all routes in this file
router.use(protect);

// Define the Routes

// @route   GET /api/user/profile
router.get('/profile', getUserProfile);

// @route   PUT /api/user/profile
router.put('/profile', updateUserProfile);

// @route   POST /api/user/resume
router.post('/resume', upload.single('resume'), uploadResume);

// @route GET /api/user/resume
router.get('/resume',getResume);

module.exports = router;