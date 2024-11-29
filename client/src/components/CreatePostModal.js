import React, { useState } from 'react';
import '../styles/CreatePostModal.css';

const CreatePostModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        question: '',
        tag: ''
    });
    const [charCount, setCharCount] = useState(0);
    const maxChars = 500; 

    const handleQuestionChange = (e) => {
        const text = e.target.value;
        if (text.length <= maxChars) {
            setFormData({...formData, question: text});
            setCharCount(text.length);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Ask a Question</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="create-post-form">
                    <div className="form-group">
                        <label htmlFor="question">Your Question</label>
                        <textarea
                            id="question"
                            value={formData.question}
                            onChange={handleQuestionChange}
                            placeholder="What's your finance question?"
                            required
                            className="question-textarea"
                            rows="6"
                        />
                        <div className="char-counter">
                            {charCount}/{maxChars} characters
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="tag">Tag</label>
                        <div className="tag-input-container">
                            <input
                                type="text"
                                id="tag"
                                value={formData.tag}
                                onChange={(e) => setFormData({...formData, tag: e.target.value.toLowerCase()})}
                                placeholder="Add a tag (e.g., investment, crypto, real-estate)"
                                required
                                className="tag-input"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={!formData.question.trim() || !formData.tag.trim()}
                        >
                            Submit Question
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal; 