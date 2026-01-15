const jwt = require('jsonwebtoken')
require('dotenv').config()

const extractToken = (req) => {
    const authHeader = req.headers['authorization']
    const cookieToken = req.cookies && req.cookies.token

    if (authHeader) {
        return authHeader.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : authHeader
    }

    if (cookieToken) {
        return cookieToken
    }

    return null
}

exports.verifyUser = (req, res, next) => {
    const token = extractToken(req)

    if (!token) {
        return res.status(401).send({ message: 'Authorization failed: No token provided' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN)
        req.user = decoded
        next()
    } catch (err) {
        console.error('Token verification failed:', err.message)
        return res.status(403).send({ message: 'Invalid or expired token' })
    }
}

exports.verifyAdmin = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }

    const token = extractToken(req)

    if (!token) {
        return res.status(401).send({ message: 'Authorization failed: No token provided' })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN)
        if (decoded.role !== 'admin') {
            return res.status(403).send({ message: 'Access denied: Admins only' })
        }
        req.user = decoded
        next()
    } catch (err) {
        return res.status(403).send({ message: 'Invalid token' })
    }
}
