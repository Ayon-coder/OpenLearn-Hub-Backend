/**
 * Admin Middleware
 * Protects admin routes with token verification
 */

/**
 * Verify admin token middleware
 */
export function verifyAdminToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Admin authentication required'
            });
        }

        const token = authHeader.split(' ')[1];

        // Decode and verify token (simple base64 - use JWT in production)
        try {
            const decoded = Buffer.from(token, 'base64').toString('utf-8');
            const [username, timestamp] = decoded.split(':');

            const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

            if (username !== ADMIN_USERNAME) {
                throw new Error('Invalid token');
            }

            // Optional: Check token expiry (24 hours)
            const tokenAge = Date.now() - parseInt(timestamp);
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours

            if (tokenAge > maxAge) {
                return res.status(401).json({
                    error: 'Token expired',
                    message: 'Please login again'
                });
            }

            // Attach admin info to request
            req.admin = { username };
            next();
        } catch (decodeError) {
            return res.status(401).json({
                error: 'Invalid token',
                message: 'Admin token is invalid'
            });
        }
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(500).json({
            error: 'Authentication failed',
            message: error.message
        });
    }
}
