const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name']
    },
    avtar: {
        public_id: String,
        url: String
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: [true, 'Email already exists']
    },
    dateOfJoin: {
        type: Date,
        default: Date.now()
    },
    password: {
        type: String,
        reqired: [true, 'Please enter your password'],
        minlenght: [6, 'Password must be at least 6 characters'],
        select: false
    },
    posts: [

        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'

        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'

        }
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,

});

//function to hash the password before saving it in the database
userSchema.pre('save', async function (next) {
    if (this.isModified("password")) {

        this.password = await bcrypt.hash(this.password, 10)

    }
    next()
})
//Function to generate the token for the login
userSchema.methods.generateToken = async () => {
    return token = jwt.sign({ _id: this._id }, process.env.JWT_PRIVET_KEY, {
        expiresIn: "90d"
    });

}
//Fuction to get user id
userSchema.methods.getUserId = async () => {
    return this._id;
}
//Function to compare the password with the password entered by the user
userSchema.methods.matchPassword = async function (password) {

    return await bcrypt.compare(password, this.password);

}
//Function to generate the token for the password reset

userSchema.methods.getResetPasswordToken = () => {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};


const User = new mongoose.model('User', userSchema);
module.exports = User;
