const express = require('express');
const drawingsControllers = require('../controllers/drawings-controllers');
const router = express.Router();
const { check } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');

const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage()
})

//  api/drawings
const drawingInputValidation =
    [
        check('title').not().isEmpty(),
        check('description').not().isEmpty()
    ]

router.post('/', protect, upload.single("imgURL"), drawingInputValidation, drawingsControllers.createDrawing)

router.get('/', drawingsControllers.getAllDrawings)

router.get('/:id', drawingsControllers.getDrawingById);

router.patch('/:id', protect, upload.single("imgURL"), drawingInputValidation, drawingsControllers.updateDrawing);

router.delete('/:id', protect, drawingsControllers.deleteDrawing);

router.patch('/:id/like', drawingsControllers.updateLikeCount);

router.get('/user/:uid', drawingsControllers.getDrawingsByUserId)


module.exports = router;