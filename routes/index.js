const express = require('express');
const { body, validationResult } = require('express-validator');
const expressAsyncHandler = require('express-async-handler');
const router = express.Router();

router.get('/', expressAsyncHandler( async function(req, res, next) {
    res.json('Route not done')
}));

module.exports = router;