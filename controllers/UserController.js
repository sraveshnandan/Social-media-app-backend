const User = require('../models/User');
const Post = require("../models/Post");
const cloudinary = require('cloudinary');
// const singleUpload = require('../utils/multer');
const getDataUri = require('../utils/dataUri')
const { sendEmail } = require('../utils/sendEmail');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
exports.register = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        let user = await User.findOne({ email })
        if (user) {
            return res.status(406).json({
                success: false,
                message: "User already exists."
            })
        }
        const file = req.files.avtar;



        const mycloud = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'usersAvtars',

        });
        user = await User.create({ name, email, password, avtar: { public_id: mycloud.public_id, url: mycloud.secure_url } })

        const token = await user.generateToken();
        const userId = await user._id.toString();
        await user.save();
        const options = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        res.status(201).cookie("token", token, options).cookie('userId', userId, options).json({
            success: true,
            message: "User created successfully",
            token,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
exports.loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password")
            ;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User does not exist"
            })
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            })
        }
        const token = await user.generateToken();
        const userId = await user._id.toString();
        const options = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        res.status(200).cookie('token', token, options).cookie('userId', userId, options).json({
            success: true,
            message: "Logged in successfully",
            token
        })



    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
exports.logout = async (req, res) => {
    try {

        res.status(200).cookie('token', null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        }).cookie('userid', null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        }).json({
            success: true,
            message: "Logged out successfully"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
exports.followAndUnfollowUser = async (req, res) => {
    try {
        if (req.params.id === req.cookies.userId) {
            return res.status(502).json({
                success: false,
                message: "You can't follow  yourself"
            })
        }
        const userToFollow = await User.findById(req.params.id);

        const loggedInUser = await User.findById(req.cookies.userId);
        if (!userToFollow) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })

        }
        if (loggedInUser.following.includes(userToFollow._id)) {
            const indexfollowing = loggedInUser.following.indexOf(userToFollow._id);
            const indexfollowers = userToFollow.followers.indexOf(loggedInUser._id);

            loggedInUser.following.splice(indexfollowing, 1);
            userToFollow.followers.splice(indexfollowers, 1);

            await loggedInUser.save();
            await userToFollow.save();

            res.status(200).json({
                success: true,
                message: "User Unfollowed",
            });
        } else {
            loggedInUser.following.push(userToFollow._id);
            userToFollow.followers.push(loggedInUser._id);

            await loggedInUser.save();
            await userToFollow.save();

            res.status(200).json({
                success: true,
                message: "User followed",
            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
exports.updatePassword = async (req, res) => { // This function  is also  working 

    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.cookies.userId).select("+password");
        if (!oldPassword && !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide old and new password"
            })

        }
        const isMatch = await user.matchPassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect Old Password"
            })

        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({
            success: false,
            message: "Password Updated successfully."
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
exports.updateProfile = async (req, res) => {      // This is working
    try {

        const { name, email } = req.body;
        let user = await User.findById(req.cookies.userId)
        if (name) {
            user.name = name;

        }
        if (email) {
            user.email = email;

        }
        const file = req.files.avtar;
        if (file) {
            const mycloud = await cloudinary.uploader.upload(file.tempFilePath, { folder: "userAvtar" });
            user.avtar.public_id = mycloud.public_id;
            user.avtar.url = mycloud.secure_url;


        }
        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile Updated Successfully."
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.myProfile = async (req, res) => {         // This is working
    try {
        const user = await User.findById(req.cookies.userId).populate(
            "posts followers following"
        );

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
exports.findUserById = async (req, res) => {     // This is Working
    try {
        const user = await User.findById(req.params.id).populate("posts followers following");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not Found"
            })

        }
        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

exports.getAllUsers = async (req, res) => {     //This is working 
    try {

        const users = await User.find().populate("posts followers following");
        res.status(200).json({
            success: true,
            users: users

        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

exports.myPosts = async (req, res) => {        // Something is to be improved

    try {
        const user = await User.findById(req.cookies.userId)
        const posts = [];

        for (let i = 0; i < user.posts.length; i++) {
            const post = await Post.findById(user.posts[i]).populate(
                "owner"
            );
            posts.push(post);
        }

        res.status(200).json({
            success: true,
            posts: user.posts,
            posts,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

exports.userSearch = async (req, res) => {
    try {
        const { name
        } = req.query;
        const users = await User.find({
            name: { $regex: name, $options: "i" }
        })
        res.status(200).json({
            success: true,
            users
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({
            email: email
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }
        const resetToken = user.getResetPasswordToken();
        await user.save();

        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;

        const message = `You are receiving this email  because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl} \n\n and change your password`;

        try {

            await sendEmail({
                email: user.email,
                subject: 'Password reset',
                message: message
            });
            res.status(200).json({
                success: true,
                message: `Email sent to ${user.email}`
            })
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            res.status(502).json({
                success: false,
                message: error.message
            })
        }
    }


    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken, resetPasswordExpire: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Token is invalid or expired."
            })
        }
        user.password = req.body.password;
        user.resetPasswordExpire = undefined;
        user.resetPasswordToken = undefined;
        await user.save();
        res.status(200).json({
            success: true,
            message: "Password reset successfully."
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

exports.deleteAccount = async (req, res) => {
    try {


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


