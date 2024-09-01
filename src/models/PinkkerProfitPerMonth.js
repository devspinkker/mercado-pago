import mongoose from "mongoose";

const PinkkerProfitPerMonthSchema = new mongoose.Schema({
    NameUser: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    Pixeles: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    total: {
        type: Number,
        required: true,
        default: 0.0
    },
    weeks: {
        type: Map,
        of: {
            impressions: {
                type: Number,
                default: 0
            },
            clicks: {
                type: Number,
                default: 0
            },
            pixels: {
                type: Number,
                default: 0.0
            }
        },
        default: {}
    }
}, {
    collection: "PinkkerProfitPerMonth"
});

export default mongoose.model("PinkkerProfitPerMonth", PinkkerProfitPerMonthSchema, "PinkkerProfitPerMonth");
