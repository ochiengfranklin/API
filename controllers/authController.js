const { json } = require("express");
const { signupSchema, signinSchema } = require("../middlewares/validator");
const User = require('../models/usersModel.js');
const { doHash, doHashValidation, hmacProcess } = require("../utils/hashing.js");
const jwt = require('jsonwebtoken');
const transport = require("../middlewares/sendMail.js");

exports.signup = async (req, res) => {
    const {email, password} = req.body;
    try{
        const {error, value} =signupSchema.validate({email, password})

        if(error) {
            return res.status(401).json({success: false, messsage: error.details[0].message})
        }
        const existingUser = await User.findOne({email});

        if(existingUser) {
            return res.status(401).json({success: false, message: "User already exists"})
        }

        const hashedPassword = await doHash(password, 12);

        const newUser = newUser({
            email,
            password: hashedPassword,
        })
        const result = await newUser.save();
        result.password = undefined;
        res.status(201).json({
            success: true, message: 'Your account has been created successfully',
            result,
        })
    } catch (error) {
        console.log(error);
        
    }
};

exports.signin = async (req, res) => {
    const{email, password} = req.body;

    try{
        const {error, value} = signinSchema.validate( {email, password} )
        if(error) {
            return res.status(401).json({success: false, messsage: error.details[0].message})
        }
        const existingUser = await User.findOne({email}).select('+password')

        if(!existingUser) {
             return res.status(401).json({success: false, message: "User does not exist"})
        }
        const result = await doHashValidation(password, existingUser.password)

        if(!result) {
             return res.status(401).json({success: false, message: "Invalid credentials"})
        }
        const token = jwt.sign({
            userId: existingUser._id,
            email: existingUser.email,
            verified: existingUser.verified,

        }, 
        process.env.TOKEN_SECRET,
        {
            expiresIn: '8h',
        }
    );

    res.cookie = ('Authorization', 'Bearer' + token, {expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production'
    }).json({
        sucess: true,
        token,
        message: 'logged in successfully',
    });
    } catch(error) {
        console.log(error);
        
    }
};
exports.signout = async (req, res) => {
    res
    .clearCookie('Authorization')
    .status(200)
    .json({success: true, message: 'logged out successfully'})
}

exports.sendVerificationCode = async (req, res) => {
    const {email} = req.body;
    try {
        const existingUser = await User.findOne({email})
        
        if(!existingUser) {
             return res
             .status(404)
             .json({success: false, message: "User does not exist"})
        }
        if(existingUser.verified) {
            return res
             .status(400)
             .json({success: false, message: "You are alredy verified"})
        }
        const codeValue = Math.floor(Math.random() * 1000000).toString();
        let info = await transport.sendMail({
            from: NODE_CODE_SENDING_EMAIL_ADRESS,
            to: existingUser.email,
            subject: "Verification code",
            html: '<h1>' + codeValue + '</h1>'
        })

        if(info.accepted[0] === existingUser.email) {
            const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFICATION_CODE_SECRET)
            existingUser.verificationCode = hashedCodeValue;
            existingUser.verificationCodeValidation = Date.now();
            await existingUser.save();
            return res.status(200).json({success: true, message: "Code sent"})
        }
    } catch (error) {
        console.log(error);
        
    }
}