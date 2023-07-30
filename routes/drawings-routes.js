const express = require('express');
const drawingsControllers = require('../controllers/drawings-controllers');
const router = express.Router();


//  api/drawings
router.post('/', drawingsControllers.createDrawing)

router.get('/', drawingsControllers.getAllDrawings)

router.get('/:id', drawingsControllers.getDrawingById);

router.patch('/:id', drawingsControllers.updateDrawing);

router.delete('/:id', drawingsControllers.deleteDrawing);

router.get('/user/:uid', drawingsControllers.getDrawingsByUserId)



module.exports = router;