const {body, validationResult} = require("express-validator");
const asyncHandler = require("express-async-handler");
const jwt = require('jsonwebtoken');
const { verifyTokenHeaderExists } = require("../public/javascripts/token");
const Post = require('../models/post');

require('dotenv').config()

exports.getAllPosts = asyncHandler(async function(req, res, next) {
    const posts = await Post.find({published: true}).populate('author', 'username').sort({date: -1}).exec()
    res.json({ posts })
})

exports.getPost = asyncHandler(async function(req, res, next) {
    const post = await Post.findById(req.params.postId).populate('author', 'username').exec()
    res.json({ post })
})

exports.createGet = [ 
    verifyTokenHeaderExists,
    asyncHandler(async function(req, res, next) {
        res.sendStatus(200)
    })
]

exports.createPost = [
    verifyTokenHeaderExists,

    body('title')
    .trim()
    .isLength({min: 1, max: 75})
    .escape(),

    body('text')
    .trim()
    .isLength({min: 2})
    .escape(),

    asyncHandler(async function(req, res, next) {
        const errors = validationResult(req);
        const userId = jwt.verify(req.token, process.env.SECRET).user._id;
        const published = req.body.published === 'on' ? true : false;
        const post = new Post({
            title: req.body.title,
            text: req.body.text,
            date: new Date(),
            author: userId,
            published: published,
        });
        if (!errors.isEmpty()) {
            res.json({
              errors: errors.array()
            });
            return
        } else {
            await post.save()
            res.sendStatus(200);
        }
    })
]

exports.editPostGet = [
    verifyTokenHeaderExists,
    asyncHandler( async function(req, res, next) {
        res.sendStatus(200)
    })
]

exports.editPost = [
    verifyTokenHeaderExists,

    body('title')
    .trim()
    .isLength({min: 1, max: 75})
    .escape(),

    body('text')
    .trim()
    .isLength({min: 2})
    .escape(),

    asyncHandler( async function(req, res, next) {
        const errors = validationResult(req);
        const userId = jwt.verify(req.token, process.env.SECRET).user._id;
        const published = req.body.published === 'on' ? true : false;
        const post = new Post({
            title: req.body.title,
            text: req.body.text,
            lastUpdated: new Date(),
            author: userId,
            published: published,
            _id: req.params.postId,
        });
        if (!errors.isEmpty()) {
            res.status(400).json({
                post,
                errors: errors.array()
            });
            return
        } else {
            await Post.findByIdAndUpdate(req.params.postId, post, {})
            res.sendStatus(200);
        }
    })
]

exports.deletePost = [
    verifyTokenHeaderExists,
    asyncHandler( async function(req, res, next) {
        await Post.findByIdAndDelete(req.params.postId);
        res.status(200).json({message: 'post deleted'});
    })
]
