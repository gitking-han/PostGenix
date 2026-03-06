const express = require('express');
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const postController = require("../controllers/postController");

router.post('/generate', fetchuser, postController.generatePost);
router.post('/save', fetchuser, postController.savePost);
router.get('/', fetchuser, postController.getPosts);
router.get('/:id', fetchuser, postController.getPostById);
router.delete('/:id', fetchuser, postController.deletePost);
router.put('/:id/visibility', fetchuser, postController.updateVisibility);
router.put('/:id/feature', fetchuser, postController.updateFeatured);
router.put('/:id', fetchuser, postController.updatePost);

module.exports = router;