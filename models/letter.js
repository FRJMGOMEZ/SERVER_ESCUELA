const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const letterSchema = new Schema({
    name:{type:String,required:true},
    content:[{type: String, require:true }],
    bottom: [{ type: String}],
    user: {type:mongoose.Schema.Types.ObjectId,ref:'User'},
    date: { type: Date, default: new Date() },
});


module.exports = mongoose.model('Letter', letterSchema);