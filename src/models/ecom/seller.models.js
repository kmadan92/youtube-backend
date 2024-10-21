import moongoose from "moongoose"


const SellerSchema = new moongoose.Schema({

    name: {
        type: String,
        required: [true, "Enter name"]
    }

},{timestamps: true})

export const Seller = new moongoose.model("Seller",SellerSchema)