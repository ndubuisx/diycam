// initialize dependencies
const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// storage location and storage file name format
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/storage');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now());
    }
});
const upload = multer({ storage: storage });

require('dotenv').config();

// google cloud vision dependency
const vision = require('@google-cloud/vision');
// Creates a client
const client = new vision.ImageAnnotatorClient({ keyFilename: 'credentials.json' });
// set initial value of labels to undefined
let labels = undefined;

// AWS s3 authentication
AWS.config.update({
    accessKeyId: process.env.AMAZON_KEY_ID,
    secretAccessKey: process.env.AMAZON_SECRET
});

var s3 = new AWS.S3();


// Performs label detection on the image file
function getLabels(filepath) {
    return client
        .labelDetection(filepath)
        .then(results => {
            labels = results[0].labelAnnotations;
            return labels;
        })
        .catch(err => {
            console.error('ERROR:', err);
        });
}

router.post('/', upload.single('image'), (req, res, next) => {
    // assign uploaded file to file variable
    const file = req.file;
    // handle exception
    if (!file) {
        const error = new Error('Please upload a file');
        error.httpStatusCode = 400;
        return next(error);
    }

    // file path for AWS s3
    let filepath = path.join(__dirname, `../public/storage/${file["filename"]}`);

    // initiliaze AWS s3 parameters
    var params = {
        Bucket: 'unnamed-node',
        Body: fs.createReadStream(filepath),
        Key: "folder/" + Date.now() + "_" + path.basename(filepath)
    };

    s3.upload(params, function(err, data) {
        //handle error
        if (err) {
            console.log("Error", err);
        }

        //success
        if (data) {
            console.log("Uploaded in:", data.Location);
        }

        // call google cloud vision function (getLabels())
        getLabels(data.Location)
            .then((labels) => {
                console.log(labels);
                res.render('index', { labels: labels });
            })
            .catch(function(err) {
                console.log(err);
                res.send("<p>Cannot identify image</p>");
            });
    });

});

module.exports = router;
