const router = require('express').Router();
const singleUpload = require('../utils/multer');
const {

    register,
    loginUser,
    logout,
    updatePassword,
    followAndUnfollowUser,
    updateProfile,
    myProfile,
    findUserById,
    getAllUsers,
    myPosts,
    userSearch,
    forgotPassword,
    resetPassword } = require('../controllers/UserController');

const { isAuthenticated } = require('../middlewares/auth');

router.route('/user/register').post(register);

router.route('/user/login').post(loginUser);

router.route('/user/updatePassword').put(isAuthenticated, updatePassword);

router.route('/user/updateProfile').put(isAuthenticated, updateProfile);

router.route('/user/logout').get(isAuthenticated, logout);

router.route('/user/me').get(isAuthenticated, myProfile);

router.route('/user/myPost').get(isAuthenticated, myPosts);

router.route('/user/:id').get(isAuthenticated, followAndUnfollowUser);

router.route('/user/find/:id').get(isAuthenticated, findUserById);

router.route('/users').get(isAuthenticated, getAllUsers);

router.route('/users/search').get(isAuthenticated, userSearch);

router.route('/forgot/password').post(forgotPassword);

router.route('/password/reset/:token').put(resetPassword);

module.exports = router;