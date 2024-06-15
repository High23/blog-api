const express = require("express")
const router = express.Router();
const postController = require("../controllers/postController");
const commentController = require('../controllers/commentController');

router.get("/create", postController.createGet)

router.post("/create", postController.createPost);

router.post("/:postId/comment/create", commentController.createCommentPost)

router.delete("/:postId/comment/:commentId/delete", commentController.deleteComment)

router.delete("/:postId/delete", postController.deletePost)

router.get("/:postId/edit", postController.editPostGet)

router.put("/:postId/edit", postController.editPost)

router.get("/:postId", postController.getPost)

module.exports = router;