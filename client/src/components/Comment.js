import React, { useState } from 'react';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import '../styles/Comment.css';

const Comment = ({ comment, onLike, onDislike }) => {
    const [isLiking, setIsLiking] = useState(false);
    const currentUserId = localStorage.getItem('userId');
    
    const likes = comment.likes || [];
    const dislikes = comment.dislikes || [];
    const userName = comment.user?.name || 'Anonymous';

    const handleLike = async () => {
        if (isLiking) return;
        setIsLiking(true);
        try {
            await onLike(comment._id);
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <div className="comment">
            <div className="comment-main">
                <div className="comment-content">
                    <p className="comment-text">{comment.content || comment.text}</p>
                    <span className="comment-author">- {userName}</span>
                </div>
                <div className="comment-actions">
                    <button 
                        className={`action-btn ${likes.includes(currentUserId) ? 'active' : ''}`}
                        onClick={handleLike}
                        disabled={isLiking}
                    >
                        <FaThumbsUp />
                        <span>{likes.length}</span>
                    </button>
                    <button 
                        className={`action-btn ${dislikes.includes(currentUserId) ? 'active' : ''}`}
                        onClick={() => onDislike(comment._id)}
                    >
                        <FaThumbsDown />
                        <span>{dislikes.length}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Comment;
