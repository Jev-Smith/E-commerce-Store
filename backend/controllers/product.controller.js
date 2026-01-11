import Product from '../models/product.model.js';
import { redis } from '../lib/redis.js';

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } 
    catch (error) {
        res.status(500).json({message: 'Could not fetch products'});
    }
}

const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get('featured_products');

        if(featuredProducts){
            return res.status(200).json(JSON.parse(featuredProducts));
        }

        featuredProducts = await Product.find({isFeatured: true}).lean();

        if(!featuredProducts){
            return res.status(400).json({message: 'No featured products found'});
        }

        await redis.set('featured_products', JSON.stringify(featuredProducts));
        res.status(200).json(featuredProducts);
    } 
    catch (error) {
        
    }
}

const createProduct = async (req, res) => {
    try {
        
    } 
    catch (error) {
        
    }
}

export default {
    getAllProducts,
    getFeaturedProducts,
    createProduct
}