import mercadopage from "mercadopago";
import { MERCADOPAGO_API_KEY } from "../config.js";
import Users from "../models/user.js"

export const createOrder = async (req, res) => {
  const { idUser } = req
  const user = await Users.findById(idUser)
  if (user == null) {
    return res.status(401).json({ error: 'token invalid or user not exist' })
  }
  mercadopage.configure({
    access_token: MERCADOPAGO_API_KEY,
  });
  try {
    const result = await mercadopage.preferences.create({
      items: [
        {
          title: "Pixeles",
          unit_price: 1,
          currency_id: "ARS",
          quantity: 1000,
        },
      ],
      payer: {
        FullName: user.FullName,
        NameUser: user.NameUser,
        email: user.Email,
      },
      notification_url: "https://4030-186-125-141-191.ngrok.io/webhook",
      back_urls: {
        success: "https://localhost:3000/success",
        pending: "https://localhost:3000/success/pending",
        failure: "https://localhost:3000/success/failure",
      },
      external_reference: idUser
      // date_of_expiration: new Date(Date.now() + 3600000).toISOString(),
    });
    console.log();

    res.json(result.body);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const receiveWebhook = async (req, res) => {
  try {
    const payment = req.query
    if (payment.type === "payment") {
      const data = await mercadopage.payment.findById(payment["data.id"]);
      const userId = data.body.external_reference;
      const user = await Users.findById(userId);
      if (user) {
        user.Pixeles += 1000;
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
