const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    caption: String,
    image: {
        public_id: String,
        url: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }

    ],
    Comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            comment: {
                type: String,
                required: true
            }

        }
    ]

});
module.exports = mongoose.model('Post', postSchema);