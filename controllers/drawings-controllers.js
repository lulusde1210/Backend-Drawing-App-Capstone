const HttpError = require('../models/http-error');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const Drawing = require('../models/drawing');

// let drawingsData = [
//     {
//         id: 'p1',
//         title: 'Three little pigs',
//         description: 'This is description for three little pigs',
//         artist: 'Lulu',
//         date: '01-01-2000',
//         imgURL:
//             'https://cdn.shopify.com/s/files/1/0278/9759/products/Three_Litte_Pigs_Box_Product_Front_-_Shopify_CM_2048x.jpg?v=1574272985',
//         imgJSON: 'three little pigs img JSON'
//     },
//     {
//         id: 'p2',
//         title: 'Corduroy',
//         description: 'This is description for Corduroy',
//         artist: 'Mickey',
//         date: '01-01-2000',
//         imgURL:
//             ' https://prodimage.images-bn.com/pimages/9780140501735_p0_v3_s550x406.jpg',
//         imgJSON: 'Corduroy JSON'

//     },
//     {
//         id: 'p3',
//         title: 'Where the wild things are ',
//         description: 'This is description for where the wild things are',
//         artist: 'Lulu',
//         date: '01-01-2000',
//         imgURL:
//             'https://images-na.ssl-images-amazon.com/images/I/71eczBv1C5L._AC_SL1001_.jpg',
//         imgJSON: 'where the wild things are img JSON'
//     }
// ];

const createDrawing = async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return next(new HttpError('Invalid Input', 422))
    };

    const { title, description, artist, imgURL, imgJSON } = req.body;

    const newDrawing = new Drawing({
        title,
        description,
        artist,
        date: new Date(),
        imgURL,
        imgJSON
    });

    try {
        await newDrawing.save();
    } catch (err) {
        const error = new HttpError(
            'Creating drawing failed, try again.',
            500
        )
        return next(error)
    };

    res.status(201);
    res.json({ drawing: newDrawing });
};

const getAllDrawings = async (req, res, next) => {
    let drawings;
    try {
        drawings = await Drawing.find();
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
        drawing = await Drawing.findById(drawingId);
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
    //getters:true will get rid of the _ in "_id" and just add id as another property in the object
};

const getDrawingsByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    let drawings;

    try {
        drawings = await Drawing.find({ artist: userId });
    } catch (err) {
        const error = new HttpError(
            'Fetching drawings failed, try again.',
            500
        );
        return next(error);
    };

    if (!drawings || drawings.length === 0) {
        const error = new HttpError(
            'Could not find a drawing for the provided user id',
            404);
        return next(error)
    };

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
        drawing = await Drawing.findById(drawingId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete drawing.',
            500
        );
        return next(error);
    };

    try {
        await drawing.deleteOne();
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


exports.createDrawing = createDrawing;
exports.getAllDrawings = getAllDrawings;
exports.getDrawingById = getDrawingById;
exports.getDrawingsByUserId = getDrawingsByUserId;
exports.updateDrawing = updateDrawing;
exports.deleteDrawing = deleteDrawing;
