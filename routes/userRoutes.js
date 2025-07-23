const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { uploadResume, getUserProfile, updateUserProfile } = require('../controllers/userController');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, 'uploads/resumes');
    },
    filename: (req, file, cb) => {
        cb(null, `user-${req.userId}-${Date.now()}.pdf`);
    }
})

// Initialize multer with the storage configuration
const upload = multer({
    storage: storage,
    fileFilter: (req, res, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

// Protect all routes in this file
router.use(protect);

// Define the Routes

// @route   GET /api/user/profile
router.get('/profile',getUserProfile);

// @route   PUT /api/user/profile
router.put('/profile', updateUserProfile);

// @route   POST /api/user/resume
router.post('/resume', upload.single('resume'),uploadResume);

module.exports = router;

