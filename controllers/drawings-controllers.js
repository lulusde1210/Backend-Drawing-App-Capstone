const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const Drawing = require('../models/drawing');
const User = require('../models/user');
const mongoose = require('mongoose');
const crypto = require('crypto')
const { uploadFile, deleteFile } = require('../aws')

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

const createDrawing = async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return next(new HttpError('Invalid Input', 422))
    };

    const fileBuffer = req.file.buffer;
    const mimetype = req.file.mimetype;
    const imageName = generateFileName();

    try {
        await uploadFile(fileBuffer, imageName, mimetype)
    } catch (err) {
        const error = new HttpError(
            'Something went wrong when uploading image to AWS.'
        );
        return next(error)
    }


    const { title, description, artist, imgJSON } = req.body;

    const newDrawing = new Drawing({
        title,
        description,
        date: new Date(),
        imgURL: `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${imageName}`,
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
    let options = {};
    try {
        if (req.query.search) {
            options = {
                ...options,
                title: { $regex: req.query.search.toString(), $options: 'i' }
            }
        }
        drawings = await Drawing.find(options).populate('artist', 'username image')
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

    const fileBuffer = req.file.buffer;
    const mimetype = req.file.mimetype;
    const imageName = generateFileName();

    try {
        await uploadFile(fileBuffer, imageName, mimetype)
    } catch (err) {
        const error = new HttpError(
            'Upload image to AWS failed.',
            500
        );
        return next(error);
    }

    const { title, description, imgJSON } = req.body;
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

    const originalImgUrl = drawing.imgURL

    drawing.title = title;
    drawing.description = description;
    drawing.date = new Date();
    drawing.imgURL = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${imageName}`;
    drawing.imgJSON = imgJSON;

    const parts = originalImgUrl.split("/")
    const originalImageName = parts[parts.length - 1]

    try {
        await deleteFile(originalImageName)
    } catch (err) {
        const error = new HttpError(
            'Deleting original drawing from AWS failed, try again.',
            500
        )
        return next(error)
    }

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

    const parts = drawing.imgURL.split("/")
    const imageName = parts[parts.length - 1]

    try {
        await deleteFile(imageName)
    } catch (err) {
        const error = new HttpError(
            'Deleting drawing from AWS failed, try again.',
            500
        )
        return next(error)
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

