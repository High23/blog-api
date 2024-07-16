const jwt = require('jsonwebtoken');

require('dotenv').config();

function verifyTokenHeaderExists(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    const bearerToken = bearerHeader && bearerHeader.split(' ')[1];
    if (bearerToken !== null || bearerToken !== undefined) {
        jwt.verify(bearerToken, process.env.SECRET, (err, user) => {
            // user value that we used in sign
            if (err) return res.status(403).json({message: "You are not authorized"});
            req.token = bearerToken;
            req.user = user.user;
            next();
        });
    } else {
        res.sendStatus(403);
    }
}

function setTokenIfLoggedIn(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    const bearerToken = bearerHeader && bearerHeader.split(' ')[1];
    if (bearerToken !== null || bearerToken !== undefined) {
        jwt.verify(bearerToken, process.env.SECRET, (err, user) => {
            // user value that we used in sign
            if (err) {
                next();
                return;
            }
            req.token = bearerToken;
            req.user = user.user;
            next();
        });
    } else {
        next();
    }
}

module.exports = {verifyTokenHeaderExists, setTokenIfLoggedIn};