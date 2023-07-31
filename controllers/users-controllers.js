const HttpError = require('../models/http-error');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator')
const User = require('../models/user');

// let usersData = [
//     {
//         id: 'u1',
//         username: 'LuLu',
//         email: 'lulu@gmail.com',
//         password: '123'
//     },
//     {
//         id: 'u2',
//         username: 'Mickey',
//         email: 'mickey@gmail.com',
//         password: '123'
//     },
//     {
//         id: 'u3',
//         username: 'Verra',
//         email: 'verra@gmail.com',
//         password: '123'
//     },
// ];

const signup = async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return next(new HttpError('Invalid Input', 422))
    };

    const { username, email, image, password, drawings } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError(
            'Something went wrong with signing up',
            500
        )
        return next(error)
    };

    if (existingUser) {
        const error = new HttpError(
            'Email already exists, please log in.',
            422
        )
        return next(error)
    }

    const newUser = new User({
        username,
        email,
        image,
        password,
        drawings
    });

    try {
        await newUser.save();
    } catch (err) {
        console.log(err)

        const error = new HttpError(
            'Signing up failed, try again.',
            500
        )
        return next(error)
    };

    res.status(201)
    res.json({ user: newUser.toObject({ getters: true }) })
};

const login = async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return next(new HttpError('Invalid Input', 422))
    };

    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError(
            'Something went wrong with logging in',
            500
        )
        return next(error)
    };

    if (!existingUser || existingUser.password !== password) {
        const error = new HttpError(
            'Could not identify user, either email or password is not correct',
            401
        );
        return next(error)
    }

    if (existingUser.password === password) {
        res.json({ message: 'Logged in' })
    }
};

const getAllUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
        //take password property away from the returned user response
    } catch (err) {
        const error = new HttpError(
            'Something went wrong with feching all users',
            500
        )
        return next(error)
    };

    res.status(200);
    res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

const getUserByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    let user;
    try {
        user = await User.findById(userId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong with feching one user',
            500
        )
        return next(error)
    };

    if (!user) {
        const error = new HttpError(
            'Could not find a user for the provided user id',
            404
        );
        return next(error)
    }
    res.status(200);
    res.json({ user: user.toObject({ getters: true }) });
};

exports.signup = signup;
exports.login = login;
exports.getAllUsers = getAllUsers;
exports.getUserByUserId = getUserByUserId;