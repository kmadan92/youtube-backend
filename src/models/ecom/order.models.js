import moongoose from "moongoose"

const OrderItemSchema = new moongoose.Schema({

    product: {
        type: moongoose.Schema.Types.ObjectId,
        ref: Product,
        required: true
    },
    quantity: {
        type: Number,
        required: [true, "Enter quatity of product"]
    }
})

const OrderSchema = new moongoose.Schema({

    items: {

        type: [OrderItemSchema]
        
    },
    orderPrice: {
        type: Number,
        required: true
    },
    orderedBy: {
        type: moongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    address: {
        type: String,
        requires: true
    },
    orderState: {
        type: String,
        enum: ["ORDERED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"],
        default: "ORDERED"
    }


},{timestamps: true})

export const Order = new moongoose.model("Order",OrderSchema)