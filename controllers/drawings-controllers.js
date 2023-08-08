const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const Drawing = require('../models/drawing');
const User = require('../models/user');
const Comment = require('../models/comment');
const mongoose = require('mongoose');


const createDrawing = async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return next(new HttpError('Invalid Input', 422))
    };

    const { title, description, artist, imgURL, imgJSON } = req.body;

    const newDrawing = new Drawing({
        title,
        description,
        date: new Date(),
        imgURL,
        imgJSON,
        artist,
        likeCount: 0,
        comments: []
    });

    let user;
    try {
        user = await User.findById(artist)
    } catch (err) {
        const error = new HttpError(
            'Creating drawing failed when finding user by id.'
        );
        return next(error)
    };

    if (!user) {
        const error = new HttpError(
            'Could not find user for provided id',
            404
        );
        return next(error)
    };


    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await newDrawing.save({ session: session });
        user.drawings.push(newDrawing);
        await user.save({ session: session });
        await session.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Creating drawing failed, try again.',
            500
        )
        return next(error)
    };

    res.status(201);
    res.json({ drawing: newDrawing.toObject({ getters: true }) });
};

const getAllDrawings = async (req, res, next) => {
    let drawings;
    try {
        drawings = await Drawing.find().populate('artist');
    } catch (err) {
        const error = new HttpError(
            'Something went wrong with fetching all drawings.'
        );
        return next(error)
    };

    res.status(200);
    res.json({ drawings: drawings.map(drawing => drawing.toObject({ getters: true })) });
};


const getDrawingById = async (req, res, next) => {
    const drawingId = req.params.id;
    let drawing;

    try {
        drawing = await Drawing.findById(drawingId).populate('artist').populate('comments');
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a drawing.',
            500
        );
        return next(error);
    };

    if (!drawing) {
        const error = new HttpError(
            'Could not find a drawing for the provided id',
            404
        );
        return next(error)
    }

    res.json({ drawing: drawing.toObject({ getters: true }) });
};

const getDrawingsByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    let drawings;

    try {
        drawings = await Drawing.find({ artist: userId }).populate('artist');
    } catch (err) {
        const error = new HttpError(
            'Fetching drawings failed, try again.',
            500
        );
        return next(error);
    };

    res.status(200)
    res.json({ drawings: drawings.map(drawing => drawing.toObject({ getters: true })) })
};


const updateDrawing = async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return next(new HttpError('Invalid Input', 422))
    };

    const { title, description, imgURL, imgJSON } = req.body;
    const drawingId = req.params.id;

    let drawing;

    try {
        drawing = await Drawing.findById(drawingId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update a drawing.',
            500
        );
        return next(error);
    };

    if (!drawing) {
        const error = new HttpError('Could not find drawing for this id.', 404);
        return next(error);
    }

    if (drawing.artist._id.toString() !== req.user._id.toString()) {
        const error = new HttpError(
            'Sorry, you are not allowed to delete this drawing.',
            401
        );
        return next(error);
    }

    drawing.title = title;
    drawing.description = description;
    drawing.date = new Date();
    drawing.imgURL = imgURL;
    drawing.imgJSON = imgJSON;

    try {
        await drawing.save();
    } catch (err) {
        const error = new HttpError(
            'Updating drawing failed, try again.',
            500
        )
        return next(error)
    };

    res.status(200);
    res.json({ drawing: drawing.toObject({ getters: true }) })
};

const deleteDrawing = async (req, res, next) => {
    const drawingId = req.params.id;

    let drawing;
    try {
        drawing = await Drawing.findById(drawingId).populate('artist');
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete drawing.',
            500
        );
        return next(error);
    };


    if (!drawing) {
        const error = new HttpError(
            'Could not find a drawing for the provided id',
            404
        );
        return next(error)
    };

    if (drawing.artist._id.toString() !== req.user._id.toString()) {
        const error = new HttpError(
            'Sorry, you are not allowed to delete this drawing.',
            401
        );
        return next(error);
    }

    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await drawing.deleteOne({ session: session });
        drawing.artist.drawings.pull(drawing);
        await drawing.artist.save({ session: session });
        await session.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Deleting drawing from database failed, try again.',
            500
        )
        return next(error)
    };

    res.status(200);
    res.json({ message: 'Successfully deleted the drawing.' })
};


const updateLikeCount = async (req, res, next) => {
    const drawingId = req.params.id;

    let drawing;
    try {
        drawing = await Drawing.findById(drawingId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update like count.',
            500
        );
        return next(error);
    };

    if (!drawing) {
        const error = new HttpError(
            'Could not find a drawing for the provided id',
            404
        );
        return next(error)
    };

    drawing.likeCount += 1

    try {
        await drawing.save();
    } catch (err) {
        const error = new HttpError(
            'Updating drawing failed, try again.',
            500
        )
        return next(error)
    };

    res.status(200)
    res.json({ drawing: drawing.toObject({ getters: true }) })
}





exports.createDrawing = createDrawing;
exports.getAllDrawings = getAllDrawings;
exports.getDrawingById = getDrawingById;
exports.getDrawingsByUserId = getDrawingsByUserId;
exports.updateDrawing = updateDrawing;
exports.deleteDrawing = deleteDrawing;
exports.updateLikeCount = updateLikeCount;

