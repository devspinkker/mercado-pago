import mongoose from "mongoose";

const PinkkerProfitPerMonthSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        required: true
    },
    total: {
        type: Number,
        required: true,
        default: 0.0
    },
    days: {
        type: Map,
        default: {}
    }
});

export default mongoose.model("PinkkerProfitPerMonth", PinkkerProfitPerMonthSchema, "PinkkerProfitPerMonth");
