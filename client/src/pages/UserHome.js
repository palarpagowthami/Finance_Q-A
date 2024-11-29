import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import CreatePostModal from '../components/CreatePostModal';
import { FaPlus } from 'react-icons/fa';
import '../styles/UserHome.css';

const UserHome = () => {
    const { userId } = useParams();
    const [posts, setPosts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('approved');
    const [searchTag, setSearchTag] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const loggedInUserId = localStorage.getItem('userId');
        if (userId !== loggedInUserId) {
            navigate('/login');
            return;
        }
        fetchPosts();
    }, [activeTab, userId]);

    useEffect(() => {
        if (error) {
            // Clear error after 5 seconds
            const timer = setTimeout(() => {
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        if (activeTab === 'approved') {
            const delayDebounceFn = setTimeout(() => {
                fetchPosts();
            }, 300); // Debounce search for 300ms

            return () => clearTimeout(delayDebounceFn);
        }
    }, [searchTag, activeTab]);

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                navigate('/login');
                return;
            }

            let endpoint = 'approved';
            if (activeTab === 'pending') {
                endpoint = `pending/${userId}`;
            } else if (activeTab === 'my-approved') {
                endpoint = `approved/${userId}`;
            }

            if (activeTab === 'approved' && searchTag.trim()) {
                endpoint = `approved?tag=${encodeURIComponent(searchTag.trim())}`;
            }

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch posts');
            }

            const data = await response.json();
            setPosts(data);
            setError(null);
        } catch (error) {
            console.error('Fetch error:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreatePost = async (postData) => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            const response = await fetch('${process.env.REACT_APP_API_URL}/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                ...postData,
                user: userId  
            })
            });

            if (!response.ok) {
                throw new Error('Failed to create post');
            }

            const newPost = await response.json();
            setIsModalOpen(false);
            setActiveTab('pending'); // Switch to pending posts tab
            fetchPosts(); // Refresh the posts list
        } catch (error) {
            console.error('Fetch error:', error);
            setError(error.message);
        }
    };

    const handleLike = async (postId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to like post');
            }

            fetchPosts();
        } catch (error) {
            console.error('Like error:', error);
            setError(error.message);
        }
    };

    const handleDislike = async (postId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${postId}/dislike`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to dislike post');
            }

            fetchPosts();
        } catch (error) {
            console.error('Dislike error:', error);
            setError(error.message);
        }
    };

    const handleComment = async (postId, commentText) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('${process.env.REACT_APP_API_URL}/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    postId,
                    text: commentText
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add comment');
            }

            await fetchPosts();
        } catch (error) {
            console.error('Comment error:', error);
            setError(error.message);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete post');
            }

            fetchPosts();
        } catch (error) {
            console.error('Delete error:', error);
            setError(error.message);
        }
    };

    const handleEditPost = async (postId, editData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update post');
            }

            await fetchPosts();
        } catch (error) {
            console.error('Edit error:', error);
            setError(error.message);
            throw error;
        }
    };

    return (
        <div className="user-home-container">
            <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            <div className="user-home-content">
                <div className="content-header">
                    <h1>
                        {activeTab === 'approved' ? 'Community Questions' :
                         activeTab === 'pending' ? 'My Pending Questions' :
                         'My Approved Questions'}
                    </h1>
                    <div className="header-actions">
                        {activeTab === 'approved' && (
                            <>
                                <div className="search-container">
                                    <input
                                        type="text"
                                        placeholder="Search by tag..."
                                        value={searchTag}
                                        onChange={(e) => setSearchTag(e.target.value)}
                                        className="search-input"
                                    />
                                </div>
                                <button 
                                    className="create-post-button"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    <FaPlus /> Ask Question
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="error-message" style={{ 
                        position: 'fixed', 
                        top: '20px', 
                        right: '20px',
                        backgroundColor: '#ff5252',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        zIndex: 1000
                    }}>
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading questions...</p>
                    </div>
                ) : (
                    <div className="posts-container">
                        {posts.length === 0 ? (
                            <div className="no-posts">
                                <p>No questions found.</p>
                            </div>
                        ) : (
                            posts.map(post => (
                                <PostCard 
                                    key={post._id} 
                                    post={post}
                                    onRefresh={fetchPosts}
                                    onLike={handleLike}
                                    onDislike={handleDislike}
                                    onComment={handleComment}
                                    onDelete={handleDeletePost}
                                    onEdit={handleEditPost}
                                    activeTab={activeTab}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <CreatePostModal 
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreatePost}
                />
            )}
        </div>
    );
};

export default UserHome;
