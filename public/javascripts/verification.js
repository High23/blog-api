const Post = require("../../models/post");
const Comment = require("../../models/comment");
const jwt = require('jsonwebtoken')

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

module.exports =  { alreadyLoggedIn, isBlogAuthorOrIsCommentAuthor }