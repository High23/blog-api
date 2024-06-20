const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const {
    verifyTokenHeaderExists,
    setTokenIfLoggedIn,
} = require('../public/javascripts/token');
const Post = require('../models/post');
const {
    isBlogAuthor,
    isAuthor,
} = require('../public/javascripts/verification');

require('dotenv').config();

exports.getAllPosts = asyncHandler(async (req, res, next) => {
    const posts = await Post.find({ published: true })
        .populate('author', 'username')
        .sort({ date: -1 })
        .exec();
    res.json({ posts });
});

exports.getPost = [
    setTokenIfLoggedIn,
    asyncHandler(async (req, res, next) => {
        const post = await Post.findById(req.params.postId)
            .populate('author', 'username')
            .exec();
        if (post === null) {
            return res.status(404).json({ message: 'post does not exist' });
        }
        const userId =
            typeof req.token !== 'undefined' &&
            jwt.verify(req.token, process.env.SECRET).user._id;
        if (post.published) res.json({ post });
        else if (post.author._id.toString() === userId) res.json({ post });
        else res.sendStatus(403);
    }),
];

exports.createGet = [
    verifyTokenHeaderExists,
    asyncHandler(isAuthor),
    asyncHandler(async (req, res, next) => {
        res.sendStatus(200);
    }),
];

exports.createPost = [
    verifyTokenHeaderExists,
    asyncHandler(isAuthor),

    body('title').trim().isLength({ min: 1, max: 75 }).escape(),

    body('text').trim().isLength({ min: 2 }).escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const userId = jwt.verify(req.token, process.env.SECRET).user._id;
        const published = req.body.published === 'on';
        const post = new Post({
            title: req.body.title,
            text: req.body.text,
            date: new Date(),
            author: userId,
            published,
        });
        if (!errors.isEmpty()) {
            res.json({
                errors: errors.array(),
            });
        } else {
            await post.save();
            res.sendStatus(200);
        }
    }),
];

exports.editPostGet = [
    verifyTokenHeaderExists,
    asyncHandler(isBlogAuthor),
    asyncHandler(async (req, res, next) => {
        res.sendStatus(200);
    }),
];

exports.editPost = [
    verifyTokenHeaderExists,

    asyncHandler(isBlogAuthor),

    body('title').trim().isLength({ min: 1, max: 75 }).escape(),

    body('text').trim().isLength({ min: 2 }).escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const userId = jwt.verify(req.token, process.env.SECRET).user._id;
        const published = req.body.published === 'on';
        const post = new Post({
            title: req.body.title,
            text: req.body.text,
            lastUpdated: new Date(),
            author: userId,
            published,
            _id: req.params.postId,
        });
        if (!errors.isEmpty()) {
            res.status(400).json({
                post,
                errors: errors.array(),
            });
        } else {
            await Post.findByIdAndUpdate(req.params.postId, post, {}).exec();
            res.sendStatus(200);
        }
    }),
];

exports.deletePost = [
    verifyTokenHeaderExists,
    asyncHandler(isBlogAuthor),
    asyncHandler(async (req, res, next) => {
        const post = await Post.findByIdAndDelete(req.params.postId).exec();
        if (post !== null) res.status(200).json({ message: 'post deleted' });
        else res.status(404).json({ message: 'post does not exist' });
    }),
];

exports.publish = [
    verifyTokenHeaderExists,

    asyncHandler(isBlogAuthor),

    asyncHandler(async (req, res, next) => {
        const post = await Post.findById(req.params.postId);
        if (post === null)
            return res.status(404).json({ message: 'post does not exist' });
        post.published = true;
        await Post.findByIdAndUpdate(req.params.postId, post, {}).exec();
        res.sendStatus(200);
    }),
];

exports.unpublish = [
    verifyTokenHeaderExists,

    asyncHandler(isBlogAuthor),

    asyncHandler(async (req, res, next) => {
        const post = await Post.findById(req.params.postId);
        if (post === null)
            return res.status(404).json({ message: 'post does not exist' });
        post.published = false;
        await Post.findByIdAndUpdate(req.params.postId, post, {}).exec();
        res.sendStatus(200);
    }),
];
