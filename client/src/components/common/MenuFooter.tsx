import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const MenuFooter: React.FC = () => {
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.user.user);

    const handleHomeClick = () => navigate('/');
    const handleSearchClick = () => navigate('/search');
    const handleProfileClick = () => {
        if (user) {
            navigate('/profile');
        } else {
            navigate('/auth');
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-transparent px-4 py-4">
            <div className="container mx-auto flex gap-4 justify-center">
                <button
                    onClick={handleHomeClick}
                    className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-400 hover:bg-gray-100 transition"
                    title="Home"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                </button>
                <button
                    onClick={handleSearchClick}
                    className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-400 hover:bg-gray-100 transition"
                    title="Search"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                </button>
                <button
                    onClick={handleProfileClick}
                    className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-400 hover:bg-gray-100 transition"
                    title={user ? 'Profile' : 'Login'}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default MenuFooter;
