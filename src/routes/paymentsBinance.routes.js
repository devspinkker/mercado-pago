import { Router } from "express";


import { cryptoBinancePay, receiveWebhookBinancePay } from "../controllers/BinancePay.js";


const router = Router();

router.post("/createChargeBinancePay", cryptoBinancePay);
router.post("/webhookBinancePay", receiveWebhookBinancePay);

export default router;
