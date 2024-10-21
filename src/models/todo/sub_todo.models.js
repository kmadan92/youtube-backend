import moongoose from "moongoose"


const SubToDoSchema = new moongoose.Schema({

    title:{
        type: String,
        required: [true, "Enter title"],
        unique: [true, "title already exists"]
    },
    createdby: {
        type: moongoose.Schema.Types.ObjectId,
        ref:User,
        required: [true, "CreatedBy should be valid"]
    },
    complete: {
        type: Boolean,
        default: false
    }

},{timestamps: true})

export const SubToDo = new moongoose.model("SubToDo", ToDoSchema)