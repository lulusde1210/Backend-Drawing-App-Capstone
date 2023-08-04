const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
    const token = jwt.sign
        (
            { userId },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 1 * 60 * 60 * 1000
    })

};

module.exports = generateToken;