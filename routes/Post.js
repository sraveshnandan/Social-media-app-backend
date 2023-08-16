
const router = require('express').Router();

const { createPost,
    likeAndUnlikePost,
    deletePost,
    addOrUpdatecommentOnPost,
    deleteComment,
    updatePost,
    getRecommendedPost,
    searchPost,
    getAllPost } = require('../controllers/PostController');

const { isAuthenticated } = require('../middlewares/auth');

router.route('/post/upload').post(isAuthenticated, createPost);


router.route('/posts').get(isAuthenticated, getRecommendedPost);

router.route("/post/:id").delete(isAuthenticated, deletePost).get(isAuthenticated, likeAndUnlikePost).put(isAuthenticated, updatePost);


router.route('/post/comment/:id').post(isAuthenticated, addOrUpdatecommentOnPost).delete(isAuthenticated, deleteComment);

router.route('/posts/search').get(isAuthenticated, searchPost);
router.route('/posts').get(isAuthenticated, getAllPost);



module.exports = router;