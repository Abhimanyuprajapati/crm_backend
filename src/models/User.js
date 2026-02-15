import mongoose  from "mongoose";

const userSchema = new mongoose.Schema(
    {
    userName: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 8, },
    avtar: { type: String, default: "../assets/avtar.png" },
    },
    {
        timestamps: true
    }
)

const User = mongoose.model("User", userSchema);

export default User;
