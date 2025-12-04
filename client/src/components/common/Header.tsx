import { signOut } from 'firebase/auth';
import React, { useEffect, useRef, useState } from 'react';
import { FaBars, FaSearch, FaShoppingCart, FaTimes, FaUser } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import { useLogoutUserMutation } from '../../redux/api/user.api';
import { userNotExists } from '../../redux/reducers/user.reducer';
import { RootState } from '../../redux/store';
import { notify } from '../../utils/util';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logout] = useLogoutUserMutation();

  // Toggle mobile menu visibility
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Close mobile menu
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Handle user logout
  const logoutHandler = async () => {
    try {
      await signOut(auth);
      await logout().unwrap();
      dispatch(userNotExists());
      notify('Logout successful', 'success');
      navigate('/auth');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      notify(errorMessage, 'error');
    }
  };

  // Show profile menu on mouse enter
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsProfileMenuOpen(true);
  };

  // Hide profile menu on mouse leave with delay
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsProfileMenuOpen(false);
    }, 250);
  };

  // Close profile menu if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Navigate to the appropriate profile page based on user role
  // const profileHandler = () => {
  //   if (user) {
  //     if (user.role === 'Admin') {
  //       navigate('/admin');
  //     } else {
  //       navigate('/profile');
  //     }
  //   } else {
  //     navigate('/auth');
  //   }
  // };

  return (
    <header className="bg-white text-black border-b border-gray-200 relative z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" onClick={closeMobileMenu} className="flex items-center justify-center w-12 h-12 bg-primary text-white font-bold text-xl">
            SHOP
            <br />
            SPOT
          </Link>
        </div>

        {/* Desktop Menu - Categories */}
        <nav className="hidden md:flex items-center space-x-8 font-bold text-sm">
          <Link to="/products?category=women" className="hover:underline decoration-2 underline-offset-4">WOMEN</Link>
          <Link to="/products?category=men" className="hover:underline decoration-2 underline-offset-4">MEN</Link>
          <Link to="/products?category=kids" className="hover:underline decoration-2 underline-offset-4">KIDS</Link>
          <Link to="/products?category=baby" className="hover:underline decoration-2 underline-offset-4">BABY</Link>
        </nav>

        {/* Right Icons */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/search" className="hover:opacity-70">
            <FaSearch size={20} />
          </Link>

          {/* Profile Menu */}
          <div
            className="relative cursor-pointer hover:opacity-70"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={profileButtonRef}
            onClick={!user ? () => navigate('/auth') : undefined}
          >
            <FaUser size={20} />
            {isProfileMenuOpen && user && (
              <div
                ref={profileMenuRef}
                className="absolute right-0 mt-2 w-48 bg-white text-black border border-gray-200 shadow-lg py-2 z-50"
              >
                <div className="px-4 py-2 border-b border-gray-100 font-bold text-sm">
                  {user.full_name || "User"}
                </div>
                {user.role_id === 1 ? (
                  <>
                    <button onClick={() => navigate('/admin')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-800">Admin Dashboard</button>
                    <button onClick={() => navigate('/profile')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-800">Profile</button>
                    <button onClick={() => navigate('/my-orders')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-800">My Orders</button>
                    <button onClick={logoutHandler} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-800">Logout</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => navigate('/profile')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-800">Profile</button>
                    <button onClick={() => navigate('/my-orders')} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-800">My Orders</button>
                    <button onClick={logoutHandler} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-800">Logout</button>
                  </>
                )}
              </div>
            )}
          </div>

          <Link to="/cart" className="hover:opacity-70 relative">
            <FaShoppingCart size={20} />
            {/* Add cart count badge here if available in state */}
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMobileMenu} className="text-2xl text-black focus:outline-none">
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-0 left-0 w-full h-full bg-white z-40 transition-transform transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex justify-end mb-8">
            <button onClick={closeMobileMenu} className="text-2xl"><FaTimes /></button>
          </div>

          <div className="flex flex-col space-y-6 text-xl font-bold">
            <Link to="/products?category=women" onClick={closeMobileMenu}>WOMEN</Link>
            <Link to="/products?category=men" onClick={closeMobileMenu}>MEN</Link>
            <Link to="/products?category=kids" onClick={closeMobileMenu}>KIDS</Link>
            <Link to="/products?category=baby" onClick={closeMobileMenu}>BABY</Link>
            <hr />
            <Link to="/profile" onClick={closeMobileMenu} className="font-normal text-base">Profile</Link>
            <Link to="/my-orders" onClick={closeMobileMenu} className="font-normal text-base">My Orders</Link>
            {user && (
              <button onClick={() => { logoutHandler(); closeMobileMenu(); }} className="text-left font-normal text-base text-red-600">Logout</button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
