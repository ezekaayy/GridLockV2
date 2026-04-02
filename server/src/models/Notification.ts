import mongoose, { model, Schema, Types } from "mongoose";

type NotificationType = "new_order" | "product_sold" | "payment_received" | "system";

interface INotification {
    recipient: Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    data?: Record<string, any>;
    createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
    recipient: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["new_order", "product_sold", "payment_received", "system"],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    read: {
        type: Boolean,
        default: false
    },
    data: {
        type: Schema.Types.Mixed
    }
}, {
    timestamps: true
});

notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = model<INotification>("Notification", notificationSchema);

export type { INotification, NotificationType };
export { Notification };
