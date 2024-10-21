import moongoose from "moongoose"


const CategorySchema = new moongoose.Schema({

    type: {
        type: String,
        required: [true, "Enter name"]
    }

},{timestamps: true})

export const Category = new moongoose.model("Category",CategorySchema)