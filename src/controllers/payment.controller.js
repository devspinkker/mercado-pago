import mercadopago from "mercadopago";
import { MERCADOPAGO_API_KEY, MERCADOPAGO_API_WEBHOOK, REDIRECT, PINKKERMAIL } from "../config.js";
import Users from "../models/user.js";
import PixelPurchases from "../models/Pixelpurchases.js";
import PinkkerProfitPerMonth from "../models/PinkkerProfitPerMonth.js";




export const createOrder = async (req, res) => {
  const { amount } = req.body;
  const { idUser } = req
  const user = await Users.findById(idUser);

  if (user == null) {
    return res.status(401).json({ error: 'token invalid or user not exist' });
  }
  const unitPrice = 1;
  const quantity = amount * 1.25; // Incremento del 25% impu 

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
  const secret = req.headers['x-signature-id'];
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
      const userPinkker = await Users.findOne({ Email: PINKKERMAIL });

      if (user && userPinkker && data.body.transaction_details.net_received_amount) {
        const purchasedUnits = data.body.transaction_details.net_received_amount;
        const cincoPorCiento = purchasedUnits * 0.05;

        // Actualiza los Pixeles del usuario y del userPinkker
        userPinkker.Pixeles += cincoPorCiento;
        user.Pixeles += (purchasedUnits - cincoPorCiento);

        await user.save();
        await userPinkker.save();

        // Actualiza el PinkkerProfitPerMonth
        const currentTime = new Date();
        const currentMonth = currentTime.getMonth() + 1;
        const currentYear = currentTime.getFullYear();
        const currentWeek = getWeekOfMonth(currentTime);

        const filter = {
          timestamp: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth, 1),
          }
        };

        const setOnInsert = {
          timestamp: currentTime,
          weeks: {
            [currentWeek]: {
              impressions: 0,
              clicks: 0,
              pixeles: 0,
              pinkkerPrime: 0,
              communityBuy: 0,
              PaidCommunities: 0,
              CommissionsSuscripcion: 0,
              CommissionsDonation: 0,

            }
          },
          total: 0
        };

        try {
          await PinkkerProfitPerMonth.updateOne(filter, { $setOnInsert: setOnInsert }, { upsert: true });

          const update = {
            $inc: {
              [`weeks.${currentWeek}.pixeles`]: cincoPorCiento,
              total: cincoPorCiento
            }
          };

          const s = await PinkkerProfitPerMonth.updateOne(filter, update);
          console.log(s);
        } catch (error) {
          console.log(error);
        }



        const newPixelPurchase = new PixelPurchases({
          NameUser: user.NameUser,
          idUser: user._id,
          Pixeles: purchasedUnits,
          Notification: false,
          Creationdate: new Date(),
          PaymentMethod: "mercado pago"
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

function getWeekOfMonth(date) {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();
  const dayOfWeek = startOfMonth.getDay();
  const weekNumber = Math.ceil((dayOfMonth + dayOfWeek) / 7);

  return `week_${weekNumber > 4 ? 4 : weekNumber}`;
}