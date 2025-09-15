import jwt from 'jsonwebtoken';
import { User } from '../models/Common/UserModel.js';

/**
 * Middleware to protect routes by verifying a JWT.
 * If the token is valid, it fetches the user from the database
 * and attaches it to the request object as `req.user`.
 */
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Get token from header
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Get user from the token's ID and attach to the request
            // We exclude the password from the user object for security
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // 4. Proceed to the next middleware or controller
            next();
        } catch (error) {
            console.error('Authentication error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

export { protect };
