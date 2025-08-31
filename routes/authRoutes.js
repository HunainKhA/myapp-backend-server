import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
const router = express.Router()
import { client } from '../dbConfig.js';
const myDB = client.db("myEcommerce");
const Users = myDB.collection("users");

router.post('/register', async (req, res) => {
  if (!req.body.firstName || !req.body.lastName || !req.body.phone || !req.body.email || !req.body.password) {
    res.send('please fill out complete form')
  } else {
    let email = req.body.email.toLowerCase()
    const emailFormat = /^[a-zA-Z0-9_.+]+(?<!^[0-9]*)@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    const passwordValidation = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    if (email.match(emailFormat) && req.body.password.match(passwordValidation)) {
      const checkUser = await Users.findOne({ email: email })
      if (checkUser) {
        return res.send('Email already exist')
      } else {
        
        const hashedPassword = await bcrypt.hashSync(req.body.password)
        const otp = Math.floor(100000 + Math.random() * 900000);
        const user = {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: email,
          password: hashedPassword,
          phone: req.body.phone,
          isVerified : false,
          otp
        }
        await Users.insertOne(user);
         await sendEmail(email, "Verify your email", `Your OTP is: ${otp}`);
        const response = await Users.insertOne(user)
        return res.send('user registered successfully')
      }
    } else {
      return res.send("invalid email or password")
    }
  }
})

router.post("/verify-otp", async (req, res) => {
    const  email = req.body;
    const otp = req.body.otp
    const user = await Users.findOne({ email: email.toLowerCase() });
    if (!user)
      { return res.status(404).send({
        status:0,
        message: "User Not Found"
      });
    }
    if (user.otp === otp) {
       const updateUser = await Users.updateOne({ email: email.toLowerCase() }, { $set: { isVerified: true }, $unset: { otp: "" } });
        return res.send({
          status: 1 ,
          message: "Email verified successfully" });
    } else {
        return res.status(400).send("Invalid OTP");
    }
});

router.post('/signIn', async(req,res)=>{
    try {
        if (!req.body.email || !req.body.password) {
            return res.send({
                status: 0 ,
                message: "Email or Password is Required"
            })
        }
        let email = req.body.email.toLowerCase()
        const emailFormat = /^[a-zA-Z0-9_.+]+(?<!^[0-9]*)@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        if (!email.match(emailFormat)) {
            return res.send({
                status : 0,
                message: "Email is Invalid"
            })
        }
        const user = await Users.findOne({email})
        if (!user) {
            return res.status(404).send({
                status: 0 ,
                message:"Email is not Registered"
            })
        }
        const matchPassword = await bcrypt.compareSync(req.body.password , user.password)
        if (!matchPassword) {
             return res.send({
        status : 0,
        message : "Email or Password is incorrect"
      })
        }
        const token = await jwt.sign({
            email , 
            firstName : user.firstName,
        },process.env.SECRET_KEY,{expiresIn: "1h"})
        res.cookie("token",token,{
            httpOnly: true,
            secure: true
        })

        return res.send({
            status: 1,
            message: "Login Successful",
            data :{
                firstName : user.firstName,
                email : user.email,
            }
        })
    } catch (error) {
        return res.send({
      status : 0,
      error : error,
      message : "Something Went Wrong"
        
  })
}
})

export default router;