import crypto from 'crypto';

// Generate a random JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

export default jwtSecret;
