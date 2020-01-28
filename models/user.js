const mongoose = require('mongoose');

// User Schema

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    maxScore: {
        type: Number,
        default: 0,
        required: true
    }
});

const User = module.exports =mongoose.model('User', UserSchema);