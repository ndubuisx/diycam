const express = require('express');
const app = express();
const multer = require('multer');
const upload = multer();

const router = express.Router();
const NodeGeocoder = require('node-geocoder');

const options = {
    provider: 'google',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: 'AIzaSyCRVFTxolN2748xOqfcTP0O0C7dtkZjoH4', // for Mapquest, OpenCage, Google Premier
    formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);
const GoogleLocations = require('google-locations');
const locations = new GoogleLocations('AIzaSyCRVFTxolN2748xOqfcTP0O0C7dtkZjoH4');

let lat, long = 0;
let res_output = undefined;
let location_arr = [];
let arr = [];

router.post('/', upload.none(), (req, res, next) => {
    console.log(req.body.place);

    geocoder.geocode(req.body.place)
        .then(function(res) {
            lat = res[0].latitude;
            long = res[0].longitude;
            arr = [lat, long];
            return arr;
        })
        .then(function(arr) {
            locations.search({ keyword: 'waste', location: [arr[0], arr[1]] }, function(err, response) {
                    res_output = response.results;
                    res.render('map', { res_output: res_output });
                })
                .catch(function(err) {
                    console.log(err);
                });
        });
});

module.exports = router;