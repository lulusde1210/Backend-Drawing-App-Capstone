const express = require('express');
const router = express.Router();
const usersControllers = require('../controllers/users-controllers');
const { check } = require('express-validator');


//  api/users
const userSignupInputValidation =
    [
        check('username').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').not().isEmpty()
    ];

router.post('/signup', userSignupInputValidation, usersControllers.signup)

router.post('/login', usersControllers.login)

router.get('/', usersControllers.getAllUsers)

router.get('/:uid', usersControllers.getUserByUserId)




module.exports = router;