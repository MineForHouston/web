const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// represents user organizations
var schema = new Schema({
    // is the mobile number valid?
    amountRaised: {
        type: Number,
        default: 0
    },
    workers: {
        type: Number,
        default: 0
    },
    rate: {
        type: Number,
        default: 0
    },
    lastRun: {
        type: Date,
        default: new Date()
    },
});

schema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj._id;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('PlatformStats', schema);
