const router = require('express').Router();

const { requireSignIn } = require('../controllers/authController');
const { hasAuthorization } = require('../controllers/userController');

const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  userById,
  userPhoto,
  addFollowing,
  addFollower,
  removeFollowing,
  removeFollower,
  whoToFollow,
} = require('../controllers/userController');

router.put('/user/follow', requireSignIn, addFollowing, addFollower);
router.put('/user/unfollow', requireSignIn, removeFollowing, removeFollower);
router.get('/users', requireSignIn, getAllUsers);
router.get('/user/:userId', getUser);
router.put('/user/:userId', requireSignIn, hasAuthorization, updateUser);
router.delete('/user/:userId', requireSignIn, hasAuthorization, deleteUser);
router.get('/user/photo/:userId', userPhoto);
router.get('/user/whoToFollow/:userId', requireSignIn, whoToFollow);

router.param('userId', userById);

module.exports = router;
