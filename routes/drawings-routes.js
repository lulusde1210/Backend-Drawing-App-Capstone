const express = require('express');
const drawingsControllers = require('../controllers/drawings-controllers');
const router = express.Router();
const { check } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');

//  api/drawings
const drawingInputValidation =
    [
        check('title').not().isEmpty(),
        check('description').not().isEmpty()
    ]

router.post('/', protect, drawingInputValidation, drawingsControllers.createDrawing)

router.get('/', drawingsControllers.getAllDrawings)

router.get('/:id', drawingsControllers.getDrawingById);

router.patch('/:id', protect, drawingInputValidation, drawingsControllers.updateDrawing);

router.delete('/:id', protect, drawingsControllers.deleteDrawing);

router.patch('/:id/like', drawingsControllers.updateLikeCount);

router.get('/user/:uid', drawingsControllers.getDrawingsByUserId)


module.exports = router;