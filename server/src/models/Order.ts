import mongoose, { model, Schema, Types } from "mongoose";

interface IOrderItem {
    product: Types.ObjectId;
    price: number;
    quantity: number;
}

interface IOrder {
    buyer: Types.ObjectId;
    items: IOrderItem[];
    totalAmount: number;
    status: "pending" | "completed" | "cancelled" | "refunded";
    paymentId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    }
});

const orderSchema = new Schema<IOrder>({
    buyer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "completed", "cancelled", "refunded"],
        default: "pending"
    },
    paymentId: {
        type: String
    }
}, {
    timestamps: true
});

orderSchema.index({ buyer: 1 });
orderSchema.index({ status: 1 });

const Order = model<IOrder>("Order", orderSchema);

export type { IOrder, IOrderItem };
export { Order };
