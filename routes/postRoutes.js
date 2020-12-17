const router = require('express').Router();

const {
  getPosts,
  createPost,
  postByUser,
  getPostById,
  deletePost,
  isPoster,
  updatePost,
  postById,
  postByFollowing,
  getPostPhoto,
  likePost,
  addPostToUserLikes,
  unlikePost,
  removePostFromUserLikes,
  getComments,
  createComment,
  // deleteComment,
  getReplies,
  createReply,
  likeComment,
  addCommentToUserLikes,
  unlikeComment,
  removeCommentFromUserLikes,
  likeReply,
  addReplyToUserLikes,
  unlikeReply,
  removeReplyFromUserLikes,
} = require('../controllers/postController');
const { requireSignIn } = require('../controllers/authController');
const { userById } = require('../controllers/userController');
const { createPostValidation, validate } = require('../helpers/validators');

router.get('/', getPosts);
router.post(
  '/post/new/:userId',
  requireSignIn,
  createPost,
  createPostValidation,
  validate
);
router.get('/post/:postId/:userId/comment', requireSignIn, getComments);
router.post('/post/:postId/:userId/comment', requireSignIn, createComment);
// router.put(
//   '/post/:postId/:userId/delete-comment',
//   requireSignIn,
//   deleteComment
// );
router.put('/comment/like', requireSignIn, likeComment, addCommentToUserLikes);
router.put(
  '/comment/unlike',
  requireSignIn,
  unlikeComment,
  removeCommentFromUserLikes
);
router.get('/comment/:commentId/:userId/reply', requireSignIn, getReplies);
router.post('/comment/:commentId/:userId/reply', requireSignIn, createReply);
// router.put(
//   '/comment/:commentId/:userId/delete-reply',
//   requireSignIn,
//   deleteComment
// );
router.put('/reply/like', requireSignIn, likeReply, addReplyToUserLikes);
router.put(
  '/reply/unlike',
  requireSignIn,
  unlikeReply,
  removeReplyFromUserLikes
);
router.get('/post/by/:userId', requireSignIn, postByUser);
router.get('/post/:postId', requireSignIn, getPostById);
router.get('/post/by/following/:userId', requireSignIn, postByFollowing);
router.get('/post/photo/:postId', getPostPhoto);
router.put('/post/:postId', requireSignIn, isPoster, updatePost);
router.delete('/post/:postId', requireSignIn, isPoster, deletePost);
router.put('/post/like/:postId', requireSignIn, likePost, addPostToUserLikes);
router.put(
  '/post/unlike/:postId',
  requireSignIn,
  unlikePost,
  removePostFromUserLikes
);

router.param('userId', userById);
router.param('postId', postById);

module.exports = router;
