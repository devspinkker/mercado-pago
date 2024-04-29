import express from "express";
import morgan from "morgan";
import { PORT } from "./config.js";
import paymentRoutes from "./routes/payment.routes.js";
import BinancePay from "./routes/paymentsBinance.routes.js";

import { connectDB } from "./db.js"
import cors from "cors";
connectDB()
const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(
    express.json({
        verify: (req, res, buf) => {
            req.rawBody = buf;
        },
    })
);
app.use(paymentRoutes);
app.use(BinancePay);
const serverPort = PORT || 3000;
app.listen(serverPort, () => {
    console.log(`server on port ${serverPort}`)
})