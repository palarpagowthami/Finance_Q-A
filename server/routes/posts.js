const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
router.use(authMiddleware);

// Get all approved posts
router.get('/approved', async (req, res) => {
    try {
        console.log('Fetching approved posts');
        let query = { status: 'approved' };
        if (req.query.tag) {
            query.tag = new RegExp(req.query.tag, 'i');
            console.log('Searching for tag:', req.query.tag);
        }

        const posts = await Post.find(query)
            .populate('user', 'name')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'name'
                }
            })
            .sort({ createdAt: -1 });

        console.log(`Found ${posts.length} approved posts`);
        res.json(posts);
    } catch (error) {
        console.error('Error fetching approved posts:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get user's approved posts
router.get('/approved/:userId', async (req, res) => {
    try {
        const posts = await Post.find({ 
            user: req.params.userId,
            status: 'approved'
        }).populate('user', 'name')
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

// Get user's pending posts
router.get('/pending/:userId', async (req, res) => {
    try {
        console.log(`Fetching pending posts for user: ${req.params.userId}`);
        const posts = await Post.find({ 
            user: req.params.userId,
            status: 'pending'
        }).populate('user', 'name')
        .populate({
            path: 'comments',
            populate: {
                path: 'user',
                select: 'name'
            }
        })
        .sort({ createdAt: -1 });
        console.log(`Found ${posts.length} pending posts`);
        res.json(posts);
    } catch (error) {
        console.error('Error fetching pending posts:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create post
router.post('/', async (req, res) => {
    try {
        console.log('Request body:', req.body); 
        console.log('User from token:', req.user); 

        const { question, tag } = req.body;
        const post = new Post({
            user: req.user.userId, 
            question,
            tag,
            status: 'pending'
        });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update a post
router.put('/:id', async (req, res) => {
    try {
        const post = await Post.findOne({
            _id: req.params.id,
            user: req.user.userId 
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found or unauthorized' });
        }
        post.question = req.body.question;
        post.tag = req.body.tag;

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

        res.json(updatedPost);
    } catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Like/Unlike post
router.post('/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const userIndex = post.likes.indexOf(req.user.userId);
        if (userIndex === -1) {
            post.likes.push(req.user.userId);
            const dislikeIndex = post.dislikes.indexOf(req.user.userId);
            if (dislikeIndex > -1) {
                post.dislikes.splice(dislikeIndex, 1);
            }
        } else {
            post.likes.splice(userIndex, 1);
        }

        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Dislike/Un-dislike post
router.post('/:id/dislike', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const userIndex = post.dislikes.indexOf(req.user.userId);
        if (userIndex === -1) {
            post.dislikes.push(req.user.userId);
            const likeIndex = post.likes.indexOf(req.user.userId);
            if (likeIndex > -1) {
                post.likes.splice(likeIndex, 1);
            }
        } else {
            post.dislikes.splice(userIndex, 1);
        }

        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findOne({
            _id: req.params.id,
            user: req.user.userId 
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found or unauthorized' });
        }

        await Post.deleteOne({ _id: req.params.id });
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Approve a post
router.post('/:id/approve', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can approve posts' });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.status === 'approved') {
            return res.status(400).json({ error: 'Post is already approved' });
        }

        post.status = 'approved';
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

        res.json(updatedPost);
    } catch (error) {
        console.error('Approve post error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Reject a post
router.post('/:id/reject', authMiddleware, async (req, res) => {
    try {
        
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can reject posts' });
        }
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.status === 'rejected') {
            return res.status(400).json({ error: 'Post is already rejected' });
        }

        post.status = 'rejected';
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

        res.json(updatedPost);
    } catch (error) {
        console.error('Reject post error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all pending posts (admin only)
router.get('/pending', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can view all pending posts' });
        }

        const pendingPosts = await Post.find({ status: 'pending' })
            .populate('user', 'name')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'name'
                }
            })
            .sort({ createdAt: -1 });

        res.json(pendingPosts);
    } catch (error) {
        console.error('Get pending posts error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
