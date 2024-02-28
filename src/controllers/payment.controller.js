import mercadopago from "mercadopago";
import { MERCADOPAGO_API_KEY, MERCADOPAGO_API_WEBHOOK, REDIRECT } from "../config.js";
import Users from "../models/user.js";
import PixelPurchases from "../models/Pixelpurchases.js";



export const createOrder = async (req, res) => {
  const { idUser, amount } = req.body;
  const user = await Users.findById(idUser);

  console.log(req.body);
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
      notification_url: `${REDIRECT}/3006/webhook`,
      back_urls: {
        success: `${REDIRECT}`,
        failure: `${REDIRECT}`,
      },
      external_reference: idUser,
    });

    res.json(result.body);
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

export const receiveWebhook = async (req, res) => {
  const secret = req.headers.get("x-signature-id")
  if (secret !== MERCADOPAGO_API_WEBHOOK) {
    return res.status(401).json({
      message: "x-signature-id"
    });
  }
  try {
    const payment = req.query;
    if (payment.type === "payment") {
      const data = await mercadopago.payment.findById(payment["data.id"]);
      const userId = data.body.external_reference;
      const user = await Users.findById(userId);

      if (user && data.body.transaction_details.net_received_amount) {
        const purchasedUnits = data.body.transaction_details.net_received_amount;
        user.Pixeles += purchasedUnits;
        await user.save();

        const newPixelPurchase = new PixelPurchases({
          NameUser: user.NameUser,
          idUser: user._id,
          Pixeles: purchasedUnits,
          Notification: false,
          Creationdate: new Date(),
        });

        try {
          await newPixelPurchase.save();
          return res.status(202).json({
            message: "payment made"
          });
        } catch (error) {
          console.error("Error al crear PixelPurchases:", error);
        }
      }
    } else {
      return res.status(500).json({ message: "Something goes wrong" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Something goes wrong" });
  }
};

