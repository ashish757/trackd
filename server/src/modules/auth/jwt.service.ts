import * as jwt from 'jsonwebtoken';
import {Injectable} from "@nestjs/common";
import {SignOptions} from "jsonwebtoken";

@Injectable()
export class JwtService {
    sign(payload: object, options?: SignOptions): string {
        return jwt.sign(payload, process.env.JWT_SECRET, options);

    }

    verify(token: string) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            return {payload, error: false};
        } catch (err) {
            return {error: {name: err.name, message: err.message}};
        }
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
