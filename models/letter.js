const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const letterSchema = new Schema({
    name:{type:String,required:true, unique:true},
    content:[{type: String, require:true }],
    bottom: [{ type: String}],
    user: {type:mongoose.Schema.Types.ObjectId,ref:'User'},
    date: { type: Date, default: new Date() },
});
letterSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' })


module.exports = mongoose.model('Letter', letterSchema);