const { json } = require('express');
const Post = require('../models/Post');
const cloudinary = require('cloudinary');
const User = require('../models/User');
exports.createPost = async (req, res) => {
    try {
        const { userId } = req.cookies;
        const file = req.files.image;
        console.log(file)
        const mycloud = await cloudinary.uploader.upload(file.tempFilePath, { folder: "PostImages" });
        console.log(mycloud)
        const newPostData = {
            caption: req.body.caption,
            image: {
                public_id: mycloud.public_id,
                url: mycloud.secure_url
            },
            owner: req.cookies.userId,

        }
        const post = await Post.create(newPostData);

        const user = await User.findById(userId);

        user.posts.unshift(post._id);

        await user.save();
        res.status(201).json({
            success: true,
            message: "Post created",
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })


    }
}

exports.deletePost = async (req, res) => {
    try {
        const { userId } = req.cookies;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }
        if (post.owner.toString() !== userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        await post.deleteOne({ _id: req.params.id })

        const user = await User.findById(userId);

        const index = user.posts.indexOf(req.params.id);
        user.posts.splice(index, 1);

        await user.save();

        res.status(200).json({
            success: true,
            message: "Post deleted",
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })

    }
};

exports.likeAndUnlikePost = async (req, res) => {          //Working controller
    try {
        const { userId } = req.cookies;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        if (post.likes.includes(userId)) {
            const index = post.likes.indexOf(userId);

            post.likes.splice(index, 1);

            await post.save();

            return res.status(200).json({
                success: true,
                message: "Post Unliked",
            });
        } else {
            post.likes.push(userId);

            await post.save();

            return res.status(200).json({
                success: true,
                message: "Post Liked",
            });
        }
    } catch (error) {

    }
};

exports.addOrUpdatecommentOnPost = async (req, res) => {         //Working controller 
    try {
        const postId = req.params.id;
        const newComment = {
            user: req.cookies.userId,
            comment: req.body.comment
        }
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not Found"
            })
        }
        let CommentIndex = -1;
        // Checking if user already commented on the post
        post.Comments.forEach((items, index) => {
            if (items.user.toString() === req.cookies.userId.toString()) {
                CommentIndex = index;
            }
        })

        //If user is already commented on the post then simply updateing the previous comment by new one.
        if (CommentIndex !== -1) {
            post.Comments[CommentIndex
            ].comment = req.body.comment;
            await post.save();
            return res.status(200).json({
                success: true,
                message: "Comment Updated."
            })
        } else {
            post.Comments.push(newComment)
        }
        await post.save();
        res.status(200).json({
            success: true,
            message: "Comment Added."
        })
    } catch (error) {
        res.status(502).json({
            success: false,
            message: error.message
        })
    }
};

exports.deleteComment = async (req, res) => {         //Working controller 
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not Found."
            })
        }
        // Checking if the post is created by logged in user or not if it is created by logged in user the he can delete all comments by just providing comment id, otherwise only one comment which  belongs to logged in user is being deleted.

        if (post.owner.toString() === req.cookies.userId.toString()) {
            if (req.body.commentId === undefined) {
                return res.status(409).json({
                    success: false,
                    message: "Comment Id is required."
                })
            }
            post.Comments.forEach((item, index) => {
                if (item._id.toString() === req.body.commentId) {
                    return post.Comments.splice(index, 1);
                }
            })
            await post.save();
            res.status(200).json({
                success: true,
                message: "Selected comment is deleted."
            })
        }  // If logged in user is not the owner of the post 
        else {
            post.Comments.forEach((item, index) => {
                if (item.user.toString() === req.cookies.userId.toString()) {
                    return post.Comments.splice(index, 1);
                }
            });
            await post.save();
            res.status(200).json({
                success: true,
                message: "Your comment has been deleted."
            })

        }



    } catch (error) {
        res.status(502).json({
            success: false,
            message: error.message
        })
    }
};

exports.updatePost = async (req, res) => {         //Working controller 
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            })
        }
        // Checking if Logged in user is the owner of the post 
        if (post.owner.toString() === req.cookies.userId) {
            post.caption = req.body.caption;
            await post.save();
            return res.status(200).json({
                success: true,
                message: "Post Updated."
            })
        }
        else {
            return res.status(409).json({
                success: false,
                message: "Unauthorized Access , you can't update this post."
            })
        }
    } catch (error) {
        res.status(502).json({
            success: false,
            message: error.message
        })
    }
}
exports.getRecommendedPost = async (req, res) => {         //Working controller 
    try {
        const loggedInUser = await User.findById(req.cookies.userId);
        const data = loggedInUser.following;
        const post = await Post.find({
            owner: {
                $in: loggedInUser.following,
            },
        });
        if (loggedInUser.following === []) {
            const data = await Post.find();
            return res.status(200).json({
                success: true,
                posts: data
            })
        }
        res.status(200).json({
            success: true,
            data: data,
            posts: post
        });

    } catch (error) {
        res.status(502).json({
            success: false,
            message: error.message
        });
    }
}

exports.searchPost = async (req, res) => {
    try {
        const { search } = req.query;
        const posts = await Post.find({
            caption: { $regex: search, $options: "i" },
        })
        res.status(200).json({
            success: true,
            posts: posts
        })
    } catch (error) {
        res.status(502).json({
            success: false,
            message: error.message
        });
    }
}

exports.getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().populate("owner");
        res.status(200).json({
            success: true,
            data: posts
        })
    } catch (error) {
        res.status(502).json({
            success: false,
            message: error.message
        });
    }
}



