import mongoose, { IsAny, model, Schema, Types } from "mongoose";

interface IUser {
    _id?: Types.ObjectId,
    name: string,
    email: string,
    phone: string,
    username: string,
    password: string,
    role: string
}

const userSchema = new Schema<IUser>({
    name : {
        type: String,
        trim: true,
        required: true
    },
    email : {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    phone : {
        type: String,
        trim: true,
        required: true,
        unique:true
    },
    username : {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    password : {
        type: String,
        trim: true,
        required: true
    },
    role : {
        type: String,
        enum:["creator","visitor","admin"],
        required: true
    }
})

const User = model<IUser>("User", userSchema);


export type { IUser };
export { User };