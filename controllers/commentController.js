const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { verifyTokenHeaderExists } = require('../public/javascripts/token');
const Comment = require('../models/comment');
const {
    isBlogAuthorOrIsCommentAuthor,
} = require('../public/javascripts/verification');

require('dotenv').config();

exports.createCommentPost = [
    verifyTokenHeaderExists,

    body('text').trim().isLength({ min: 2, max: 250 }).escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const user = req.user;
        const userId = user._id;
        const comment = new Comment({
            text: req.body.text,
            date: new Date(),
            author: userId,
            post: req.params.postId,
        });
        if (!errors.isEmpty()) {
            res.json({
                errors: errors.array(),
            });
        } else {
            await comment.save();
            res.sendStatus(200);
        }
    }),
];

exports.deleteComment = [
    verifyTokenHeaderExists,
    asyncHandler(isBlogAuthorOrIsCommentAuthor),
    asyncHandler(async (req, res, next) => {
        const comment = await Comment.findByIdAndDelete(
            req.params.commentId,
        ).exec();
        if (comment !== null)
            res.status(200).json({ message: 'comment deleted', comment });
        else res.status(404).json({ message: 'comment does not exist' });
    }),
];
