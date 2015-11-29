/**
 * Created by dmitriy on 19.07.2015.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
    name : {
        first: {type : String, required: true, default: ''},
        middle: {type: String, default: ''},
        last: {type: String, default: ''}
    },
    gender: {
        type: String, required: true, enum: ['male', 'female']
    },
    events: {
        birth: Schema.Types.Mixed,
        death: Schema.Types.Mixed
    },
    parents: [Schema.Types.ObjectId],
    partners: [Schema.Types.ObjectId],
    generation: {type: Number, required: true},
    children: [Schema.Types.ObjectId] //fuck normalization! I need this
}, { collection : 'individuals' });
module.exports = mongoose.model('Individual', schema);