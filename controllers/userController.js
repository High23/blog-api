const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const { verifyTokenHeaderExists } = require('../public/javascripts/token');
const { checkIfCurrentUser } = require('../public/javascripts/verification');

exports.getCurrentUser = [
    verifyTokenHeaderExists,

    asyncHandler(async (req, res) => {
        const user = await jwt.verify(req.token, process.env.SECRET).user;
        return res.json({
            user: {
                _id: user._id,
                username: user.username,
                author: user.author,
                __v: user.__v,
            },
        });
    }),
];

exports.getUser = [
    asyncHandler(async (req, res) => {
        const user = await User.findById(req.params.userId, {
            password: 0,
        }).exec();
        return res.json({ user });
    }),
];

exports.getUserPosts = [
    asyncHandler(async (req, res) => {
        const userPosts = await Post.find({
            author: req.params.userId,
            published: true,
        }).exec();
        return res.json({ userPosts });
    }),
];

exports.getUserComments = [
    asyncHandler(async (req, res) => {
        const userComments = await Comment.find({
            author: req.params.userId,
        }).exec();
        return res.json({ userComments });
    }),
];

exports.editCurrentUserGet = [
    verifyTokenHeaderExists,
    asyncHandler(checkIfCurrentUser),

    asyncHandler(async (req, res) => {
        const user = await User.findById(req.params.userId, {
            password: 0,
        }).exec();
        if (user === null) {
            res.status.json({
                error: 'User does not exist',
            });
            return;
        }
        res.json({user});
    }),
];

exports.editCurrentUser = [
    verifyTokenHeaderExists,
    asyncHandler(checkIfCurrentUser),

    body('username')
        .trim()
        .isLength({ min: 1, max: 100 })
        .escape(),

    body(
        'password',
        'The password needs a uppercase(A), lowercase(A) character as well as a number(1), a symbol(#) and have a minimum length of 7.',
    )
        .optional({checkFalsy: true})
        .isStrongPassword({
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
        })
        .custom(async (value, { req }) => {
            const oldPassword = jwt.verify(req.token, process.env.SECRET).user
                .password;
            if (await bcrypt.compare(value, oldPassword)) {
                throw new Error(
                    'The new password must be different than the current password.',
                );
            }
        }),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        const author = req.body.author === 'on';
        let user;
        if (req.body.password === '') {
            user = new User({
                username: req.body.username,
                author,
                _id: req.params.userId,
            });
        } else {
            user = new User({
                username: req.body.username,
                password: await bcrypt.hash(req.body.password, 10),
                author,
                _id: req.params.userId,
            });
        }
        if (!errors.isEmpty()) {
            res.json({
                user,
                username: req.body.username,
                errors: errors.array(),
                checked: author,
            });
            return;
        }
        await User.findByIdAndUpdate(req.params.userId, user, {}).exec();
        jwt.sign({ user }, process.env.SECRET, (err, token) => {
            res.json({
                token,
            });
        });
    }),
];
