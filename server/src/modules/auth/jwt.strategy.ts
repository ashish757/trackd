import * as jwt from 'jsonwebtoken';

export const getJWTToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '3min'});
}

export const verifyJWTToken = (token) => {
    // verify token
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET) as {email: string};
        console.log('Token is valid. Payload:', payload);
        return payload;
    } catch (err) {
        console.error('Token invalid or expired:', err.message);
        return false;
    }
}




// GUARD middleware example
// import * as jwt from 'jsonwebtoken';
//
// function jwtMiddleware(req, res, next) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) return res.status(401).send('No token');
//
//     const token = authHeader.split(' ')[1];
//     try {
//         const payload = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = payload;
//         next();
//     } catch (err) {
//         return res.status(401).send('Invalid token');
//     }
// }
