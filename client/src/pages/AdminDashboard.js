import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaChartBar } from 'react-icons/fa';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
    const [pendingPosts, setPendingPosts] = useState([]);
    const [stats, setStats] = useState({
        totalPosts: 0,
        pendingPosts: 0,
        approvedPosts: 0,
        tagDistribution: []
    });
    const [activeTab, setActiveTab] = useState('pending');

    useEffect(() => {
        fetchPendingPosts();
        fetchStats();
    }, []);

    const fetchPendingPosts = async () => {
        try {
            const response = await fetch('/api/admin/pending-posts', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setPendingPosts(data);
        } catch (error) {
            console.error('Error fetching pending posts:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handlePostAction = async (postId, action) => {
        try {
            await fetch(`/api/admin/posts/${postId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: action })
            });
            fetchPendingPosts();
            fetchStats();
        } catch (error) {
            console.error('Error updating post status:', error);
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <div className="stats-cards">
                    <div className="stat-card">
                        <h3>Total Posts</h3>
                        <p>{stats.totalPosts}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Pending Posts</h3>
                        <p>{stats.pendingPosts}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Approved Posts</h3>
                        <p>{stats.approvedPosts}</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="tab-buttons">
                    <button 
                        className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Pending Posts
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
                        onClick={() => setActiveTab('stats')}
                    >
                        Statistics
                    </button>
                </div>

                {activeTab === 'pending' ? (
                    <div className="pending-posts">
                        {pendingPosts.map(post => (
                            <div key={post._id} className="pending-post-card">
                                <div className="post-info">
                                    <h3>{post.question}</h3>
                                    <span className="post-tag">{post.tag}</span>
                                    <p className="post-author">By: {post.user.name}</p>
                                </div>
                                <div className="post-actions">
                                    <button 
                                        className="approve-btn"
                                        onClick={() => handlePostAction(post._id, 'approved')}
                                    >
                                        <FaCheckCircle /> Approve
                                    </button>
                                    <button 
                                        className="reject-btn"
                                        onClick={() => handlePostAction(post._id, 'rejected')}
                                    >
                                        <FaTimesCircle /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="stats-section">
                        <h2>Tag Distribution</h2>
                        <div className="tag-distribution">
                            {stats.tagDistribution.map(tag => (
                                <div key={tag._id} className="tag-stat">
                                    <span className="tag-name">{tag._id}</span>
                                    <div className="tag-bar" style={{ width: `${(tag.count / stats.totalPosts) * 100}%` }}>
                                        {tag.count}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard; 