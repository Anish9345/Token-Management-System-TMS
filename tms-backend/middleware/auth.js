const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // 1. Look for the token in the incoming request headers
  const token = req.header('Authorization');

  // 2. If there is no token at all, instantly reject the request
  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No token provided.' });
  }

  try {
    // 3. Tokens usually come as "Bearer <token_string>". This strips out the word "Bearer ".
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;

    // 4. Mathematically verify the token using your massive 128-character secret key
    const verifiedPayload = jwt.verify(cleanToken, process.env.JWT_SECRET);
    
    // 5. Attach the decrypted user data to the request so the next function can use it
    req.userId = verifiedPayload.userId;
    
    // 6. Pass control to the actual API route
    next();
  } catch (error) {
    // If the token is fake, expired, or tampered with, it triggers this error
    res.status(403).json({ message: 'Invalid or Expired Token.' });
  }
};

module.exports = verifyToken;