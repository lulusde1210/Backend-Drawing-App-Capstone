const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator')
const User = require('../models/user');
const generateToken = require('../util/generateToken.js');
const mongoose = require('mongoose');

const signup = async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return next(new HttpError('Invalid Input', 422))
    };

    const { username, email, password, image } = req.body;

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
        password,
        image,
        drawings: [],
        following: [],
        followers: []
    });

    try {
        await newUser.save();
    } catch (err) {
        const error = new HttpError(
            'Signing up failed, try again.',
            500
        )
        return next(error)
    };

    generateToken(res, newUser._id)
    res.status(201)
    res.json({
        user:
        {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            image: newUser.image
        }
    })
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

    if (!existingUser) {
        const error = new HttpError(
            "Looks like you haven't sign up yet! Please sign up.",
            401
        );
        return next(error)
    }

    if (existingUser && (await existingUser.matchPassword(password))) {
        generateToken(res, existingUser._id)
        res.status(201)
        res.json({
            user:
            {
                id: existingUser._id,
                username: existingUser.username,
                email: existingUser.email,
                image: existingUser.image
            }
        });
    } else {
        const error = new HttpError(
            'Invalid email or password',
            401
        );
        return next(error)
    }

};

const logout = async (req, res, next) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.status(200);
    res.json({ message: 'User Logged out.' })
}

const getAllUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
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
        user = await User.findById(userId).populate('followers').populate('following');
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

const updateUser = async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return next(new HttpError('Invalid Input', 422))
    };

    const { username, email, password, image } = req.body;

    let user;

    try {
        user = await User.findById(req.user._id);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update a user.',
            500
        );
        return next(error);
    };

    if (!user) {
        const error = new HttpError('Could not find user for this id.', 404);
        return next(error);
    } else {
        user.username = username || user.name;
        user.email = email || user.email;
        user.image = image || user.image;

        if (password) {
            user.password = password
        }
    }

    try {
        await user.save();
    } catch (err) {
        const error = new HttpError(
            'Updating user failed, try again.',
            500
        )
        return next(error)
    };

    res.status(200);
    res.json({
        user:
        {
            id: user._id,
            username: user.username,
            email: user.email,
            image: user.image
        }
    })
};

const addFollowing = async (req, res, next) => {
    const { followId } = req.body;

    if (req.user.id === followId) {
        const error = new HttpError("You can't follow yourself", 404);
        return next(error);
    }

    let user;
    try {
        user = await User.findById(followId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not follow the user.',
            500
        );
        return next(error);
    };

    if (!user) {
        const error = new HttpError('Could not find user for this id.', 404);
        return next(error);
    }

    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        const found = user.followers.some(followId => followId.equals(req.user.id))

        if (!found && req.user.id !== followId) {
            user.followers.push(req.user.id);
        } else {
            const error = new HttpError("You've already followed this artist.", 500)
            return next(error)
        }

        req.user.following.push(user.id)
        await user.save({ session: session });
        await req.user.save({ session: session });
        await session.commitTransaction();
    } catch (err) {
        const error = new HttpError('Following failed, try again.', 500)
        return next(error)
    };

    res.status(200);
    res.json({ message: 'You have succesfully followed the artist.' })

}

const removeFollowing = async (req, res, next) => {
    const { followId } = req.body;

    let user;

    try {
        user = await User.findById(followId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not unfollow the user.',
            500
        );
        return next(error);
    };

    if (!user) {
        const error = new HttpError('Could not find user for this id.', 404);
        return next(error);
    }

    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        user.followers.pull(req.user._id);
        req.user.following.pull(user._id)
        await user.save({ session: session });
        await req.user.save({ session: session });
        await session.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Unfollowing failed, try again.',
            500
        )
        return next(error)
    };

    res.status(200);
    res.json({ message: 'You have succesfully unfollowed the artist.' })
}



exports.signup = signup;
exports.login = login;
exports.getAllUsers = getAllUsers;
exports.getUserByUserId = getUserByUserId;
exports.updateUser = updateUser;
exports.logout = logout;
exports.addFollowing = addFollowing;
exports.removeFollowing = removeFollowing;