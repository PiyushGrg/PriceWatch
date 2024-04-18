"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "../dbConfig";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import Product from "@/models/productModel";


export async function scrapeAndStoreProduct(productUrl: string) {

    connectDB();
    if(!productUrl){
        return;
    }

    try {
        const scrapedProduct = await scrapeAmazonProduct(productUrl);
        if(!scrapedProduct){
            return;
        }

        let product = scrapedProduct;

        const existingProduct = await Product.findOne({ url: scrapedProduct.productUrl });
    
        if(existingProduct) {
          const updatedPriceHistory: any = [
            ...existingProduct.priceHistory,
            { price: scrapedProduct.currentPrice }
          ]
    
          product = {
            ...scrapedProduct,
            priceHistory: updatedPriceHistory,
            lowestPrice: getLowestPrice(updatedPriceHistory),
            highestPrice: getHighestPrice(updatedPriceHistory),
            averagePrice: getAveragePrice(updatedPriceHistory),
          }
        }
    
        const newProduct = await Product.findOneAndUpdate(
          { url: scrapedProduct.productUrl },
          product,
          { upsert: true, new: true }
        );
    
        revalidatePath(`/products/${newProduct._id}`);
        
    } catch (error:any) {
        throw new Error(`Failed to create/update product: ${error.message}`)
    }
}


export async function getProductById(productId: string) {
  try {
    connectDB();

    const product = await Product.findOne({ _id: productId });

    if(!product) return null;

    return product;
  } catch (error) {
    console.log(error);
  }
}


export async function getAllProducts() {
  try {
    connectDB();

    const products = await Product.find().sort({ createdAt: -1 });

    return products;
  } catch (error) {
    console.log(error);
  }
}