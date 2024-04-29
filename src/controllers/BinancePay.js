import crypto from 'crypto';
import axios from 'axios';
import Users from '../models/user.js';
import Pixelpurchases from '../models/Pixelpurchases.js';

const baseURL = 'https://bpay.binanceapi.com';
import { KEYBINANCE, APISECRET, REDIRECT } from "../config.js";


function hash_signature(query_string) {
    return crypto.createHmac('sha512', APISECRET).update(query_string).digest('hex');
}

function random_string() {
    return crypto.randomBytes(32).toString('hex').substring(0, 32);
}

function dispatch_request(http_method, path, payload = {}) {
    const timestamp = Date.now()
    const nonce = random_string()
    const payload_to_sign = timestamp + "\n" + nonce + "\n" + JSON.stringify(payload) + "\n"
    const url = baseURL + path
    const signature = hash_signature(payload_to_sign)
    return axios.create({
        baseURL,
        headers: {
            'content-type': 'application/json',
            'BinancePay-Timestamp': timestamp,
            'BinancePay-Nonce': nonce,
            'BinancePay-Certificate-SN': KEYBINANCE,
            'BinancePay-Signature': signature.toUpperCase()
        }
    }).request({
        'method': http_method,
        url,
        data: payload
    })
}

export const cryptoBinancePay = async (req, res) => {
    try {
        const { idUser, amount, currency } = req.body;

        const user = await Users.findById(idUser);

        if (!user) {
            return res.status(401).json({ error: 'token invalid or user not exist' });
        }

        const chargeData = {
            merchantId: 'YOUR_MERCHANT_ID', // Reemplaza por tu ID de comerciante de Binance Pay
            merchantTradeNo: idUser, // Puedes utilizar el ID del usuario como número de transacción
            tradeType: 'WEB',
            totalFee: amount.toString(),
            currency: currency,
            productType: 'Pixeles',
            productName: 'Compra de Pixeles',
            productDetail: 'Compra de pixeles para la plataforma',
            idUser: idUser,
            metadata: user,
            rediret_url: REDIRECT // Reemplaza por tu URL de redirección
        };

        const charge = await dispatch_request('POST', '/binancepay/openapi/order', chargeData);
        console.log(chargeData);
        res.send(charge.data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
};

export const receiveWebhookBinancePay = async (req, res) => {
    const rawBody = req.rawBody;
    const signature = req.headers['binancepay-signature'];
    const webhookSecret = APISECRET;

    let event;

    try {
        event = JSON.parse(rawBody);
        console.log(rawBody);
        if (event.type === 'charge:pending') {
            console.log('pending payment');
        } else if (event.type === 'charge:confirmed') {
            console.log('charge confirmed');
        } else if (event.type === 'charge:failed') {
            console.log('charge failed');
        }

        res.send(`success ${event.id}`);
    } catch (error) {
        console.log(rawBody);
        console.log(error);
        res.status(400).send('failure');
    }
};
