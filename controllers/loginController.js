const {body, validationResult} = require("express-validator");
const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");
const { alreadyLoggedIn } = require("../public/javascripts/verification");

require('dotenv').config();

exports.loginGet = [
    alreadyLoggedIn,
    asyncHandler(async function (req, res, next) {
        res.sendStatus(200);
    })
]

exports.loginPost = [
    body("username")
    .trim()
    .isLength({min: 1, max: 100})
    .escape(),
    body("password")
    .trim()
    .isLength({min: 1, max: 100})
    .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.json({
              errors: errors.array()
            });
            return
        }

        const user = await User.findOne({username: req.body.username});
        if (!user) {
            return res.status(400).json({loginError: 'Username does not exist.'});
        }
        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) {
            // passwords do not match!
            return res.status(400).json({loginError: "Invalid password"});
        }

        jwt.sign({user}, process.env.SECRET, (err, token) => {
            res.json({
                token
            });
        });
    })
]
