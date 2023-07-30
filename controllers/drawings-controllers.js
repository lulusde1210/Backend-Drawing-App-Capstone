const HttpError = require('../models/http-error');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator')

let drawingsData = [
    {
        id: 'p1',
        title: 'Three little pigs',
        description: 'This is description for three little pigs',
        artist: 'Lulu',
        date: '01-01-2000',
        imgURL:
            'https://cdn.shopify.com/s/files/1/0278/9759/products/Three_Litte_Pigs_Box_Product_Front_-_Shopify_CM_2048x.jpg?v=1574272985',
        imgJSON: 'three little pigs img JSON'
    },
    {
        id: 'p2',
        title: 'Corduroy',
        description: 'This is description for Corduroy',
        artist: 'Mickey',
        date: '01-01-2000',
        imgURL:
            ' https://prodimage.images-bn.com/pimages/9780140501735_p0_v3_s550x406.jpg',
        imgJSON: 'Corduroy JSON'

    },
    {
        id: 'p3',
        title: 'Where the wild things are ',
        description: 'This is description for where the wild things are',
        artist: 'Lulu',
        date: '01-01-2000',
        imgURL:
            'https://images-na.ssl-images-amazon.com/images/I/71eczBv1C5L._AC_SL1001_.jpg',
        imgJSON: 'where the wild things are img JSON'
    }
];

const createDrawing = (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        throw new HttpError('Invalid Input', 422)
    };

    const { title, description, artist, date, imgURL, imgJSON } = req.body;

    const newDrawing = {
        id: uuidv4(),
        title,
        description,
        artist,
        date,
        imgURL,
        imgJSON
    };

    drawingsData.push(newDrawing);
    res.status(201)
    res.json({ drawing: newDrawing })
};

const getAllDrawings = (req, res, next) => {
    const drawings = drawingsData;

    res.status(200);
    res.json({ drawings });
};

const getDrawingById = (req, res, next) => {
    const drawingId = req.params.id;
    const drawing = drawingsData.find((d) => (d.id === drawingId));
    if (!drawing) {
        throw new HttpError('Could not find a drawing for the provided id', 404);
        //use throw do not need to return, because it cancel the function
    }
    res.json({ drawing });
};

const getDrawingsByUserId = (req, res, next) => {
    const userId = req.params.uid;
    const drawings = drawingsData.filter((d) => (d.artist === userId));
    if (!drawings || drawings.length === 0) {
        return next(new HttpError('Could not find a drawing for the provided user id', 404)); // use next will need to return to stop the function
    }
    res.json({ drawings })
};


const updateDrawing = (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        throw new HttpError('Invalid Input', 422)
    };

    const { title, description, date, imgURL, imgJSON } = req.body;
    const drawingId = req.params.id;
    const updatedDrawing = { ...drawingsData.find((d) => (d.id === drawingId)) };
    const drawingIdx = drawingsData.findIndex((d) => (d.id === drawingId));

    if (!updateDrawing) {
        next(new HttpError('Could not find a drawing for the provided id', 404));
    }

    updatedDrawing.title = title;
    updatedDrawing.description = description;
    updatedDrawing.date = date;
    updatedDrawing.imgURL = imgURL;
    updatedDrawing.imgJSON = imgJSON;

    drawingsData[drawingIdx] = updatedDrawing;

    res.status(200);
    res.json({ drawing: updatedDrawing })
};

const deleteDrawing = (req, res, next) => {
    const drawingId = req.params.id;
    const drawing = drawingsData.find((d) => (d.id === drawingId));
    if (!drawing) {
        throw new HttpError('Could not find a drawing for the provided id', 404);
    };

    drawingsData = drawingsData.filter((d) => (d.id !== drawingId));

    res.status(200);
    res.json({ message: `Successfully Delete Drawing with id ${drawingId}` })
};


exports.createDrawing = createDrawing;
exports.getAllDrawings = getAllDrawings;
exports.getDrawingById = getDrawingById;
exports.getDrawingsByUserId = getDrawingsByUserId;
exports.updateDrawing = updateDrawing;
exports.deleteDrawing = deleteDrawing;
