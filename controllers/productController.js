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
   }).catch((error)=>{
     res.json({
        message:'Error creating product',
    
      })
   });
}

export function getProducts(req,res){
   Product.find({}).then((products)=>{
    res.json(products)
   });
   
}
   




