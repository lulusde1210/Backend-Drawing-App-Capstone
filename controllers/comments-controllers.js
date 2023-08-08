const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const Drawing = require('../models/drawing');
const Comment = require('../models/comment');
const mongoose = require('mongoose');


const createComment = async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return next(new HttpError('Invalid Input', 422))
    };
    const { body, drawing } = req.body;

    const newComment = new Comment({
        body,
        drawing,
        author: req.user
    });

    let targetDrawing;
    try {
        targetDrawing = await Drawing.findById(drawing)
    } catch (err) {
        const error = new HttpError(
            'Creating comment failed when finding user by id.'
        );
        return next(error)
    };

    if (!targetDrawing) {
        const error = new HttpError(
            'Could not find drawing for provided id',
            404
        );
        return next(error)
    };

    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await newComment.save({ session: session });
        targetDrawing.comments.push(newComment);
        await targetDrawing.save({ session: session });
        await session.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Creating comment failed, try again.',
            500
        )
        return next(error)
    };

    res.status(201);
    res.json({ comment: newComment.toObject({ getters: true }) });
};


const getAllCommentsByDrawingId = async (req, res, next) => {
    const drawingId = req.params.drawingId;
    let comments;

    try {
        comments = await Comment.find({ drawing: drawingId }).populate('author');
    } catch (err) {
        const error = new HttpError(
            'Fetching comments failed, try again.',
            500
        );
        return next(error);
    };

    res.status(200)
    res.json({ comments: comments.map(comment => comment.toObject({ getters: true })) })
};

const deleteComment = async (req, res, next) => {
    const commentId = req.params.id;

    let comment;
    try {
        comment = await Comment.findById(commentId).populate('drawing').populate('author');
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete comment.',
            500
        );
        return next(error);
    };


    if (!comment) {
        const error = new HttpError(
            'Could not find a comment for the provided id',
            404
        );
        return next(error)
    };

    if (comment.author._id.toString() !== req.user._id.toString()) {
        const error = new HttpError(
            'Sorry, you are not allowed to delete this comment.',
            401
        );
        return next(error);
    }

    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await comment.deleteOne({ session: session });
        comment.drawing.comments.pull(comment);
        await comment.drawing.save({ session: session });
        await session.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Deleting comment from database failed, try again.',
            500
        )
        return next(error)
    };

    res.status(200);
    res.json({ message: 'Successfully deleted the comment.' })
};




exports.createComment = createComment;
exports.getAllCommentsByDrawingId = getAllCommentsByDrawingId;
exports.deleteComment = deleteComment;
