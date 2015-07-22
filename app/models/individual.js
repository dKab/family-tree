/**
 * Created by dmitriy on 19.07.2015.
 */
var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var schema = new Schema({
    name : {
        first: {type : String, default: ''},
        middle: {type: String, default: ''},
        last: {type: String, default: ''}
    },
    events: {
        birth: Schema.Types.Mixed,
        death: Schema.Types.Mixed
    },
    parents: [Schema.Types.ObjectId]
})
module.exports = mongoose.model('Individual', schema)