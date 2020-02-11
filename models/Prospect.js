var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ProspectSchema = new Schema({
    firstName: String,
    lastName: String,
    company: String,
    revenue: String,
    locations: String,
    email: String,
    cash: String,
    phone: String,

});

var Prospect = mongoose.model("Prospect", ProspectSchema);

module.exports = Prospect;