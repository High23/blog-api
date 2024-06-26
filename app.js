const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');

const indexRouter = require('./routes/index');
const signUpRouter = require('./routes/sign-up');
const loginRouter = require('./routes/login');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');

require('dotenv').config();

const app = express();

app.use(cors());

app.use(compression());
app.use(helmet());
const RateLimit = require('express-rate-limit');
const limiter = RateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 25,
});
app.use(limiter);

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const mongoDB = process.env.MONGO_DB;

main().catch((err) => console.log(err));
async function main() {
    await mongoose.connect(mongoDB);
}
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/sign-up', signUpRouter);
app.use('/login', loginRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({ error: err.message });
});

app.listen(5000, () => console.log('Server started on port 5000.'));
