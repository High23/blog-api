const express = require('express');

const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getCurrentUser);

router.get('/:userId/edit', userController.editCurrentUserGet);

router.post('/:userId/edit', userController.editCurrentUser);

router.get('/:userId', userController.getUser);

router.get('/:userId/posts', userController.getUserPosts);

router.get('/:userId/comments', userController.getUserComments);

module.exports = router;
