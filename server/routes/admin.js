const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { adminMiddleware } = require('../middleware/authMiddleware');

router.use(adminMiddleware);

router.get('/pending-posts', async (req, res) => {
    try {
        const posts = await Post.find({ status: 'pending' })
            .populate('user', 'name')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'name'
                }
            })
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/posts/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be either "approved" or "rejected"' });
        }

        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.status === status) {
            return res.status(400).json({ 
                error: `Post is already ${status}`
            });
        }

        post.status = status;
        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate('user', 'name')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'name'
                }
            });

        res.json({
            message: `Post ${status} successfully`,
            post: updatedPost
        });

    } catch (error) {
        console.error('Update post status error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;