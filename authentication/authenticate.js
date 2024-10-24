const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer token

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided, access denied.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
        }
        // Attach user data (from the token) to the request object
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
