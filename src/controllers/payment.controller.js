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

      if (user && data.body.transaction_details.net_received_amount) {
        const purchasedUnits = data.body.transaction_details.net_received_amount;
        const cincoPorCiento = purchasedUnits * 0.05;

        // Actualiza los Pixeles del usuario y del userPinkker
        let result = purchasedUnits - cincoPorCiento;
        result = parseFloat(result.toFixed(3));
        user.Pixeles += result
        await user.save();

        // Actualiza el PinkkerProfitPerMonth
        const currentTime = new Date();
        const currentYear = currentTime.getFullYear();
        const currentMonth = (currentTime.getMonth() + 1).toString().padStart(2, "0");
        const currentDay = currentTime.getDate().toString().padStart(2, "0");

        const currentDateKey = `${currentYear}-${currentMonth}-${currentDay}`;

        const filter = {
          timestamp: {
            $gte: new Date(currentYear, currentMonth - 1, 1),
            $lt: new Date(currentYear, currentMonth, 1),
          }
        };
        const initialize = {
          $set: {
            [`days.${currentDateKey}.pixeles`]: 0, // Inicializar el día con 0 pixeles
          },
          $setOnInsert: {
            timestamp: currentTime, // Establece el timestamp al crear un nuevo documento
            total: 0, // Total inicializado en 0
          },
        };

        const increment = {
          $inc: {
            [`days.${currentDateKey}.pixeles`]: cincoPorCiento, // Incrementar pixeles
            total: cincoPorCiento, // Incrementar el total general
          },
        };

        try {
          await PinkkerProfitPerMonth.updateOne(filter, initialize, { upsert: true });

          const PinkkerProfitPerMonthRes = await PinkkerProfitPerMonth.updateOne(filter, increment);
          console.log(PinkkerProfitPerMonthRes);
        } catch (error) {
          console.error("Error al actualizar PinkkerProfitPerMonth:", error);
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