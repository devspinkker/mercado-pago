import { config } from "dotenv";
config();

export const MERCADOPAGO_API_KEY = process.env.MERCADOPAGO_API_KEY;
export const MERCADOPAGO_API_WEBHOOK = process.env.MERCADOPAGO_API_WEBHOOK;
export const PORT = process.env.PORT;

export const MONGODB_URI = process.env.MONGODB_URI;
export const TOKENPASSWORD = process.env.TOKENPASSWORD;

export const REDIRECT = process.env.REDIRECT;
