const {body, validationResult} = require("express-validator");
const asyncHandler = require("express-async-handler");
const validatePassword = require("../public/javascripts/passwordValidation");
const User = require("../models/user");
const jwt = require('jsonwebtoken');

require('dotenv').config();

exports.loginPost = [
    body("username")
    .trim()
    .isLength({min: 1, max: 100})
    .escape(),

    validatePassword,

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const user = await User.findOne({username: req.body.username});
        
        jwt.sign({user}, process.env.SECRET, (err, token) => {
            res.json({
                token
            });
        });
    })
]
