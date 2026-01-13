const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.verifyUser = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).send({ message: "Authorization failed: No token provided" });
    
    // Check if Bearer token
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    
    if (!token) return res.status(401).send({ message: "Authorization failed: Invalid token format" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
        req.user = decoded; // Attach user info to request
        next();
    } catch (err) {
        console.error("Token verification failed:", err.message);
        return res.status(403).send({ message: "Invalid or expired token" });
    }
};

exports.verifyAdmin = (req, res, next) => {
    // Skip auth for OPTIONS (CORS preflight)
    if (req.method === 'OPTIONS') {
        return next();
    }

    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).send({ message: "Authorization failed: No token provided" });
    
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
        if (decoded.role !== 'admin') return res.status(403).send({ message: "Access denied: Admins only" });
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).send({ message: "Invalid token" });
    }
};
