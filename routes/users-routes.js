const express = require('express');
const router = express.Router();
const usersControllers = require('../controllers/users-controllers');


//  api/users

router.post('/signup', usersControllers.signup)

router.post('/login', usersControllers.login)

router.get('/', usersControllers.getAllUsers)

router.get('/:uid', usersControllers.getUserByUserId)




module.exports = router;