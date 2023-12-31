if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const port = process.env.PORT || 5000;
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const drawingsRoutes = require('./routes/drawings-routes');
const usersRoutes = require('./routes/users-routes');
const commentsRoutes = require('./routes/comments-routes')
const HttpError = require('./models/http-error');

const cors = require('cors')

const app = express();

app.use(bodyParser.json({ limit: '25mb' }));

app.use(cookieParser());

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader(
//         'Access-Control-Allow-Headers',
//         'Origin, X-Requested-With, Content-Type, Accept, Authorization')
//     res.setHeader(
//         'Access-Control-Allow-Methods',
//         'GET, POST, PATCH, DELETE, PUT'
//     );
//     next();
// });

app.use(cors({
    allowedHeaders: "*",
    allowMethods: "*",
    origin: "*"
}))

app.use('/api/drawings', drawingsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/comments', commentsRoutes);

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route', 404);
    throw error;
});

app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occurred!' });
})

mongoose
    .connect(process.env.DB_URL)
    .then(() => {
        app.listen(port);
    })
    .catch(err => {
        console.log(err);
    });
