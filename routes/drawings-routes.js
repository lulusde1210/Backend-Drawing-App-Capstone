const express = require('express');
const drawingsData = require('../drawings-data');
const HttpError = require('../models/http-error');

const router = express.Router();

router.get('/:id', (req, res, next) => {
    const drawingId = req.params.id;
    const drawing = drawingsData.find((d) => (d.id === drawingId));
    if (!drawing) {
        throw new HttpError('Could not find a drawing for the provided id', 404);
        //use throw do not need to return, because it cancel the function
    }
    res.json({ drawing });
});

router.get('/user/:uid', (req, res, next) => {
    const userId = req.params.uid;
    const drawing = drawingsData.filter((d) => (d.artist === userId));
    // this code is different from max
    if (drawing.length === 0) {
        return next(new HttpError('Could not find a drawing for the provided user id', 404)); // use next will need to return to stop the function
    }
    res.json({ drawing })
})


module.exports = router;