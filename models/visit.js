const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const visitSchema = new Schema({
    date: {type: Date, default:new Date()},
    email: {type:String,required:true}
})

module.exports = mongoose.model('Visit', visitSchema);