/**
 * Created by dmitriy on 19.07.2015.
 */
var express        = require('express')
var app            = express()
var bodyParser     = require('body-parser')
var mongoose = require('mongoose')
// config files
var db = require('./config/db')
var port = process.env.PORT || 8080

// connect to our mongoDB database

mongoose.connect(db.url)
app.use(bodyParser.json())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public'))
// routes ==================================================
require('./app/routes')(app) // configure our routes
// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port)
// shoutout to the user
console.log('Magic happens on port ' + port)

// expose app
exports = module.exports = app
