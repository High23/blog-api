const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.createUserGet = (req, res) => res.json('sign-up-form');

exports.createUserPost = [
    body('username', "The username can not be empty.")
        .trim()
        .isLength({ min: 1, max: 100 })
        .custom(async (value) => {
            const user = await User.findOne({ username: value });
            if (user) {
                throw new Error('Username already in use');
            }
        })
        .escape(),
    body(
        'password',
        'The password needs a uppercase(A), lowercase(A) character as well as a number(1), a symbol(#) and have a minimum length of 7.',
    ).isStrongPassword({
        minLength: 7,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        returnScore: false,
        pointsPerUnique: 1,
        pointsPerRepeat: 0.5,
        pointsForContainingLower: 10,
        pointsForContainingUpper: 10,
        pointsForContainingNumber: 10,
        pointsForContainingSymbol: 10,
    }),
    body('confirmPassword', 'The passwords NEED to match.')
    .custom(
        (value, { req }) => value === req.body.password,
    ),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const author = req.body.author === 'on';
        const user = new User({
            username: req.body.username,
            password: await bcrypt.hash(req.body.password, 10),
            author,
        });

        if (!errors.isEmpty()) {
            res.json({
                username: req.body.username,
                errors: errors.array(),
                checked: author,
            });
            return;
        }
        await user.save();
        res.redirect('/login');
    }),
];
