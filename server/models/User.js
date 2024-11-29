const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], 
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], 
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
