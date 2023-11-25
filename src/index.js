import express from "express";
import morgan from "morgan";
import { PORT } from "./config.js";
import paymentRoutes from "./routes/payment.routes.js";
import { connectDB } from "./db.js"
connectDB()
const app = express();

app.use(morgan("dev"));
app.use(paymentRoutes);

const serverPort = PORT || 3000;
app.listen(serverPort, () => {
    console.log(`server on port ${serverPort}`)
})