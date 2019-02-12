const createError = require('http-errors');
const express = require('express');
const path = require('path');
// const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const okta = require('@okta/okta-sdk-nodejs');
const ExpressOIDC = require('@okta/oidc-middleware').ExpressOIDC;

const dashboardRouter = require('./routes/dashboard');
const publicRouter = require('./routes/public');
const usersRouter = require('./routes/users');
const uploadRouter = require('./routes/upload');
const mapRouter = require('./routes/map');
const genMapRouter = require('./routes/gen_map');

// require and configure dotenv
require('dotenv').config();
const app = express();


// oktaClient information
let oktaClient = new okta.Client({
    orgUrl: process.env.ORG_URL,
    token: process.env.OKTA_TOKEN
});

const oidc = new ExpressOIDC({
    issuer: 'https://dev-166130.oktapreview.com/oauth2/default',
    client_id: process.env.OIDC_ID,
    client_secret: process.env.OIDC_SECRET,
    redirect_uri: 'http://localhost:3000/users/callback',
    scope: 'openid profile',
    routes: {
        login: {
            path: '/users/login'
        },
        callback: {
            path: '/users/callback',
            defaultRedirect: '/dashboard'
        }
    }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
// deprecated: app.use(require('body-parser')()); 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
    secret: '123a4s5etx4236s547d6ct',
    resave: true,
    saveUninitialized: false
}));

// enable the routes that ship with the oidc-middleware library
app.use(oidc.router);
app.use((req, res, next) => {
    if (!req.userinfo) {
        return next();
    }

    oktaClient.getUser(req.userinfo.sub)
        .then(user => {
            req.user = user;
            res.locals.user = user;
            next();
        }).catch(err => {
            next(err);
        });
});

app.use('/', publicRouter);
app.use('/dashboard', loginRequired, dashboardRouter);
app.use('/users', usersRouter);
app.use('/upload', uploadRouter);
app.use('/map', mapRouter);
app.use('/gen_map', genMapRouter);

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

// redirect to 'unauthenticated' if user is not logged in
function loginRequired(req, res, next) {
    if (!req.user) {
        res.status(401).render('unauthenticated');
    }
    next();
}

module.exports = app;