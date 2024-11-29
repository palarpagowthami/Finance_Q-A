import React, { useState } from 'react';
import { FaThumbsUp, FaThumbsDown, FaComment, FaTrash, FaEdit } from 'react-icons/fa';
import Comment from './Comment';
import '../styles/PostCard.css';

const PostCard = ({ post, onLike, onDislike, onComment, onDelete, onEdit, activeTab, onRefresh }) => {
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedQuestion, setEditedQuestion] = useState(post.question);
    const [editedTag, setEditedTag] = useState(post.tag);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            await onComment(post._id, commentText);
            setCommentText('');
            setShowCommentInput(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentUserId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('role');
    const isOwnPost = post.user?._id === currentUserId;
    const isAdmin = userRole === 'admin';
    
    const showActionButtons = (isOwnPost || isAdmin) && (activeTab === 'pending' || activeTab === 'my-approved');

    const showEditButton = isOwnPost && (activeTab === 'pending' || activeTab === 'my-approved');

    const handleCommentLike = async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/comments/${commentId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to like comment');
            }
            onRefresh();
        } catch (error) {
            console.error('Like comment error:', error);
        }
    };

    const handleCommentDislike = async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/comments/${commentId}/dislike`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to dislike comment');
            }
            onRefresh();
        } catch (error) {
            console.error('Dislike comment error:', error);
        }
    };

    const handleEdit = async () => {
        try {
            if (!editedQuestion.trim() || !editedTag.trim()) {
                throw new Error('Question and tag are required');
            }

            await onEdit(post._id, {
                question: editedQuestion.trim(),
                tag: editedTag.trim()
            });
            setIsEditing(false);
        } catch (error) {
            console.error('Edit error:', error);
            alert(error.message);
        }
    };

    return (
        <div className="post-card">
            <div className="post-content">
                <div className="post-header">
                    {isEditing ? (
                        <div className="edit-form">
                            <textarea
                                value={editedQuestion}
                                onChange={(e) => setEditedQuestion(e.target.value)}
                                className="edit-question-input"
                                placeholder="Enter your question"
                            />
                            <input
                                type="text"
                                value={editedTag}
                                onChange={(e) => setEditedTag(e.target.value)}
                                className="edit-tag-input"
                                placeholder="Enter tag"
                            />
                            <div className="edit-actions">
                                <button 
                                    className="save-btn"
                                    onClick={handleEdit}
                                >
                                    Save
                                </button>
                                <button 
                                    className="cancel-btn"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditedQuestion(post.question);
                                        setEditedTag(post.tag);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="post-question">{post.question}</div>
                            <div className="post-metadata">
                                <span className="post-tag">{post.tag}</span>
                                <span className="post-author">Posted by: {post.user?.name || 'Anonymous'}</span>
                                {showActionButtons && (
                                    <div className="post-action-buttons">
                                        {showEditButton && (
                                            <button 
                                                className="edit-btn"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                <FaEdit />
                                            </button>
                                        )}
                                        <button 
                                            className="delete-btn"
                                            onClick={() => {
                                                const confirmMessage = isAdmin 
                                                    ? "Are you sure you want to delete this post as an admin?"
                                                    : "Are you sure you want to delete your post?";
                                                if (window.confirm(confirmMessage)) {
                                                    onDelete(post._id);
                                                }
                                            }}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="post-actions">
                <button 
                    className={`action-btn ${post.likes?.includes(localStorage.getItem('userId')) ? 'active' : ''}`}
                    onClick={() => onLike(post._id)}
                >
                    <FaThumbsUp />
                    <span>{post.likes?.length || 0}</span>
                </button>
                
                <button 
                    className={`action-btn ${post.dislikes?.includes(localStorage.getItem('userId')) ? 'active' : ''}`}
                    onClick={() => onDislike(post._id)}
                >
                    <FaThumbsDown />
                    <span>{post.dislikes?.length || 0}</span>
                </button>

                <button 
                    className="action-btn"
                    onClick={() => setShowCommentInput(!showCommentInput)}
                >
                    <FaComment />
                    <span>{post.comments?.length || 0}</span>
                </button>
            </div>

            <div className="comments-section">
                {(showCommentInput || (post.comments && post.comments.length > 0)) && (
                    <h4 className="comments-heading">Comments:</h4>
                )}
                
                {showCommentInput && (
                    <form onSubmit={handleCommentSubmit} className="comment-form">
                        <div className="comment-input-wrapper">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Write a comment..."
                                disabled={isSubmitting}
                                rows="1"
                            />
                            <button 
                                type="submit" 
                                disabled={!commentText.trim() || isSubmitting}
                                className="comment-submit-btn"
                            >
                                <FaComment />
                            </button>
                        </div>
                    </form>
                )}

                <div className="comments-list">
                    {post.comments && post.comments.length > 0 ? (
                        post.comments.map(comment => (
                            <Comment
                                key={comment._id}
                                comment={comment}
                                onLike={handleCommentLike}
                                onDislike={handleCommentDislike}
                            />
                        ))
                    ) : (
                        <p className="no-comments">No comments yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostCard; 