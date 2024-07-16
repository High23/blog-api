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
const Comment = require('../models/comment');

require('dotenv').config();

exports.getAllPosts = asyncHandler(async (req, res, next) => {
    const posts = await Post.find({ published: true })
        .populate('author', 'username')
        .sort({ date: -1 })
        .exec();
    return res.json({ posts });
});

exports.getPost = [
    setTokenIfLoggedIn,
    asyncHandler(async (req, res, next) => {
        const [post, postComments] = await Promise.all([
            Post.findById(req.params.postId)
            .populate('author', 'username')
            .exec(),
            Comment.find({post: req.params.postId})
            .populate('author',  'username').exec()
        ]);
        if (post === null) {
            return res.status(404).json({ message: 'post does not exist' });
        }
        const userId = req.user !== undefined && req.user._id;
        if (post.published) res.json({ post, postComments });
        else if (post.author._id.toString() === userId) res.json({ post, postComments });
        else res.status(403).json({ message: "Forbidden" });
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
        const user = req.user;
        const userId = user._id;
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
        const post = await Post.findById(req.params.postId).exec()
        res.json(post);
    }),
];

exports.editPost = [
    verifyTokenHeaderExists,

    asyncHandler(isBlogAuthor),

    body('title').trim().isLength({ min: 1, max: 75 }).escape(),

    body('text').trim().isLength({ min: 2 }).escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const user = req.user;
        const userId = user._id;
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
        const [post, deletedComments] = await Promise.all([
            Post.findByIdAndDelete(req.params.postId).exec(),
            Comment.deleteMany({post: req.params.postId}).exec()
        ]);
        if (post !== null) res.status(200).json({ message: 'post deleted' });
        else res.status(404).json({ message: 'post does not exist' });
    }),
];

exports.publish = [
    verifyTokenHeaderExists,

    asyncHandler(isBlogAuthor),

    asyncHandler(async (req, res, next) => {
        const post = await Post.findById(req.params.postId).exec();
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
