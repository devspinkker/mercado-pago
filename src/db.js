import mongoose from "mongoose";
import { MONGO_DB_URI } from "./config.js";

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_DB_URI);
        console.log("MongoDB is connected");
    } catch (error) {
        console.error(error);
    }
};