const User = require('../models/userModel')
const bcrypt = require('bcryptjs')

exports.signUp = async(req,res,next) => {
    const {username ,password} = req.body
    try{
        const hashPassword = await bcrypt.hash(password ,12)
        const user = await User.findOne({username : req.body.username})
        if(user){
            throw new Error("this User already exists!")
        }
        const newUser = await User.create({
            username,
            password:hashPassword
        })
        req.session.user = newUser
        res.status(201).json({
            status:"success",
            data:{
                newUser
            }
        })
    }catch(err){
        res.status(400).json({
            status: "fail",
            ERROR : {
                err
            }
        })
    }
}

exports.login = async(req,res,next) => {
    const {username ,password} = req.body
    try{
        const user = await User.findOne({username})
        if(!user){
            throw new Error("this User already exists!")
        }

        const isCorrect = await bcrypt.compare(password ,user.password)
        if(!isCorrect){
            throw new Error("Password is incorrect")
        }
        req.session.user = user
        res.status(201).json({
            status:"success",
            data:{
                user
            }
        })
    }catch(error){
        res.status(400).json({
            status: "fail",
            ERROR : error.message
        })
    }
}