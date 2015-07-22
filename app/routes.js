/**
 * Created by dmitriy on 19.07.2015.
 */
var Individual = require('./models/individual')

module.exports = function(app) {

    app.get('/foo', function(req, res) {
        res.send('dfdasfdsa')
    })

    app.get('/api/individuals', function(req, res) {
        Individual.find(function(err, individuals) {
            if (err)
                res.send(err)

            res.json(individuals); // return all nerds in JSON format
        })
    })
    // route to handle creating goes here (app.post)
    // route to handle delete goes here (app.delete)

    // frontend routes =========================================================
    // route to handle all angular requests
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html'); // load our public/index.html file
    })

}