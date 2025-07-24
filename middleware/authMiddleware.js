const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  // 1. Check if the token exists in the header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 2. Get the token from the "Bearer <token>" string
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. THIS IS THE CRITICAL STEP: Attach the user ID to the request object
      // The payload in your token has a 'userId' field.
      req.userId = decoded.userId;

      // 5. Move to the next function (your controller)
      next();

    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };