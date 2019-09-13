const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const debitorSchema = new Schema({
    name:{type:String,required:true},
    nie:{type:String}
});

module.exports = mongoose.model('Debitor', debitorSchema);