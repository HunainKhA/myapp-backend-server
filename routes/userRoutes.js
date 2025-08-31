import express from "express"

import {client} from "../dbConfig.js";

import { ObjectId } from "mongodb";
const router = express.Router();
const myDB = client.db("myEcommerce")
const Products = myDB.collection("Products");


router.post('/users/products', async (req, res) => {
  const product = {
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    createdAt: Date.now()
  }

  const response = await Products.insertOne(product)
  if (response) {
    return res.send("product added successfully")
  }
  else {
    return res.send("something went wrong")
  }
})


router.get('/users/products',async(req,res)=>{
    const allProducts = Products.find()
    const response = await allProducts.toArray()
    console.log(response)
    if (response.length > 0) {
        return res.send(response)
    } else {
        return res.send("No Products found")
    }
})

router.delete('/users/products/:id',async (req,res)=>{
    const producId = newObject(req.params.id)
    const deleteProduct = await Products.deleteOne({_id: producId})
    if (deleteProduct) {
        return res.send("Product Deleted")
    } else {
        return res.send("something went wrong")
    }
})

router.put('users/products/:id',async(req,res)=>{
    const result = await Products.updateOne(
        {_id : new ObjectId(req.params.id)},
        {$set: {title: req.body.title , description: req.body.description}},{}
    )
    if (result) {
        return res.send("product Updated Successfully")
    } else {
        res.send("Kuch to garbar hy Daya")
    }
})

router.get('/users/products/:id', async(req,res)=>{
    const product = await Products.findOne({_id: new ObjectId(req.params.id)})
    if (product) {
        return res.send(product)
    } else {
        return res.send('product not Found')
    }
})
router.post('/users/cart/:productId/:userId', (req, res) => {
  if (cart) {
    res.send('removed cart')
  } else {
    res.send('added to cart')
  }
})

router.get('/users/cart/:userId', (req, res) => {
  res.send('this is user cart')
})

router.post('/users/checkout/:cartId', (req, res) => {
  res.send('order placed succesfully')
})

export default router;