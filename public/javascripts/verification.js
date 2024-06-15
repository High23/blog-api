const Post = require("../../models/post");
const Comment = require("../../models/comment");
const jwt = require('jsonwebtoken');
const User = require("../../models/user");

function alreadyLoggedIn(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        res.status(403).json({ message: 'You are already logged in' });
    } else {
        next();
    }
}

async function isBlogAuthorOrIsCommentAuthor(req, res, next) {
    const [blog, comment] = await Promise.all([
        Post.findById(req.params.postId).exec(),
        Comment.findById(req.params.commentId).exec()
    ]);
    const userId = jwt.verify(req.token, process.env.SECRET).user._id;
    if (blog.author.toString() === userId || comment.author.toString() === userId) {
        next();
    } else {
        res.sendStatus(403);
    }
}

async function isBlogAuthor(req, res, next) {
    const blog = await Post.findById(req.params.postId).exec()
    const userId = jwt.verify(req.token, process.env.SECRET).user._id;
    if (blog.author.toString() === userId) {
        next();
    } else {
        res.sendStatus(403);
    }
}

async function isAuthor(req, res, next) {
    const userId = jwt.verify(req.token, process.env.SECRET).user._id;
    const user = User.findById(userId);
    if (user.author) {
        next()
    } else {
        res.sendStatus(403)
    }
}

module.exports =  { alreadyLoggedIn, isBlogAuthorOrIsCommentAuthor, isBlogAuthor, isAuthor }