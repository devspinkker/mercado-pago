import jwt from "jsonwebtoken";
import { TOKENPASSWORD } from "../config.js";

export const auth = async (req, res, next) => {
    const authorization = req.get('authorization')
    let token = ""

    if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
        token = authorization.substring(7)
    } else {
        return res.status(401).json({ error: 'token missing or invalid' })
    }
    try {
        const decodetoken = jwt.verify(token, TOKENPASSWORD)

        req.idUser = decodetoken._id
        next()
    } catch (error) {
        console.log(error);
        return res.status(401).json({ error: 'token missing or invalid' })
    }
};