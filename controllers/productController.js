import Product from '../models/product.js';
import { isAdmin } from './userController.js';

export function createProduct(req, res) {

   if(!isAdmin(req)){
    res.json({
      message:'You are not allowed to add product',
    });
    return

   }
   console.log(req.body);
   const newProductData=req.body;
   new Product(newProductData).
   save()
   .then(()=>{
      res.json({
        message:'Product created successfully',
      })
   }).catch((err)=>{
     res.json({
        message:'Error creating product',
        error:err
    
      })
   },[]);
}

export async function getProducts(req, res) {
    try {
        const products = await Product.find({});
        
        return res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
}
   




