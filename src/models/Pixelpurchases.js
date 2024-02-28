import mongoose from "mongoose";

const PixelPurchases = new mongoose.Schema({
    NameUser: {
        type: String,
        require: true
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
        type: false,
        required: true
    },
    Creationdate: {
        type: Date,
        required: true
    },
})

export default mongoose.model("Users", PixelPurchases, "Users")