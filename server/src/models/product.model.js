const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    form_data: {
        type: mongoose.Schema.Types.Mixed
    },
    images: [
        {
            url: String,
            filename: String,
        },
    ],
    price: {
        type: Number
    },
    location: {
        lat: Number,
        lng: Number,
        place: String
    }
}, { timestamps: true });

// Add Indexes
productSchema.index({ category: 1 });
productSchema.index({ user: 1 });
productSchema.index({ price: 1 });
productSchema.index({ "location.place": 1 });
productSchema.index({ "$**": "text" }); // Wildcard Text search index

const Product = mongoose.model('Product', productSchema);
module.exports = Product;