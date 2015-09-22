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
            if (err) {
                res.json({error: err})
            }
            res.json(individuals)
        })
    })
    app.post('/api/add-individual', function(req, res) {
        var brandNewIndividual = new Individual(req.body)
        brandNewIndividual.save(function (err, brandNewIndividual) {
            if (err) {
                console.error(err)
                res.json({error: err})
            }
            res.json({message: 'OK', added: brandNewIndividual})
        })
    })
    app.post('/api/update-individual/:id', function(req, res) {
        var id = req.params.id
        if (!id) {
            var err = 'No id provided'
            console.error(err)
            res.json({error: err})
        }
        Individual.update({_id: id}, req.body, {}, function(err, numAffected) {
            if (numAffected && !err) {
                res.json({message: 'OK', numAffected: numAffected})
            } else if (err) {
                res.json({error: err})
            }
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