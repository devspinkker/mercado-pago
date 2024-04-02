import mongoose from "mongoose";

const PixelPurchasesSchema = new mongoose.Schema({
    NameUser: {
        type: String,
        required: true
    },
    idUser: {
        type: String,
        required: true
    },
    Pixeles: {
        type: Number,
        required: true
    },
    Notification: {
        type: Boolean,
        required: true
    },
    Creationdate: {
        type: Date,
        required: true
    },
    PaymentMethod: {
        type: String,
        required: true
    },
});

export default mongoose.model("PixelPurchases", PixelPurchasesSchema);
