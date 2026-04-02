import mongoose, { model, Schema, Types } from "mongoose";

interface ICartItem {
    product: Types.ObjectId;
    quantity: number;
}

interface ICart {
    user: Types.ObjectId;
    items: ICartItem[];
    createdAt: Date;
    updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    }
});

const cartSchema = new Schema<ICart>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    items: [cartItemSchema]
}, {
    timestamps: true
});

const Cart = model<ICart>("Cart", cartSchema);

export type { ICart, ICartItem };
export { Cart };
