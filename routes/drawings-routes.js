const express = require('express');
const drawingsControllers = require('../controllers/drawings-controllers');
const router = express.Router();
const { check } = require('express-validator');

//  api/drawings
const drawingInputValidation =
    [
        check('title').not().isEmpty(),
        check('description').not().isEmpty()
    ]

router.post('/', drawingInputValidation, drawingsControllers.createDrawing)

router.get('/', drawingsControllers.getAllDrawings)

router.get('/:id', drawingsControllers.getDrawingById);

router.patch('/:id', drawingInputValidation, drawingsControllers.updateDrawing);

router.delete('/:id', drawingsControllers.deleteDrawing);

router.get('/user/:uid', drawingsControllers.getDrawingsByUserId)



module.exports = router;