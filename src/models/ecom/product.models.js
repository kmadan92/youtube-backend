import moongoose from "moongoose"


const ProductSchema = new moongoose.Schema({

    name: {
        type: String,
        required: [true, "Enter name"],
        unique: [true, "ProductName already exists"]
    },
    price: {
        type: Number,
        required: [true, "Enter price"]
    },
    productImage: {
        type: String
    },
    stock: {
        type: Number,
        required: [true, "Enter Stock Count"]
    },
    category: {
        type: moongoose.Schema.Types.ObjectId,
        ref: Category,
        required: true
    },
    seller:{
        type: moongoose.Schema.Types.ObjectId,
        ref: Seller,
        required: true
    }

},{timestamps: true})

export const Product = new moongoose.model("Product",ProductSchema)