const Post = require("../../models/post");
const Comment = require("../../models/comment");
const jwt = require('jsonwebtoken');
const User = require("../../models/user");

function alreadyLoggedIn(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    const bearerToken = bearerHeader && bearerHeader.split(' ')[1];
    if (bearerToken !== null || bearerToken !== undefined) {
        jwt.verify(bearerToken, process.env.SECRET, (err, user) => {
            // user value that we used in sign
            if (err) {
                next();
                return;
            }
            res.status(403).json({ message: 'You are already logged in' });
        });
    } else {
        next();
    }
}

async function isBlogAuthorOrIsCommentAuthor(req, res, next) {
    const [blog, comment] = await Promise.all([
        Post.findById(req.params.postId).exec(),
        Comment.findById(req.params.commentId).exec()
    ]);
    const authData = jwt.verify(req.token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return 'not valid';
        }
        return decoded;
    });
    const userId = authData !== 'not valid' ? authData.user._id : null;
    if (blog.author.toString() === userId || comment.author.toString() === userId) {
        next();
    } else {
        res.sendStatus(403);
    }
}

async function isBlogAuthor(req, res, next) {
    const blog = await Post.findById(req.params.postId).exec();
    if (blog === null) {
        res.status(404).json({ message: 'post does not exist' });
        return;
    } 
    const authData = jwt.verify(req.token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return 'not valid';
        }
        return decoded;
    });
    const userId = authData !== 'not valid' ? authData.user._id : null;
    if (blog.author.toString() === userId) {
        next();
    } else {
        res.sendStatus(403);
    }
}

async function isAuthor(req, res, next) {
    const authData = jwt.verify(req.token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return 'not valid';
        }
        return decoded;
    });
    const userId = authData.user._id;
    const user = await User.findById(userId);
    if (user.author) {
        next();
    } else {
        res.status(403).json({message: 'You are not an author'})
    }
}

async function checkIfCurrentUser(req, res, next) {
    const authData = jwt.verify(req.token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return 'not valid';
        }
        return decoded;
    });
    const userId = authData !== 'not valid' ? authData.user._id : null;
    if (userId === req.params.userId) {
        next();
    } else {
        res.sendStatus(403);
    }
}

module.exports =  { alreadyLoggedIn, isBlogAuthorOrIsCommentAuthor, isBlogAuthor, isAuthor, checkIfCurrentUser };