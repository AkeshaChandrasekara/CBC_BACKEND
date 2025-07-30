import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        unique: true
    },
    productName: {
        type: String,
        required: true
    },
    altNames:[{
        type: String,
    }],
    images:[{
        type: String,
    }],
    price:{
        type: Number,
        required: true
    },
    lastPrice:{
        type: Number,
        required: true
    },
    stock:{
        type: Number,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    reviews: [{
        email: String,
        rating: Number,
        comment: String,
        date: { type: Date, default: Date.now }
    }],
    rating: {
        type: Number,
        default: 0
    }
})

const Product = mongoose.model('Product', productSchema);
export default Product;