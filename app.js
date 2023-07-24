import createError from 'http-errors'
import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'

import initRouter from './routes/init.js'
import usersRouter from './routes/users.js'
import assetsRouter from './routes/assets.js'
import createTransactionRouter from './routes/create_transaction.js'
import deleteTransactionRouter from './routes/delete_transaction.js'

const app = express();

// view engine setup
app.set('views', './views');
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'))

app.use('/init', initRouter);
app.use('/users', usersRouter);
app.use('/assets', assetsRouter);
app.use('/create_transaction', createTransactionRouter);
app.use('/delete_transaction', deleteTransactionRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
