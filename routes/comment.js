const express = require("express")
const router = express.Router();
const commentController = require('../controllers/commentController');

router.delete("/:commentId/delete", commentController.deleteComment)

module.exports = router;