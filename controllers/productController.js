import Product from "../models/products.js";


export async function getProducts(req, res) {
    const products = await Product.find();
    res.json(products);
}

export function createProduct(req, res) {
    const { name, price, description, category, image } = req.body;
    const newProduct = new Product({ name, price, description, category, image });
    newProduct.save((err, product) => {
        if (err) {
            res.status(500).json({ error: "Error creating product" });
        } else {
            res.status(201).json(product);
        }
    });
}