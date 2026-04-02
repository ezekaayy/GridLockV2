import mongoose, { model, Schema } from "mongoose";

export const CATEGORIES = [
    "digital-art",
    "e-books",
    "templates",
    "music",
    "videos",
    "software",
    "graphics",
    "3d-models",
    "photography",
    "other"
] as const;

export type Category = typeof CATEGORIES[number];

interface IProduct {
    name: string,
    owner: mongoose.Types.ObjectId,
    publishedDate: Date,
    description: string,
    price: number,
    coverImage: string,
    files:  string[],
    category: Category,
    tags: string[],
    editedAt: Date,
    createdAt: Date,
}

const productSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    publishedDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    coverImage: {
        type:String,
        default: "",
    },
    files: {
        type: [String],
        default: [],
    },
    category: {
        type: String,
        enum: CATEGORIES,
        default: "other"
    },
    tags:{
        type: [String],
        default: [],
    },
    editedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
});

productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1 });
productSchema.index({ owner: 1 });
productSchema.index({tags: 1})

const Product = model<IProduct>("Product", productSchema);

export type { IProduct };
export { Product };