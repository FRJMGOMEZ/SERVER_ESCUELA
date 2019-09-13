const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const incomeSchema = new Schema({
    amount: {type:Number,required:true},
    notLiquidatedAmount: { type: Number, required:true },
    liquidatedAmount: {type:Number,default:0},
    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment'}],
    date: { type: Date, default: new Date() },
    debitor: { type: mongoose.Schema.Types.ObjectId, ref: 'Debitor' },
    description:{type:String}
});


module.exports = mongoose.model('Income', incomeSchema);