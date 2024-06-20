const asyncHandler = require("express-async-handler");
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const { verifyTokenHeaderExists } = require("../public/javascripts/token");
const {body, validationResult} = require("express-validator");
const bcrypt = require('bcryptjs');
const { checkIfCurrentUser } = require('../public/javascripts/verification')

exports.getCurrentUser = [ 
    verifyTokenHeaderExists,

    asyncHandler(async function(req, res, next) {
        const user = await jwt.verify(req.token, process.env.SECRET).user;
        return res.json({user: {
            _id: user._id,
            username: user.username,
            author: user.author,
            __v: user.__v
        }})
    })
];

exports.getUser = [
    asyncHandler(async function(req, res, next) {
        const user = await User.findById(req.params.userId, {password: 0}).exec();
        return res.json({user})
    })
];

exports.getUserPosts = [
    asyncHandler(async function(req, res, next) {
        const userPosts = await Post.find({author: req.params.userId, published: true}).exec();
        return res.json({userPosts});
    })
];

exports.getUserComments = [
    asyncHandler(async function(req, res, next) {
        const userComments = await Comment.find({author: req.params.userId}).exec();
        return res.json({userComments})
    })
];

exports.editCurrentUser = [ 
    verifyTokenHeaderExists,
    asyncHandler(checkIfCurrentUser),

    body("username")
    .trim()
    .isLength({min: 1, max: 100})
    .custom(async value => {
        const user = await User.findOne({ username: value }).exec();
        if (user) {
            throw new Error('Username already in use');
        }
    })
    .escape(),

    body("password", "The password needs a uppercase(A), lowercase(A) character as well as a number(1), a symbol(#) and have a minimum length of 7.").optional().isStrongPassword({
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
        const oldPassword = jwt.verify(req.token, process.env.SECRET).user.password;
        if (await bcrypt.compare(value, oldPassword)) {
            throw new Error('The new password must be different than the current password.');
        }
    }),

    asyncHandler(async function(req, res, next) {
        const errors = validationResult(req);
        const author = req.body.author === 'on' ? true : false;
        const user = new User({
            username: req.body.username,
            password: await bcrypt.hash(req.body.password, 10),
            author: author,
            _id: req.params.userId,
        });
        if (!errors.isEmpty()) {
            res.json({
                user: user,
                errors: errors.array(),
                checked: author,
            });
            return;
        };
        await User.findByIdAndUpdate(req.params.userId, user, {}).exec()
        return jwt.sign({user}, process.env.SECRET, (err, token) => {
            res.json({
                token
            });
        })
    })
];