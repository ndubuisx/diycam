const express = require('express');

const router = express.Router();

const uploadRouter = require('./upload');


router.get('/', (req, res) => {
    res.render('index');
});

module.exports = router;