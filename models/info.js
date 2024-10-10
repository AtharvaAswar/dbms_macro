const mongoose = require("mongoose");

const infoSchema = new mongoose.Schema({

    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },

    image: {
        data: Buffer,
        contentType: String
    },

    age: {
        type: Number,
        required: true,
        minLength: 15,
        maxLength: 70
    },
    gender: {
        type: String,
        required: true
    },
    blood_grp: {
        type: String,
        required: true
    },

    state: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
});

const Info = mongoose.model("Info", infoSchema);

module.exports = Info;