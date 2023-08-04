const jwt = require('jsonwebtoken');
const User = require('../models/user');
const HttpError = require('../models/http-error');

const protect = async (req, res, next) => {
    let token;
    try {
        token = req.cookies.jwt;
    } catch (err) {
        const error = new HttpError(
            'Something went wrong'
        );
        return next(error)
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select('-password');
            next()

        } catch (err) {
            const error = new HttpError(
                'Not authorized, invalid token',
                401
            )
            return next(error)
        }

    } else {
        const error = new HttpError(
            'Not authorized, no token.'
        );
        return next(error)
    };

};

exports.protect = protect