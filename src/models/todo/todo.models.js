import moongoose from "moongoose"


const ToDoSchema = new moongoose.Schema({

    title:{
        type: String,
        required: [true, "Enter title"],
        unique: [true, "title already exists"]
    },
    sub_todo:[

        {
            type: moongoose.Schema.Types.ObjectId,
            ref:SubToDo
        }
    ],
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

export const ToDo = new moongoose.model("ToDo",ToDoSchema)