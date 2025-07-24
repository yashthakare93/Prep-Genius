const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");

// Load environment variables immediately
dotenv.config();

// Route and Socket Handler Imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const interviewSocketHandler = require('./sockets/interviewSocketHandler');

// --- Basic Setup ---
const app = express();
const server = http.createServer(app); // Create HTTP server for Socket.io
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/analytics', analyticsRoutes);

// --- Socket.io Setup & Connection Handling ---
const io = new Server(server, {
    cors: {
        origin: '*', // Restrict in production
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log('A client connected with ID:', socket.id);
    interviewSocketHandler(socket, io);
});


// --- Database Connection and Server Start ---

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Connected to MongoDB Atlas Successfully!');
    // Using the corrected server instance for Socket.io
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });

// --- Error Handling Middleware  ---
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});