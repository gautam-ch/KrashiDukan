import mongoose from "mongoose";
import { Schema } from "mongoose";

const orderSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    village: {
        type: String
    },
    items: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            productName: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true,
            },
            category: {
                type: String,
                required: true
            }
        }
    ],
    totalAmount: {
        type: Number
    }
}, {
    timestamps: true
})

export const Order = mongoose.model("Order", orderSchema);
