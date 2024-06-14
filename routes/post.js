const express = require("express")
const router = express.Router();
const postController = require("../controllers/postController");
const commentController = require('../controllers/commentController');

router.get("/create", postController.createGet)

router.post("/create", postController.createPost);

router.post("/:postId/comment/create", commentController.createCommentPost)

router.get("/:postId/edit", postController.editPostGet)

router.post("/:postId/edit", postController.editPost)

router.get("/:postId", postController.getPost)

module.exports = router;