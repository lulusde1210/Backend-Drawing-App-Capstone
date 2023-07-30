const HttpError = require('../models/http-error');
const { v4: uuidv4 } = require('uuid');

let usersData = [
    {
        id: 'u1',
        username: 'LuLu',
        email: 'lulu@gmail.com',
        password: '123'
    },
    {
        id: 'u2',
        username: 'Mickey',
        email: 'mickey@gmail.com',
        password: '123'
    },
    {
        id: 'u3',
        username: 'Verra',
        email: 'verra@gmail.com',
        password: '123'
    },
];

const signup = (req, res, next) => {
    const { username, email, password } = req.body;

    const existingUser = usersData.find((u) => (u.email === email));
    if (existingUser) {
        throw new HttpError('Email already exits', 422)
    }

    const newUser = {
        id: uuidv4(),
        username,
        email,
        password
    };

    usersData.push(newUser);
    res.status(201)
    res.json({ user: newUser })
};

const login = (req, res, next) => {
    const { email, password } = req.body;

    const identifiedUser = usersData.find((u) => (u.email === email));

    if (!identifiedUser || identifiedUser.password !== password) {
        throw new HttpError('Could not identify user, either email or password is not correct', 401)
    }
    if (identifiedUser.password === password) {
        res.json({ message: 'Logged in' })
    }
};

const getAllUsers = (req, res, next) => {
    const users = usersData;

    res.status(200);
    res.json({ users })
};

const getUserByUserId = (req, res, next) => {
    const userId = req.params.uid;
    const user = usersData.find((u) => (u.id === userId));
    if (!user) {
        return next(new HttpError('Could not find user for the provided user id', 404));
    }
    res.json({ user })
};



exports.signup = signup;
exports.login = login;
exports.getAllUsers = getAllUsers;
exports.getUserByUserId = getUserByUserId;