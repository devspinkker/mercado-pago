import mercadopago from "mercadopago";
import { MERCADOPAGO_API_KEY } from "../config.js";
import Users from "../models/user.js";

export const createOrder = async (req, res) => {
  const { idUser, amount } = req.body;
  const user = await Users.findById(idUser);


  if (user == null) {
    return res.status(401).json({ error: 'token invalid or user not exist' });
  }
  const unitPrice = 1;
  const quantity = amount;

  mercadopago.configure({
    access_token: MERCADOPAGO_API_KEY,
  });

  try {
    const result = await mercadopago.preferences.create({
      items: [
        {
          title: "Pixeles",
          unit_price: unitPrice,
          currency_id: "ARS",
          quantity: quantity,
        },
      ],
      payer: {
        FullName: user.FullName,
        NameUser: user.NameUser,
        email: user.Email,
      },
      notification_url: "https://4030-186-125-141-191.ngrok.io/webhook",
      back_urls: {
        success: "https://localh1ost:3000/success",
        pending: "https://local1host:3000/success/pending",
        failure: "https://local1host:3000/success/failure",
      },
      external_reference: idUser,
    });

    res.json(result.body);
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const receiveWebhook = async (req, res) => {
  try {
    const payment = req.query;
    if (payment.type === "payment") {
      const data = await mercadopago.payment.findById(payment["data.id"]);
      const userId = data.body.external_reference;
      const user = await Users.findById(userId);

      if (user) {
        const purchasedUnits = data.body.items[0].quantity;
        user.Pixeles += purchasedUnits;
        await user.save();
      }
    } else {
      return res.status(500).json({ message: "Something goes wrong" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something goes wrong" });
  }
};
