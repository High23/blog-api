const express = require('express');

const router = express.Router();
const signUpController = require('../controllers/sign-upController');

router.get('/', signUpController.createUserGet);

router.post('/', signUpController.createUserPost);

module.exports = router;
