import mongoose, {Schema} from "moongoose"

const subscriptionSchema = new Schema(

    {
        subscriber: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        channels: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
         timestamps: true
    }
)

export const Subscription = moongoose.model("Subscription", subscriptionSchema)