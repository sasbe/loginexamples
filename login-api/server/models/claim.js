var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var claimSchema = mongoose.Schema({
    claimno: { type: String, unique: true, required: true },
    claimdate: { type: Date, required: true },
    claimoffice: { type: String, required: true },
    claimname: { type: String, required: true },
    claimamount: { type: Number, required: true },
    contactnum: { type: Number, required: true },
    dischargedate: { type: Date },
    dischargeamount: { type: Number },
    remarks: { type: String },
    username: { type: String, required: true, lowercase: true }
});

module.exports = mongoose.model("claims", claimSchema);