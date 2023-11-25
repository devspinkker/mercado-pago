import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    NameUser: {
        type: String,
        require: true
    },
    Email: {
        type: String,
        required: true
    },
    Pixeles: {
        type: Number,
        required: true
    },
})

export default mongoose.model("Users", UserSchema, "Users")