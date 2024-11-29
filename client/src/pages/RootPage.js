import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RootPage.css';

const RootPage = () => {
    const navigate = useNavigate();

    return (
        <div className="root-container" style={{ backgroundImage: `linear-gradient(
            rgba(255, 255, 255, 0.7), 
            rgba(219, 234, 254, 0.65)
        ), url("https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=2071&auto=format&fit=crop")` }}>
            <div className="hero-section">
                <h1>Finance Q&A Platform</h1>
                <p>Join our community to ask questions and share knowledge about finance</p>
                <div className="cta-buttons">
                    <button 
                        className="primary-button"
                        onClick={() => navigate('/login')}
                    >
                        Login
                    </button>
                    <button 
                        className="secondary-button"
                        onClick={() => navigate('/signup')}
                    >
                        Sign Up
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RootPage;
