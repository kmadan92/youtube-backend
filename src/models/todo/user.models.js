import moongoose from "moongoose"


const UserSchema = new moongoose.Schema({

    username: {
        type: String,
        required: [true, "Enter username"],
        unique: [true, "Username already exists"]
    },
    password: {
        type: String,
        required: [true, "Enter password"]
    },
    email: {
        type: String,
        required: [true, "Enter email id"],
        unique: [true, "email already exists"]
    }

},{timestamps: true})

export const User = new moongoose.model("User",UserSchema)