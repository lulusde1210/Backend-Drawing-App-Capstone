const express = require('express');
const commentsControllers = require('../controllers/comments-controllers');
const router = express.Router();
const { check } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');

//  api/comments

const commentInputValidation =
    [
        check('body').not().isEmpty(),
    ]

router.post('/', protect, commentInputValidation, commentsControllers.createComment)

router.get('/drawing/:drawingId', commentsControllers.getAllCommentsByDrawingId)

router.delete('/:id', protect, commentsControllers.deleteComment);


module.exports = router;