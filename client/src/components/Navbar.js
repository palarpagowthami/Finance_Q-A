import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import '../styles/Navbar.css';

const Navbar = ({ activeTab, setActiveTab }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="nav-content">
                <div className="nav-logo">
                    Finance Q&A
                </div>
                
                <div className="nav-tabs">
                    <button 
                        className={`nav-tab ${activeTab === 'approved' ? 'active' : ''}`}
                        onClick={() => setActiveTab('approved')}
                    >
                        All Posts
                    </button>
                    <button 
                        className={`nav-tab ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        My Pending Posts
                    </button>
                    <button 
                        className={`nav-tab ${activeTab === 'my-approved' ? 'active' : ''}`}
                        onClick={() => setActiveTab('my-approved')}
                    >
                        My Approved Posts
                    </button>
                </div>

                <button className="logout-button" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar; 