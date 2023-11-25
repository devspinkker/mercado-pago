import { Router } from "express";
import { createOrder, receiveWebhook } from "../controllers/payment.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/create-order", auth, createOrder);
router.post("/webhook", receiveWebhook);
router.get("/success", (req, res) => res.send("Success"));

export default router;
