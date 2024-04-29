import { config } from "dotenv";
config();

export const MERCADOPAGO_API_KEY = process.env.MERCADOPAGO_API_KEY;
export const MERCADOPAGO_API_WEBHOOK = process.env.MERCADOPAGO_API_WEBHOOK;
export const PORT = process.env.PORT;

export const MONGODB_URI = process.env.MONGODB_URI;
export const TOKENPASSWORD = process.env.TOKENPASSWORD;

export const REDIRECT = process.env.REDIRECT;

export const COINBASE_KEY = process.env.COINBASE_KEY;
export const COINBASE_WEBHOOK_SECRET = process.env.COINBASE_WEBHOOK_SECRET;


export const KEYBINANCE = process.env.KEYBINANCE;
export const APISECRET = process.env.APISECRETBINANCE;
