const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { alreadyLoggedIn } = require('../public/javascripts/verification');

require('dotenv').config();

exports.loginGet = [
    alreadyLoggedIn,
    asyncHandler(async (req, res, next) => {
        res.sendStatus(200);
    }),
];

exports.loginPost = [
    alreadyLoggedIn,
    body('username', 'The username field MUST not be empty')
        .trim()
        .isLength({ min: 1, max: 100 })
        .escape(),
    body(
        'password',
        'The password can not be empty/have a minimum length less than 7.'
    )
        .trim()
        .isLength({ min: 7 })
        .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.json({
                errors: errors.array(),
            });
            return;
        }

        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            res.status(400).json({ loginError: 'Username does not exist.' });
        }
        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) {
            // passwords do not match!
            res.status(400).json({ loginError: 'Invalid password' });
        }

        jwt.sign({ user }, process.env.SECRET, (err, token) => {
            res.json({
                token,
            });
        });
    }),
];
