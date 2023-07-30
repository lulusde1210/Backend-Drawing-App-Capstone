const express = require('express');
const bodyParser = require('body-parser');
const drawingsRoutes = require('./routes/drawings-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

//middleware to parse the req body to regular js data(it has to be before the routes middleware)
app.use(bodyParser.json())

app.use('/api/drawings', drawingsRoutes);
app.use('/api/users', usersRoutes);

//unsupport routes error handling middleware which will only reach if some req above didn't get a response back.
app.use((req, res, next) => {
    const error = new HttpError('Could not find this route', 404);
    throw error;
});

//express error handler middleware function
app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occurred!' });
})

app.listen(5000);