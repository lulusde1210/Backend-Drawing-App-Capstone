const express = require('express');
const router = express.Router();
const usersControllers = require('../controllers/users-controllers');
const { check } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');


//  api/users
const userSignupInputValidation =
    [
        check('username').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').not().isEmpty()
    ];

router.post('/signup', userSignupInputValidation, usersControllers.signup)

router.post('/login', usersControllers.login)

router.post('/logout', usersControllers.logout)

router.patch('/user/update', protect, usersControllers.updateUser)

router.get('/', usersControllers.getAllUsers)

router.patch('/follow', protect, usersControllers.addFollowing)

router.patch('/unfollow', protect, usersControllers.removeFollowing)

router.get('/:uid', usersControllers.getUserByUserId)



module.exports = router;