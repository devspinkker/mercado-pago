import { COINBASE_WEBHOOK_SECRET, REDIRECT, COINBASE_KEY } from "../config.js";
import Users from "../models/user.js";
import PixelPurchases from "../models/Pixelpurchases.js";
import crypto from "crypto"
import axios from "axios";

const { Client, resources } = require("coinbase-commerce-node")
Client.init(COINBASE_KEY)
const { Charge } = resources
export const crypto = async (req, res) => {
    try {
        const { idUser, amount, currency } = req.body;

        const user = await Users.findById(idUser);

        if (!user) {
            return res.status(401).json({ error: 'token invalid or user not exist' });
        }

        const chargeData = {
            name: "Compra de Pixeles",
            amount,
            local_price: {
                amount: "0.1",
                currency: "USD"
            },
            idUser: idUser,
            metadata: user,
            rediret_url: REDIRECT + "/crypto-payment"
        };
        const charge = await Charge.create(chargeData)
        res.send(charge);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while processing your request' });
    }
}
export const receiveWebhook = async (req, res) => {
    const rawBody = req.rawBody;
    const signature = req.headers["x-cc-webhook-signature"];
    const webhookSecret = COINBASE_WEBHOOK_SECRET;

    let event;

    try {
        event = Webhook.verifyEventBody(rawBody, signature, webhookSecret);
        console.log(event);

        if (event.type === "charge:pending") {
            // received order
            // user paid, but transaction not confirm on blockchain yet
            console.log("pending payment");
        }

        if (event.type === "charge:confirmed") {
            // fulfill order
            // charge confirmed
            console.log("charge confirme");

        }

        if (event.type === "charge:failed") {
            // cancel order
            // charge failed or expired
            console.log("charge failed");
        }

        res.send(`success ${event.id}`);
    } catch (error) {
        console.log(error);
        res.status(400).send("failure");
    }
}