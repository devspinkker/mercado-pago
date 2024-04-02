import { Router } from "express";
import { crypto, receiveWebhook } from "../controllers/cryptoPayments";


const router = Router();

router.post("/create-charge-crypto", crypto);
router.post("/webhook-crypto", receiveWebhook);

export default router;
